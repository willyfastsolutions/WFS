-- Seeding script for willyfastsolutions
-- Note: Profiles table links to auth.users. In a production Supabase project,
-- the users should be created via Supabase Auth, which then propagates to profiles.
-- For local testing or database migration validation, we insert direct mock data.

-- 1. Insert Mock Companies (Tenants)
INSERT INTO companies (id, name) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apex Logistics Corp'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Titan Mining Industries');

-- 2. Insert Mock Profiles (Supabase Auth reference placeholder)
-- Since auth.users is in the auth schema managed by Supabase, we would normally
-- let the signup trigger populate this. For testing RLS queries, we insert manually.
-- WARNING: In a real Supabase DB, you must first create users in auth.users table.
-- Here we assume they exist or we insert them if running in a standard local PG instance.

-- Mocking profiles (Assumes UUIDs mapped from auth.users)
-- Let's define:
-- - User 1: admin@apex.com (Company Admin for Apex Logistics)
-- - User 2: admin@titan.com (Company Admin for Titan Mining)
-- - User 3: super@willyfastsolutions.com (Global Superadmin)

-- Note: We wrap in a block that safely inserts if auth.users exists, otherwise seeds profiles directly.
DO $$
DECLARE
    apex_user_id UUID := '11111111-1111-1111-1111-111111111111';
    titan_user_id UUID := '22222222-2222-2222-2222-222222222222';
    super_user_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
    -- Check if auth schema and users table exist (Supabase environment)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Insert into auth.users first to satisfy FK constraints
        INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
        (apex_user_id, 'admin@apex.com', '{"full_name": "Apex Admin"}'),
        (titan_user_id, 'admin@titan.com', '{"full_name": "Titan Admin"}'),
        (super_user_id, 'super@willyfastsolutions.com', '{"full_name": "WillyFastSolutions Superadmin"}')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Seed profiles
    INSERT INTO profiles (id, company_id, role, full_name, email) VALUES
    (apex_user_id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'company_admin', 'Apex Admin', 'admin@apex.com'),
    (titan_user_id, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'company_admin', 'Titan Admin', 'admin@titan.com'),
    (super_user_id, NULL, 'superadmin', 'WillyFastSolutions Superadmin', 'super@willyfastsolutions.com')
    ON CONFLICT (id) DO NOTHING;
END $$;

-- 3. Insert Mock Machinery (Forklifts, Excavators, Skid steer loaders)
INSERT INTO machinery (id, company_id, name, type, brand, model, serial_number, current_hours, maintenance_threshold_hours, last_maintenance_hours) VALUES
-- Apex Logistics Machinery (Company A)
('f1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apex Forklift 1', 'forklift', 'Toyota', '8FGU25', 'SN-TOY-100234', 150.0, 250.0, 0.0),
('f1111111-2222-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apex Loader 1', 'skid_steer_loader', 'Bobcat', 'S76', 'SN-BOB-987211', 260.0, 250.0, 250.0), -- 10 hours since last maintenance

-- Titan Mining Machinery (Company B)
('e2222222-1111-2222-2222-222222222222', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Titan Excavator XL', 'excavator', 'Caterpillar', '320', 'SN-CAT-554321', 480.0, 250.0, 200.0); -- Needs maintenance (480 - 200 = 280 hours > 250 threshold)

-- 4. Insert Mock Hour Logs
INSERT INTO hour_logs (machinery_id, hours, logged_by) VALUES
('f1111111-1111-1111-1111-111111111111', 50.0, '11111111-1111-1111-1111-111111111111'),
('f1111111-1111-1111-1111-111111111111', 100.0, '11111111-1111-1111-1111-111111111111'),
('f1111111-1111-1111-1111-111111111111', 150.0, '11111111-1111-1111-1111-111111111111'),
('f1111111-2222-1111-1111-111111111111', 250.0, '11111111-1111-1111-1111-111111111111'),
('f1111111-2222-1111-1111-111111111111', 260.0, '11111111-1111-1111-1111-111111111111'),
('e2222222-1111-2222-2222-222222222222', 200.0, '22222222-2222-2222-2222-222222222222'),
('e2222222-1111-2222-2222-222222222222', 480.0, '22222222-2222-2222-2222-222222222222');

-- 5. Insert Mock Maintenance Logs
INSERT INTO maintenance_logs (
    machinery_id, performed_by, hours_at_maintenance,
    oil_change, oil_filter_change, air_filter_change, spark_glow_plugs_change,
    safety_battery, safety_lights, safety_horn, safety_ignition, notes
) VALUES
-- Loader 1 had maintenance done at 250 hours
(
    'f1111111-2222-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 250.0,
    TRUE, TRUE, TRUE, FALSE,
    TRUE, TRUE, TRUE, TRUE, 'Routine 250-hour service and electrical checklist check. All systems functional.'
),
-- Excavator XL had maintenance at 200 hours, currently at 480, needs audit alert
(
    'e2222222-1111-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 200.0,
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, TRUE, 'First scheduled maintenance at 200 hours. Replaced filters and spark plugs.'
);
