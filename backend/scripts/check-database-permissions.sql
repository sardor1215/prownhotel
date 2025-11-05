-- ============================================
-- Check Database Permissions
-- ============================================
-- Run this in your database SQL Editor to check what permissions you have
-- ============================================

-- Check current user
SELECT current_user, session_user;

-- Check if you can create tables
SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_in_public;

-- Check schema privileges
SELECT 
  schemaname,
  tablename,
  has_table_privilege(current_user, schemaname||'.'||tablename, 'SELECT') AS can_select,
  has_table_privilege(current_user, schemaname||'.'||tablename, 'INSERT') AS can_insert,
  has_table_privilege(current_user, schemaname||'.'||tablename, 'UPDATE') AS can_update,
  has_table_privilege(current_user, schemaname||'.'||tablename, 'DELETE') AS can_delete
FROM pg_tables
WHERE schemaname = 'public'
LIMIT 10;

-- Check if tables already exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admins', 'room_types', 'rooms', 'reservations', 'reservation_rooms');


