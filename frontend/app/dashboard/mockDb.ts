// local database emulation for WillyFastSolutions dashboard offline & dev persistence
export interface Company {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'superadmin' | 'company_admin';
  company_id: string | null;
}

export interface Machine {
  id: string;
  company_id: string;
  name: string;
  type: 'forklift' | 'excavator' | 'skid_steer_loader';
  brand: string;
  model: string;
  serial_number: string;
  current_hours: number;
  maintenance_threshold_hours: number;
  last_maintenance_hours: number;
  photo?: string;
  created_at: string;
}

export interface HourLog {
  id: string;
  machinery_id: string;
  hours: number;
  logged_by: string;
  logged_at: string;
}

export interface MaintenanceLog {
  id: string;
  machinery_id: string;
  performed_by: string;
  performed_at: string;
  hours_at_maintenance: number;
  oil_change: boolean;
  oil_filter_change: boolean;
  air_filter_change: boolean;
  spark_glow_plugs_change: boolean;
  safety_battery: boolean;
  safety_lights: boolean;
  safety_horn: boolean;
  safety_ignition: boolean;
  safety_fuel: boolean;
  safety_tires: boolean;
  notes: string;
}

// Initial seed data matching database/seed.sql
const initialCompanies: Company[] = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Apex Logistics Corp' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', name: 'Titan Mining Industries' }
];

const initialProfiles: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@apex.com',
    full_name: 'Apex Admin',
    role: 'company_admin',
    company_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'admin@titan.com',
    full_name: 'Titan Admin',
    role: 'company_admin',
    company_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'support@willyfastsolutions.com',
    full_name: 'WillyFastSolutions Superadmin',
    role: 'superadmin',
    company_id: null
  }
];

const initialMachinery: Machine[] = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    company_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Apex Forklift 1',
    type: 'forklift',
    brand: 'Toyota',
    model: '8FGU25',
    serial_number: 'SN-TOY-100234',
    current_hours: 150.0,
    maintenance_threshold_hours: 250.0,
    last_maintenance_hours: 0.0,
    created_at: new Date(2026, 4, 1).toISOString()
  },
  {
    id: 'f1111111-2222-1111-1111-111111111111',
    company_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Apex Loader 1',
    type: 'skid_steer_loader',
    brand: 'Bobcat',
    model: 'S76',
    serial_number: 'SN-BOB-987211',
    current_hours: 260.0,
    maintenance_threshold_hours: 250.0,
    last_maintenance_hours: 250.0,
    created_at: new Date(2026, 4, 5).toISOString()
  },
  {
    id: 'e2222222-1111-2222-2222-222222222222',
    company_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    name: 'Titan Excavator XL',
    type: 'excavator',
    brand: 'Caterpillar',
    model: '320',
    serial_number: 'SN-CAT-554321',
    current_hours: 480.0,
    maintenance_threshold_hours: 250.0,
    last_maintenance_hours: 200.0,
    created_at: new Date(2026, 4, 10).toISOString()
  }
];

const initialMaintenanceLogs: MaintenanceLog[] = [
  {
    id: 'm1111111-1111-1111-1111-111111111111',
    machinery_id: 'f1111111-2222-1111-1111-111111111111',
    performed_by: '11111111-1111-1111-1111-111111111111',
    performed_at: new Date(2026, 5, 1).toISOString(),
    hours_at_maintenance: 250.0,
    oil_change: true,
    oil_filter_change: true,
    air_filter_change: true,
    spark_glow_plugs_change: false,
    safety_battery: true,
    safety_lights: true,
    safety_horn: true,
    safety_ignition: true,
    safety_fuel: true,
    safety_tires: true,
    notes: 'Routine 250-hour service and electrical checklist check. All systems functional.'
  },
  {
    id: 'm2222222-1111-2222-2222-222222222222',
    machinery_id: 'e2222222-1111-2222-2222-222222222222',
    performed_by: '22222222-2222-2222-2222-222222222222',
    performed_at: new Date(2026, 5, 2).toISOString(),
    hours_at_maintenance: 200.0,
    oil_change: true,
    oil_filter_change: true,
    air_filter_change: true,
    spark_glow_plugs_change: true,
    safety_battery: true,
    safety_lights: true,
    safety_horn: true,
    safety_ignition: true,
    safety_fuel: true,
    safety_tires: true,
    notes: 'First scheduled maintenance at 200 hours. Replaced filters and spark plugs.'
  }
];

