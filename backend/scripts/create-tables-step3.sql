-- ============================================
-- STEP 3: Insert Default Data
-- ============================================
-- Run this after tables and indexes are created
-- ============================================

-- Insert default room types
INSERT INTO room_types (name, slug, description, max_adults, max_children) VALUES
  ('Standard Room', 'standard', 'Comfortable standard room with essential amenities', 3, 1),
  ('Family Room', 'family', 'Spacious family room perfect for families', 4, 2),
  ('Premium Room', 'premium', 'Premium room with enhanced amenities and style', 3, 2),
  ('Superior Room', 'superior', 'Superior room with luxury features and extra space', 2, 1)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (name, description, price_per_night, room_type_id, main_image, max_adults, max_children, size_sqm, amenities, is_available)
SELECT 
  'Superior Deluxe Room', 
  'Luxurious superior room with king-size bed, modern amenities, and stunning views. Perfect for couples seeking comfort and elegance.',
  150.00,
  (SELECT id FROM room_types WHERE slug = 'superior' LIMIT 1),
  '/imgtouse/IMGM8778.JPG',
  2,
  1,
  35,
  '{"wifi": true, "tv": true, "minibar": true, "safe": true, "airConditioning": true, "balcony": true, "bathrobes": true, "hairDryer": true}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Superior Deluxe Room');

INSERT INTO rooms (name, description, price_per_night, room_type_id, main_image, max_adults, max_children, size_sqm, amenities, is_available)
SELECT 
  'Premium Double Room',
  'Elegant premium room with premium bedding, workspace, and premium bathroom fixtures. Ideal for business travelers.',
  120.00,
  (SELECT id FROM room_types WHERE slug = 'premium' LIMIT 1),
  '/imgtouse/IMGM8814.JPG',
  3,
  2,
  32,
  '{"wifi": true, "tv": true, "minibar": true, "safe": true, "airConditioning": true, "workDesk": true, "coffeemaker": true, "hairDryer": true}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Premium Double Room');

INSERT INTO rooms (name, description, price_per_night, room_type_id, main_image, max_adults, max_children, size_sqm, amenities, is_available)
SELECT 
  'Standard Twin Room',
  'Comfortable standard room with twin beds, perfect for friends or colleagues traveling together.',
  80.00,
  (SELECT id FROM room_types WHERE slug = 'standard' LIMIT 1),
  '/imgtouse/1.JPG',
  3,
  1,
  28,
  '{"wifi": true, "tv": true, "airConditioning": true, "safe": true, "hairDryer": true}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Standard Twin Room');

INSERT INTO rooms (name, description, price_per_night, room_type_id, main_image, max_adults, max_children, size_sqm, amenities, is_available)
SELECT 
  'Family Suite',
  'Spacious family suite with separate living area, perfect for families with children. Includes extra beds and child-friendly amenities.',
  180.00,
  (SELECT id FROM room_types WHERE slug = 'family' LIMIT 1),
  '/imgtouse/2.JPG',
  4,
  2,
  45,
  '{"wifi": true, "tv": true, "minibar": true, "safe": true, "airConditioning": true, "livingRoom": true, "extraBeds": true, "childFriendly": true, "hairDryer": true}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Family Suite');

INSERT INTO rooms (name, description, price_per_night, room_type_id, main_image, max_adults, max_children, size_sqm, amenities, is_available)
SELECT 
  'Standard Double Room',
  'Cozy standard room with double bed and all essential amenities for a comfortable stay.',
  85.00,
  (SELECT id FROM room_types WHERE slug = 'standard' LIMIT 1),
  '/imgtouse/3.JPG',
  2,
  1,
  25,
  '{"wifi": true, "tv": true, "airConditioning": true, "safe": true, "hairDryer": true}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Standard Double Room');

INSERT INTO rooms (name, description, price_per_night, room_type_id, main_image, max_adults, max_children, size_sqm, amenities, is_available)
SELECT 
  'Premium King Room',
  'Spacious premium room with king-size bed, luxury linens, and premium bathroom with rainfall shower.',
  135.00,
  (SELECT id FROM room_types WHERE slug = 'premium' LIMIT 1),
  '/imgtouse/4.JPG',
  2,
  1,
  33,
  '{"wifi": true, "tv": true, "minibar": true, "safe": true, "airConditioning": true, "kingBed": true, "rainfallShower": true, "bathrobes": true, "hairDryer": true}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Premium King Room');

INSERT INTO rooms (name, description, price_per_night, room_type_id, main_image, max_adults, max_children, size_sqm, amenities, is_available)
SELECT 
  'Superior Executive Room',
  'Executive-style superior room with workspace, meeting area, and complimentary executive lounge access.',
  165.00,
  (SELECT id FROM room_types WHERE slug = 'superior' LIMIT 1),
  '/imgtouse/5.JPG',
  2,
  0,
  38,
  '{"wifi": true, "tv": true, "minibar": true, "safe": true, "airConditioning": true, "executiveLounge": true, "workDesk": true, "meetingArea": true, "espressoMachine": true, "hairDryer": true}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Superior Executive Room');

INSERT INTO rooms (name, description, price_per_night, room_type_id, main_image, max_adults, max_children, size_sqm, amenities, is_available)
SELECT 
  'Family Connecting Rooms',
  'Two connecting standard rooms perfect for larger families or groups, providing privacy and space.',
  160.00,
  (SELECT id FROM room_types WHERE slug = 'family' LIMIT 1),
  '/imgtouse/6.JPG',
  6,
  3,
  50,
  '{"wifi": true, "tv": true, "airConditioning": true, "safe": true, "connectingRooms": true, "childFriendly": true, "hairDryer": true}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Family Connecting Rooms');


