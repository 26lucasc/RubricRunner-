-- Remove usage tracking (no assignment limits)
DROP TRIGGER IF EXISTS on_assignment_created ON assignments;
DROP FUNCTION IF EXISTS increment_user_assignment_count();
DROP TABLE IF EXISTS user_usage;