// LocalStorage Helpers
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const mockDb = {
  initialize: () => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('wfs_companies')) {
      setStorageItem('wfs_companies', initialCompanies);
    }
    if (!localStorage.getItem('wfs_profiles')) {
      setStorageItem('wfs_profiles', initialProfiles);
    }
    if (!localStorage.getItem('wfs_machinery')) {
      setStorageItem('wfs_machinery', initialMachinery);
    }
    if (!localStorage.getItem('wfs_maintenance_logs')) {
      setStorageItem('wfs_maintenance_logs', initialMaintenanceLogs);
    }
    if (!localStorage.getItem('wfs_hour_logs')) {
      setStorageItem('wfs_hour_logs', []);
    }
  },

  // Auth queries
  getProfileByEmail: (email: string): Profile | null => {
    mockDb.initialize();
    const profiles = getStorageItem<Profile[]>('wfs_profiles', initialProfiles);
    const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    return profile || null;
  },

  // Company queries
  getCompanies: (): Company[] => {
    mockDb.initialize();
    return getStorageItem<Company[]>('wfs_companies', initialCompanies);
  },

  getCompanyById: (id: string): Company | null => {
    mockDb.initialize();
    const companies = getStorageItem<Company[]>('wfs_companies', initialCompanies);
    return companies.find(c => c.id === id) || null;
  },

  addCompany: (name: string): Company => {
    mockDb.initialize();
    const companies = getStorageItem<Company[]>('wfs_companies', initialCompanies);
    const newCompany: Company = {
      id: 'comp_' + Math.random().toString(36).substr(2, 9),
      name: name
    };
    companies.push(newCompany);
    setStorageItem('wfs_companies', companies);
    return newCompany;
  },

  // Machinery queries
  getMachinery: (companyId?: string | null): Machine[] => {
    mockDb.initialize();
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    if (companyId) {
      return machinery.filter(m => m.company_id === companyId);
    }
    return machinery;
  },

  addMachine: (machine: Omit<Machine, 'id' | 'created_at'>): Machine => {
    mockDb.initialize();
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const newMachine: Machine = {
      ...machine,
      id: 'mac_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    machinery.push(newMachine);
    setStorageItem('wfs_machinery', machinery);
    return newMachine;
  },

  deleteMachine: (id: string): boolean => {
    mockDb.initialize();
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const filtered = machinery.filter(m => m.id !== id);
    if (filtered.length !== machinery.length) {
      setStorageItem('wfs_machinery', filtered);
      return true;
    }
    return false;
  },

  updateMachine: (id: string, fields: Partial<Machine>): boolean => {
    mockDb.initialize();
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const index = machinery.findIndex(m => m.id === id);
    if (index !== -1) {
      machinery[index] = { ...machinery[index], ...fields };
      setStorageItem('wfs_machinery', machinery);
      return true;
    }
    return false;
  },

  logHours: (machineId: string, hours: number, userId: string): boolean => {
    mockDb.initialize();
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const machineIndex = machinery.findIndex(m => m.id === machineId);
    if (machineIndex !== -1) {
      // Validate hours logged is >= current hours
      if (hours < machinery[machineIndex].current_hours) {
        return false;
      }
      machinery[machineIndex].current_hours = hours;
      setStorageItem('wfs_machinery', machinery);

      // Add to hour logs
      const hourLogs = getStorageItem<HourLog[]>('wfs_hour_logs', []);
      hourLogs.push({
        id: 'hl_' + Math.random().toString(36).substr(2, 9),
        machinery_id: machineId,
        hours: hours,
        logged_by: userId,
        logged_at: new Date().toISOString()
      });
      setStorageItem('wfs_hour_logs', hourLogs);
      return true;
    }
    return false;
  },

  // Maintenance queries
  performMaintenance: (log: Omit<MaintenanceLog, 'id' | 'performed_at'>): MaintenanceLog => {
    mockDb.initialize();
    
    // Create log
    const logs = getStorageItem<MaintenanceLog[]>('wfs_maintenance_logs', initialMaintenanceLogs);
    const newLog: MaintenanceLog = {
      ...log,
      id: 'ml_' + Math.random().toString(36).substr(2, 9),
      performed_at: new Date().toISOString()
    };
    logs.push(newLog);
    setStorageItem('wfs_maintenance_logs', logs);

    // Update machinery last maintenance hours
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const machineIndex = machinery.findIndex(m => m.id === log.machinery_id);
    if (machineIndex !== -1) {
      machinery[machineIndex].last_maintenance_hours = log.hours_at_maintenance;
      setStorageItem('wfs_machinery', machinery);
    }

    return newLog;
  },

  getMaintenanceLogs: (companyId?: string | null): (MaintenanceLog & { machineName: string; machineSerial: string })[] => {
    mockDb.initialize();
    const logs = getStorageItem<MaintenanceLog[]>('wfs_maintenance_logs', initialMaintenanceLogs);
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    
    const mappedLogs = logs.map(l => {
      const machine = machinery.find(m => m.id === l.machinery_id);
      return {
        ...l,
        machineName: machine ? machine.name : 'Unknown Machine',
        machineSerial: machine ? machine.serial_number : 'N/A',
        machineCompanyId: machine ? machine.company_id : ''
      };
    });

    if (companyId) {
      return mappedLogs.filter(l => l.machineCompanyId === companyId);
    }
    return mappedLogs;
  }
};
