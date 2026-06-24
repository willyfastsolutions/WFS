// local database emulation for WillyFastSolutions dashboard offline & dev persistence
export interface Company {
  id: string;
  name: string;
  active?: boolean;
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
  warning_sent?: boolean;
  revoked?: boolean;
  created_at: string;
}

export interface HourLog {
  id: string;
  machinery_id: string;
  hours: number;
  logged_by: string;
  logged_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  company_id: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  template_id: string;
  label: string;
  category: 'routine' | 'safety' | 'specific';
  created_at: string;
}

export interface MaintenanceChecklistResult {
  id: string;
  maintenance_log_id: string;
  checklist_item_id: string;
  passed: boolean;
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
  reset_physical_horometer?: boolean;
}

// Initial seed data matching database/seed.sql
const initialCompanies: Company[] = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Apex Logistics Corp', active: true },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', name: 'Titan Mining Industries', active: true }
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
    email: 'admin@willyfastsolutions.com',
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
    photo: "/images/forklift.webp",
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
    photo: "/images/skid_steer.webp",
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
    photo: "/images/excavator.webp",
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

const initialTemplates: ChecklistTemplate[] = [
  {
    id: 'temp_routine',
    name: 'Routine Services',
    description: 'Standard technical maintenance checklist items',
    company_id: null,
    created_at: new Date(2026, 4, 1).toISOString()
  },
  {
    id: 'temp_safety',
    name: 'OSHA Safety Checks',
    description: 'Mandatory OSHA-compliant safety items',
    company_id: null,
    created_at: new Date(2026, 4, 1).toISOString()
  }
];

const initialItems: ChecklistItem[] = [
  // Routine Services
  { id: 'item_oil_change', template_id: 'temp_routine', label: 'Engine / Hydraulic Oil Change', category: 'routine', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'item_oil_filter', template_id: 'temp_routine', label: 'Oil Filter Replacement', category: 'routine', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'item_air_filter', template_id: 'temp_routine', label: 'Air Filter Replacement', category: 'routine', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'item_spark_plugs', template_id: 'temp_routine', label: 'Spark / Glow Plugs Check', category: 'routine', created_at: new Date(2026, 4, 1).toISOString() },
  // OSHA Safety Checks
  { id: 'item_battery', template_id: 'temp_safety', label: 'Batteries Connections & Charge', category: 'safety', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'item_lights', template_id: 'temp_safety', label: 'Working Lights & Alarm Signals', category: 'safety', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'item_horn', template_id: 'temp_safety', label: 'Horn & Backup Alert Check', category: 'safety', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'item_ignition', template_id: 'temp_safety', label: 'Ignition System & Controls', category: 'safety', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'item_fuel', template_id: 'temp_safety', label: 'Fuel Lines & Injection Check', category: 'safety', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'item_tires', template_id: 'temp_safety', label: 'Tires & structural integrity check', category: 'safety', created_at: new Date(2026, 4, 1).toISOString() }
];

// LocalStorage & In-Memory Cache Helpers
let memoryCache: { [key: string]: any } = {};
let isDbInitialized = false;

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  if (memoryCache[key] !== undefined) {
    return memoryCache[key] as T;
  }
  try {
    const item = localStorage.getItem(key);
    const parsed = item ? JSON.parse(item) : defaultValue;
    memoryCache[key] = parsed;
    return parsed as T;
  } catch (e) {
    console.warn("localStorage read failed:", e);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  memoryCache[key] = value;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }
  }
};

