# Clean Streak – refactor notes

Drop these files over your project (they replace/extend the originals). **Delete the old files** that were renamed/removed:

| Old | New |
|---|---|
| `components/Card.tsx` | `components/HabitCard.tsx` |
| `app/card/[type].tsx` | `app/habit/[type].tsx` |
| `app/addNew.tsx` | `app/add-habit.tsx` (route is now `/add-habit`) |
| `libs/database.ts` | `libs/database.ts` (new API, below) |

New files: `constants/habits.ts`, `constants/theme.ts`, `utils/datetime.ts`, `hooks/useElapsedTime.ts`, `components/HabitTypeDropdown.tsx`.

## Security / robustness
- **Route param validation**: `/card/<anything>` used to hit the DB with an arbitrary string and hang on "Loading…". The type is now checked against an allow-list (`isHabitType`); unknown or inactive trackers show "Tracker not found".
- **Input validation at the DB boundary**: `startHabit` rejects bad types, impossible dates (`2026-02-31`) and malformed times. All SQL stays parameterised.
- **No more `console.log` of habit data** (this is sensitive information).
- **Generic error messages** to the user; no internal details surfaced. Every async call is wrapped in try/catch (before, any DB failure was an unhandled rejection).
- **Race-free seeding**: `INSERT OR IGNORE` inside a transaction + memoised init, instead of "SELECT then INSERT if empty" run on every focus.
- New installs get `CHECK (active IN (0,1))` and `NOT NULL` on `active`.
- Add screen can no longer silently overwrite an already-running streak (only inactive habits are offered).

## Bug fixes
- Start time picked in the add screen leaked the *current seconds* into the saved time; seconds are now 0.
- Cancelling the Android date/time picker used to apply a change; now only `"set"` events do.
- Invalid stored dates produced `NaN` counters; they now show zeros.
- Home screen used array index as `key` and a `.map` that returned `undefined` for inactive rows; now filtered with a stable key.
- `fontWeight: 300` (number) in styles is invalid in RN typings → `"300"`.
- Modal now closes with the Android back button; save button can't be double-tapped.

## Optimisation / cleanup
- Timer logic, date formatting and watermark-icon mapping were copy-pasted in two screens → one `useElapsedTime` hook, `utils/datetime.ts`, and `HABIT_DEFINITIONS`.
- 5 separate `useState`s per timer → one state object; one query on the home screen instead of two.
- Repeated hex colours → `constants/theme.ts` (values unchanged, so the UI looks identical).
- Removed dead code (`formatDisplayTime` in Card, unused `handleOpen*` wrappers, stray comments).
- Replaced `any` with real types (`Habit`, `HabitType`).

## Renames
`createTable → initializeDatabase`, `returnTable → getAllHabits`, `getHabitByType → getHabit`, `updateHabit → startHabit`, `areAllHabitsActive` (removed; derived from `getAllHabits`), `Card → HabitCard`, `CustomDropdown → HabitTypeDropdown`, `AddNew → AddHabitScreen`, `Index → HomeScreen`, `tabs → habits`, `allHabitsAreActive → canAddHabit`, `handleResetTimer → confirmReset`, `handleDeleteHabit → confirmRemove`.
Rows are now returned as camelCase `Habit` objects (`startDate`, `startTime`, `isActive`).

## Intentionally unchanged
The SQLite table is still called `tab` with the same columns, so existing users keep their data (verified against the original schema). Renaming it would need a migration.

## Still worth doing (outside these files)
- The DB is plain, unencrypted SQLite. For this kind of data consider `allowBackup: false` in `app.json` (Android) and an app lock (biometric/PIN).
- Add `typedRoutes` + a `tsconfig` with the `@/*` alias if not already present.

## Custom wheel pickers
The native date/time pickers were replaced by scrolling wheels built in plain React Native (no dependency): `WheelColumn`, `PickerSheet`, `DatePickerSheet`, `TimePickerSheet`. You can now run `npm uninstall @react-native-community/datetimepicker`.

## Light / dark mode
Follows the device setting. Palettes live in `constants/theme.ts` (`darkColors` = original look, `lightColors`). Components read them through `useThemedStyles` (`hooks/useThemeColors.ts`). Requires `"userInterfaceStyle": "automatic"` in `app.json`.
