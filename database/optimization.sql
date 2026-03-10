-- Database Optimization & Security Enhancements

-- 1. Ensure is_banned exists in users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 2. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);

CREATE INDEX IF NOT EXISTS idx_profiles_blood_type ON profiles (blood_type);

CREATE INDEX IF NOT EXISTS idx_profiles_city_id ON profiles (city_id);

CREATE INDEX IF NOT EXISTS idx_requests_status ON donation_requests (status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);

-- 3. Add foreign key constraints if missing
-- (Check if they exist first to avoid errors)

-- 4. Normalize city_id if it's currently a string but should be a reference
-- Note: This depends on whether the 'cities' table is populated with UUIDs.
-- For now, let's just make sure the length is consistent.
ALTER TABLE profiles MODIFY COLUMN city_id VARCHAR(36);

-- 5. Add constraints for data integrity
ALTER TABLE profiles
ADD CONSTRAINT chk_phone_format CHECK (phone REGEXP '^[0-9+ ]+$');