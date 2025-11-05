-- ============================================
-- STEP 2: Create Indexes
-- ============================================
-- Run this after tables are created
-- ============================================

CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_available ON rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(guest_email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);