export const mockDb = {
  initialize: () => {
    if (typeof window === 'undefined') return;
    if (isDbInitialized) return;
    
    try {
      if (!localStorage.getItem('wfs_companies')) {
        setStorageItem('wfs_companies', initialCompanies);
      }
      if (!localStorage.getItem('wfs_profiles')) {
        setStorageItem('wfs_profiles', initialProfiles);
        setStorageItem('wfs_profiles_seeded_v2', 'true');
      } else if (!localStorage.getItem('wfs_profiles_seeded_v2')) {
        const existing = getStorageItem<Profile[]>('wfs_profiles', []);
        const updated = existing.map(p => {
          if (p.role === 'superadmin') {
            return { ...p, email: 'admin@willyfastsolutions.com' };
          }
          return p;
        });
        const hasSuper = updated.some(p => p.role === 'superadmin');
        if (!hasSuper) {
          const superMatch = initialProfiles.find(p => p.role === 'superadmin');
          if (superMatch) updated.push(superMatch);
        }
        setStorageItem('wfs_profiles', updated);
        setStorageItem('wfs_profiles_seeded_v2', 'true');
      }
      if (!localStorage.getItem('wfs_machinery')) {
        setStorageItem('wfs_machinery', initialMachinery);
        setStorageItem('wfs_machinery_seeded_v4', 'true');
      } else if (!localStorage.getItem('wfs_machinery_seeded_v4')) {
        const existing = getStorageItem<Machine[]>('wfs_machinery', []);
        const updated = existing.map(m => {
          const initMatch = initialMachinery.find(im => im.id === m.id);
          if (initMatch) {
            // Protect user's uploaded real photos (base64 string starting with "data:image/" or custom paths)
            const isCustomPhoto = m.photo && (m.photo.startsWith('data:image/') || !m.photo.startsWith('/images/'));
            if (isCustomPhoto) {
              return m; // Keep user's real photo
            }
            return { ...m, photo: initMatch.photo };
          }
          return m;
        });
        const finalMachinery = updated.length > 0 ? updated : initialMachinery;
        setStorageItem('wfs_machinery', finalMachinery);
        setStorageItem('wfs_machinery_seeded_v4', 'true');
      }
      if (!localStorage.getItem('wfs_maintenance_logs')) {
        setStorageItem('wfs_maintenance_logs', initialMaintenanceLogs);
      }
      if (!localStorage.getItem('wfs_hour_logs')) {
        setStorageItem('wfs_hour_logs', []);
      }
      if (!localStorage.getItem('wfs_checklist_templates')) {
        setStorageItem('wfs_checklist_templates', initialTemplates);
      }
      if (!localStorage.getItem('wfs_checklist_items')) {
        setStorageItem('wfs_checklist_items', initialItems);
      }
      if (!localStorage.getItem('wfs_maintenance_checklist_results')) {
        setStorageItem('wfs_maintenance_checklist_results', []);
      }
      if (!localStorage.getItem('wfs_settings')) {
        setStorageItem('wfs_settings', { scan_interval_seconds: 86400, default_maintenance_threshold: 250.0 });
      }
      isDbInitialized = true;
    } catch (e) {
      console.warn("mockDb initialization failed:", e);
    }
  },

  // Auth queries
  getProfileByEmail: (email: string): Profile | null => {
    mockDb.initialize();
    const profiles = getStorageItem<Profile[]>('wfs_profiles', initialProfiles);
    const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    return profile || null;
  },

  getProfiles: (companyId: string): Profile[] => {
    mockDb.initialize();
    const profiles = getStorageItem<Profile[]>('wfs_profiles', initialProfiles);
    return profiles.filter(p => p.company_id === companyId);
  },

  setProfiles: (profiles: Profile[]): void => {
    setStorageItem('wfs_profiles', profiles);
  },

  addProfile: (companyId: string, fields: Omit<Profile, "id" | "company_id">): Profile => {
    mockDb.initialize();
    const profiles = getStorageItem<Profile[]>('wfs_profiles', initialProfiles);
    const newProfile: Profile = {
      id: Math.random().toString(36).substr(2, 9),
      company_id: companyId,
      ...fields
    };
    profiles.push(newProfile);
    setStorageItem('wfs_profiles', profiles);
    return newProfile;
  },

  updateProfile: (id: string, fields: Partial<Profile>): boolean => {
    mockDb.initialize();
    const profiles = getStorageItem<Profile[]>('wfs_profiles', initialProfiles);
    const index = profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...fields };
      setStorageItem('wfs_profiles', profiles);
      return true;
    }
    return false;
  },

  deleteProfile: (id: string): boolean => {
    mockDb.initialize();
    const profiles = getStorageItem<Profile[]>('wfs_profiles', initialProfiles);
    const updated = profiles.filter(p => p.id !== id);
    if (updated.length !== profiles.length) {
      setStorageItem('wfs_profiles', updated);
      return true;
    }
    return false;
  },

  // Company queries
  getCompanies: (): Company[] => {
    mockDb.initialize();
    return getStorageItem<Company[]>('wfs_companies', initialCompanies);
  },

  setCompanies: (comps: Company[]): void => {
    setStorageItem('wfs_companies', comps);
  },

  setMachinery: (macs: Machine[]): void => {
    setStorageItem('wfs_machinery', macs);
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
  getMachinery: (companyId?: string | null, includeRevoked: boolean = false): Machine[] => {
    mockDb.initialize();
    let machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    if (!includeRevoked) {
      machinery = machinery.filter(m => !m.revoked);
    }
    if (companyId) {
      return machinery.filter(m => m.company_id === companyId);
    }
    return machinery;
  },

  addMachine: (machine: Omit<Machine, 'id' | 'created_at'>): Machine => {
    mockDb.initialize();
    const settings = mockDb.getSystemSettings();
    const threshold = settings.default_maintenance_threshold;

    if (machine.current_hours > threshold) {
      throw new Error(`Initial hours cannot exceed ${threshold} hours.`);
    }

    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const newMachine: Machine = {
      ...machine,
      id: 'mac_' + Math.random().toString(36).substr(2, 9),
      maintenance_threshold_hours: threshold, // override with dynamic threshold
      created_at: new Date().toISOString()
    };
    machinery.push(newMachine);
    setStorageItem('wfs_machinery', machinery);
    return newMachine;
  },

  deleteMachine: (id: string): boolean => {
    mockDb.initialize();
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const index = machinery.findIndex(m => m.id === id);
    if (index !== -1) {
      machinery[index].revoked = true;
      setStorageItem('wfs_machinery', machinery);
      return true;
    }
    return false;
  },

  reactivateMachine: (id: string): boolean => {
    mockDb.initialize();
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const index = machinery.findIndex(m => m.id === id);
    if (index !== -1) {
      machinery[index].revoked = false;
      setStorageItem('wfs_machinery', machinery);
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
  performMaintenance: (log: Omit<MaintenanceLog, 'id' | 'performed_at'>, checklistResults?: Omit<MaintenanceChecklistResult, 'id' | 'maintenance_log_id'>[]): MaintenanceLog => {
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

    // Save checklist results if provided
    if (checklistResults && checklistResults.length > 0) {
      const resultsToAdd = checklistResults.map(r => ({
        maintenance_log_id: newLog.id,
        checklist_item_id: r.checklist_item_id,
        passed: r.passed
      }));
      mockDb.addMaintenanceChecklistResults(resultsToAdd);
    }

    // Update machinery last maintenance hours & current hours
    const machinery = getStorageItem<Machine[]>('wfs_machinery', initialMachinery);
    const machineIndex = machinery.findIndex(m => m.id === log.machinery_id);
    if (machineIndex !== -1) {
      if (log.reset_physical_horometer) {
        machinery[machineIndex].current_hours = 0.0;
        machinery[machineIndex].last_maintenance_hours = 0.0;
      } else {
        machinery[machineIndex].last_maintenance_hours = log.hours_at_maintenance;
      }
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
  },

  getChecklistTemplates: (companyId?: string | null): ChecklistTemplate[] => {
    mockDb.initialize();
    const templates = getStorageItem<ChecklistTemplate[]>('wfs_checklist_templates', initialTemplates);
    if (companyId) {
      return templates.filter(t => t.company_id === companyId || t.company_id === null);
    }
    return templates;
  },

  addChecklistTemplate: (name: string, description: string, companyId: string | null): ChecklistTemplate => {
    mockDb.initialize();
    const templates = getStorageItem<ChecklistTemplate[]>('wfs_checklist_templates', initialTemplates);
    const newTemplate: ChecklistTemplate = {
      id: 'temp_' + Math.random().toString(36).substr(2, 9),
      name,
      description,
      company_id: companyId,
      created_at: new Date().toISOString()
    };
    templates.push(newTemplate);
    setStorageItem('wfs_checklist_templates', templates);
    return newTemplate;
  },

  deleteChecklistTemplate: (id: string): boolean => {
    mockDb.initialize();
    const templates = getStorageItem<ChecklistTemplate[]>('wfs_checklist_templates', initialTemplates);
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length !== templates.length) {
      setStorageItem('wfs_checklist_templates', filtered);
      
      // Cascade delete items
      const items = getStorageItem<ChecklistItem[]>('wfs_checklist_items', initialItems);
      const filteredItems = items.filter(i => i.template_id !== id);
      setStorageItem('wfs_checklist_items', filteredItems);
      return true;
    }
    return false;
  },

  getChecklistItems: (templateId?: string): ChecklistItem[] => {
    mockDb.initialize();
    const items = getStorageItem<ChecklistItem[]>('wfs_checklist_items', initialItems);
    if (templateId) {
      return items.filter(i => i.template_id === templateId);
    }
    return items;
  },

  addChecklistItem: (templateId: string, label: string, category: 'routine' | 'safety' | 'specific'): ChecklistItem => {
    mockDb.initialize();
    const items = getStorageItem<ChecklistItem[]>('wfs_checklist_items', initialItems);
    const newItem: ChecklistItem = {
      id: 'item_' + Math.random().toString(36).substr(2, 9),
      template_id: templateId,
      label,
      category,
      created_at: new Date().toISOString()
    };
    items.push(newItem);
    setStorageItem('wfs_checklist_items', items);
    return newItem;
  },

  deleteChecklistItem: (id: string): boolean => {
    mockDb.initialize();
    const items = getStorageItem<ChecklistItem[]>('wfs_checklist_items', initialItems);
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length !== items.length) {
      setStorageItem('wfs_checklist_items', filtered);
      return true;
    }
    return false;
  },

  getMaintenanceChecklistResults: (maintenanceLogId?: string): MaintenanceChecklistResult[] => {
    mockDb.initialize();
    const results = getStorageItem<MaintenanceChecklistResult[]>('wfs_maintenance_checklist_results', []);
    if (maintenanceLogId) {
      return results.filter(r => r.maintenance_log_id === maintenanceLogId);
    }
    return results;
  },

  addMaintenanceChecklistResults: (resultsToAdd: Omit<MaintenanceChecklistResult, 'id'>[]): void => {
    mockDb.initialize();
    const results = getStorageItem<MaintenanceChecklistResult[]>('wfs_maintenance_checklist_results', []);
    const newResults = resultsToAdd.map(r => ({
      id: 'res_' + Math.random().toString(36).substr(2, 9),
      ...r
    }));
    results.push(...newResults);
    setStorageItem('wfs_maintenance_checklist_results', results);
  },

  getSystemSettings: (): { scan_interval_seconds: number; default_maintenance_threshold: number } => {
    mockDb.initialize();
    return getStorageItem<{ scan_interval_seconds: number; default_maintenance_threshold: number }>('wfs_settings', {
      scan_interval_seconds: 86400,
      default_maintenance_threshold: 250.0
    });
  },

  updateSystemSettings: (scanInterval: number, defaultThreshold: number): void => {
    mockDb.initialize();
    setStorageItem('wfs_settings', {
      scan_interval_seconds: scanInterval,
      default_maintenance_threshold: defaultThreshold
    });
  },

  generateMachineReportPDF: (machineId: string): void => {
    console.log(`Generating PDF report for machine ${machineId}...`);
  }
};
