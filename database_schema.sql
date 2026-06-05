-- SQL Schema for willyfastsolutions
-- Supabase PostgreSQL with B2B Tenant Isolation (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE (Tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES TABLE (Users linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'company_admin')),
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is a superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql;

-- Helper function to get the company_id of the current user
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql;

-- 3. MACHINERY TABLE
CREATE TABLE machinery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('forklift', 'excavator', 'skid_steer_loader')),
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    current_hours NUMERIC(10, 2) DEFAULT 0.0 NOT NULL CHECK (current_hours >= 0),
    maintenance_threshold_hours NUMERIC(10, 2) DEFAULT 250.0 NOT NULL CHECK (maintenance_threshold_hours > 0),
    last_maintenance_hours NUMERIC(10, 2) DEFAULT 0.0 NOT NULL CHECK (last_maintenance_hours >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on machinery
ALTER TABLE machinery ENABLE ROW LEVEL SECURITY;

-- 4. HOUR LOGS TABLE
CREATE TABLE hour_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machinery_id UUID NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
    hours NUMERIC(10, 2) NOT NULL CHECK (hours >= 0),
    logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on hour_logs
ALTER TABLE hour_logs ENABLE ROW LEVEL SECURITY;

-- Trigger to update machinery.current_hours when a new hour log is inserted
CREATE OR REPLACE FUNCTION update_machinery_hours()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE machinery
    SET current_hours = NEW.hours
    WHERE id = NEW.machinery_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_machinery_hours
AFTER INSERT ON hour_logs
FOR EACH ROW
EXECUTE FUNCTION update_machinery_hours();

-- 5. MAINTENANCE LOGS TABLE
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machinery_id UUID NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    hours_at_maintenance NUMERIC(10, 2) NOT NULL CHECK (hours_at_maintenance >= 0),
    
    -- Routine Services Checklist
    oil_change BOOLEAN DEFAULT FALSE NOT NULL,
    oil_filter_change BOOLEAN DEFAULT FALSE NOT NULL,
    air_filter_change BOOLEAN DEFAULT FALSE NOT NULL,
    spark_glow_plugs_change BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Safety Checklist (Mandatory Validation)
    safety_battery BOOLEAN DEFAULT FALSE NOT NULL,
    safety_lights BOOLEAN DEFAULT FALSE NOT NULL,
    safety_horn BOOLEAN DEFAULT FALSE NOT NULL,
    safety_ignition BOOLEAN DEFAULT FALSE NOT NULL,
    
    notes TEXT
);

-- Enable RLS on maintenance_logs
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Trigger to update machinery.last_maintenance_hours when maintenance is recorded
CREATE OR REPLACE FUNCTION update_machinery_last_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE machinery
    SET last_maintenance_hours = NEW.hours_at_maintenance
    WHERE id = NEW.machinery_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_machinery_last_maintenance
AFTER INSERT ON maintenance_logs
FOR EACH ROW
EXECUTE FUNCTION update_machinery_last_maintenance();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- 1. COMPANIES POLICIES
CREATE POLICY company_select_policy ON companies
    FOR SELECT
    USING (is_superadmin() OR id = get_user_company_id());

CREATE POLICY company_update_policy ON companies
    FOR UPDATE
    USING (is_superadmin() OR id = get_user_company_id());

CREATE POLICY company_admin_all_policy ON companies
    FOR ALL
    USING (is_superadmin());

-- 2. PROFILES POLICIES
CREATE POLICY profile_select_policy ON profiles
    FOR SELECT
    USING (is_superadmin() OR company_id = get_user_company_id());

CREATE POLICY profile_self_update_policy ON profiles
    FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY profile_admin_all_policy ON profiles
    FOR ALL
    USING (is_superadmin());

-- 3. MACHINERY POLICIES
CREATE POLICY machinery_select_policy ON machinery
    FOR SELECT
    USING (is_superadmin() OR company_id = get_user_company_id());

CREATE POLICY machinery_insert_policy ON machinery
    FOR INSERT
    WITH CHECK (is_superadmin() OR company_id = get_user_company_id());

CREATE POLICY machinery_update_policy ON machinery
    FOR UPDATE
    USING (is_superadmin() OR company_id = get_user_company_id());

CREATE POLICY machinery_delete_policy ON machinery
    FOR DELETE
    USING (is_superadmin() OR company_id = get_user_company_id());

-- 4. HOUR LOGS POLICIES
CREATE POLICY hour_logs_select_policy ON hour_logs
    FOR SELECT
    USING (
        is_superadmin() OR 
        EXISTS (
            SELECT 1 FROM machinery 
            WHERE machinery.id = hour_logs.machinery_id 
            AND machinery.company_id = get_user_company_id()
        )
    );

CREATE POLICY hour_logs_insert_policy ON hour_logs
    FOR INSERT
    WITH CHECK (
        is_superadmin() OR 
        EXISTS (
            SELECT 1 FROM machinery 
            WHERE machinery.id = hour_logs.machinery_id 
            AND machinery.company_id = get_user_company_id()
        )
    );

-- 5. MAINTENANCE LOGS POLICIES
CREATE POLICY maintenance_logs_select_policy ON maintenance_logs
    FOR SELECT
    USING (
        is_superadmin() OR 
        EXISTS (
            SELECT 1 FROM machinery 
            WHERE machinery.id = maintenance_logs.machinery_id 
            AND machinery.company_id = get_user_company_id()
        )
    );

CREATE POLICY maintenance_logs_insert_policy ON maintenance_logs
    FOR INSERT
    WITH CHECK (
        is_superadmin() OR 
        EXISTS (
            SELECT 1 FROM machinery 
            WHERE machinery.id = maintenance_logs.machinery_id 
            AND machinery.company_id = get_user_company_id()
        )
    );

-- ==========================================
-- INDEXES FOR PERFORMANCE & LOOKUPS
-- ==========================================
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_machinery_company_id ON machinery(company_id);
CREATE INDEX idx_hour_logs_machinery_id ON hour_logs(machinery_id);
CREATE INDEX idx_maintenance_logs_machinery_id ON maintenance_logs(machinery_id);
