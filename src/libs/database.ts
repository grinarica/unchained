import { HABIT_TYPES, isHabitType, type HabitType } from "@/constants/habits";
import { isValidDateString, isValidTimeString } from "@/utils/datetime";
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "unchained";

// NOTE: the table and column names below are kept as-is so existing installs keep their data.
const HABIT_TABLE = "tab";

const DEFAULT_START_DATE = "2026-01-01";
const DEFAULT_START_TIME = "00:00:00";

export interface Habit {
    id: number;
    type: HabitType;
    /** Local date, "YYYY-MM-DD". */
    startDate: string;
    /** Local time, "HH:mm:ss". */
    startTime: string;
    isActive: boolean;
}

interface HabitRow {
    id: number;
    type: string;
    start_date: string;
    start_time: string;
    active: number;
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initializationPromise: Promise<void> | null = null;

/** Opens the database lazily, once. A failed open is not cached, so the next call can retry. */
function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!databasePromise) {
        databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).catch((error) => {
            databasePromise = null;
            throw error;
        });
    }
    return databasePromise;
}

/** Creates the schema and seeds one inactive row per habit type. Safe to call repeatedly. */
export function initializeDatabase(): Promise<void> {
    if (!initializationPromise) {
        initializationPromise = runInitialization().catch((error) => {
            initializationPromise = null;
            throw error;
        });
    }
    return initializationPromise;
}

async function runInitialization(): Promise<void> {
    const database = await getDatabase();

    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS ${HABIT_TABLE} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT UNIQUE NOT NULL,
            start_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0, 1))
        );
    `);

    // INSERT OR IGNORE + the UNIQUE constraint makes seeding idempotent and race-free.
    await database.withTransactionAsync(async () => {
        for (const type of HABIT_TYPES) {
            await database.runAsync(
                `INSERT OR IGNORE INTO ${HABIT_TABLE} (type, start_date, start_time, active) VALUES (?, ?, ?, 0)`,
                [type, DEFAULT_START_DATE, DEFAULT_START_TIME],
            );
        }
    });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps a raw row to a Habit, or null if the row holds an unrecognised type. */
function toHabit(row: HabitRow): Habit | null {
    if (!isHabitType(row.type)) return null;

    return {
        id: row.id,
        type: row.type,
        startDate: row.start_date,
        startTime: row.start_time,
        isActive: row.active === 1,
    };
}

function assertHabitType(type: unknown): asserts type is HabitType {
    if (!isHabitType(type)) {
        throw new Error("Invalid habit type.");
    }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Every known habit, active or not, in a stable order. */
export async function getAllHabits(): Promise<Habit[]> {
    const database = await getDatabase();
    const rows = await database.getAllAsync<HabitRow>(`SELECT * FROM ${HABIT_TABLE} ORDER BY id`);

    return rows.map(toHabit).filter((habit): habit is Habit => habit !== null);
}

/** A single habit, or null if it does not exist. */
export async function getHabit(type: HabitType): Promise<Habit | null> {
    assertHabitType(type);

    const database = await getDatabase();
    const row = await database.getFirstAsync<HabitRow>(
        `SELECT * FROM ${HABIT_TABLE} WHERE type = ?`,
        [type],
    );

    return row ? toHabit(row) : null;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Activates a habit (or restarts it) with the given local start date and time. */
export async function startHabit(type: HabitType, startDate: string, startTime: string): Promise<void> {
    assertHabitType(type);
    if (!isValidDateString(startDate)) throw new Error("Invalid start date.");
    if (!isValidTimeString(startTime)) throw new Error("Invalid start time.");

    const database = await getDatabase();
    const result = await database.runAsync(
        `UPDATE ${HABIT_TABLE} SET start_date = ?, start_time = ?, active = 1 WHERE type = ?`,
        [startDate, startTime, type],
    );

    if (result.changes === 0) throw new Error("Habit not found.");
}

/** Hides a habit from the home screen. */
export async function deactivateHabit(type: HabitType): Promise<void> {
    assertHabitType(type);

    const database = await getDatabase();
    await database.runAsync(`UPDATE ${HABIT_TABLE} SET active = 0 WHERE type = ?`, [type]);
}
