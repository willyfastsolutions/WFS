"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building, 
  Plus, 
  Check, 
  ShieldAlert, 
  Activity, 
  Clock,
  Briefcase,
  Trash2,
  Power,
  Loader2,
  Lock,
  AlertTriangle,
  X,
  Users,
  Edit,
  Search,
  Mail
} from "lucide-react";
import { Profile, Company, Machine, mockDb } from "../mockDb";

export default function B2BCompanies() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [machinery, setMachinery] = useState<Machine[]>([]);
  
  // Form States
  const [companyName, setCompanyName] = useState("");
  const [maintenanceThreshold, setMaintenanceThreshold] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const startEditCompany = (comp: Company) => {
    setEditingCompany(comp);
    setCompanyName(comp.name);
    setMaintenanceThreshold(comp.maintenance_threshold ? String(comp.maintenance_threshold) : "");
    setStatus(null);
  };

  const cancelEditCompany = () => {
    setEditingCompany(null);
    setCompanyName("");
    setMaintenanceThreshold("");
    setStatus(null);
  };

  // Modal Authorization States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "toggle-active">("toggle-active");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // Users Modal States
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersModalCompany, setUsersModalCompany] = useState<Company | null>(null);
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [userFormMode, setUserFormMode] = useState<"list" | "create" | "edit">("list");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  
  // User Form Input States
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<'company_admin' | 'superadmin'>("company_admin");
  const [userPassword, setUserPassword] = useState("");
  const [userError, setUserError] = useState<string | null>(null);
  const [isUserSubmitting, setIsUserSubmitting] = useState(false);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);
  const [userSuccessMessage, setUserSuccessMessage] = useState<string | null>(null);
  const [resendInviteOnEdit, setResendInviteOnEdit] = useState(false);

  const openUsersModal = async (company: Company) => {
    setUsersModalCompany(company);
    setUserFormMode("list");
    setUserError(null);
    setUserSuccessMessage(null);
    setShowUsersModal(true);
    await fetchCompanyUsers(company.id);
  };

  const fetchCompanyUsers = async (companyId: string) => {
    setIsFetchingUsers(true);
    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }
        if (response.ok) {
          const data = await response.json() as Profile[];
          setUsersList(data);
          mockDb.setProfiles(data); // Sync local mockDb
          setIsFetchingUsers(false);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch company users from API, using mockDb fallback:", err);
      }
    }

    // Fallback
    const data = mockDb.getProfiles(companyId);
    setUsersList(data);
    setIsFetchingUsers(false);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);

    if (!userFullName.trim() || !userEmail.trim()) {
      setUserError("Full Name and Email are required.");
      return;
    }

    if (!usersModalCompany) return;

    setIsUserSubmitting(true);
    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        let response;
        if (userFormMode === "create") {
          response = await fetch(`${API_BASE_URL}/api/companies/${usersModalCompany.id}/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              full_name: userFullName.trim(),
              email: userEmail.trim().toLowerCase(),
              role: userRole,
              company_id: usersModalCompany.id
            })
          });
        } else {
          // Edit
          if (!selectedUser) return;
          response = await fetch(`${API_BASE_URL}/api/companies/users/${selectedUser.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              full_name: userFullName.trim(),
              email: userEmail.trim().toLowerCase(),
              password: userPassword || undefined,
              role: userRole,
              resend_invite: resendInviteOnEdit
            })
          });
        }

        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }

        if (response.ok) {
          if (resendInviteOnEdit) {
            setUserSuccessMessage(`User updated and invitation email dispatched to ${userEmail.trim().toLowerCase()}!`);
          } else {
            setUserSuccessMessage("User updated successfully!");
          }
          setUserFullName("");
          setUserEmail("");
          setUserPassword("");
          setUserRole("company_admin");
          setSelectedUser(null);
          setResendInviteOnEdit(false);
          setUserFormMode("list");
          await fetchCompanyUsers(usersModalCompany.id);
          setIsUserSubmitting(false);
          return;
        } else {
          const errData = await response.json();
          setUserError(errData.detail || "Failed to save user.");
          setIsUserSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("API error during user management:", err);
        setUserError("Server communication error.");
        setIsUserSubmitting(false);
        return;
      }
    }

    // Offline / Fallback
    setTimeout(() => {
      try {
        if (userFormMode === "create") {
          mockDb.addProfile(usersModalCompany.id, {
            full_name: userFullName.trim(),
            email: userEmail.trim().toLowerCase(),
            role: userRole
          });
        } else {
          if (!selectedUser) return;
          mockDb.updateProfile(selectedUser.id, {
            full_name: userFullName.trim(),
            email: userEmail.trim().toLowerCase(),
            role: userRole
          });
        }

        setUserFullName("");
        setUserEmail("");
        setUserPassword("");
        setUserRole("company_admin");
        setSelectedUser(null);
        setUserFormMode("list");
        fetchCompanyUsers(usersModalCompany.id);
      } catch (err) {
        setUserError("Failed to save user in mock storage.");
      } finally {
        setIsUserSubmitting(false);
      }
    }, 800);
  };

  const handleUserDelete = async (targetUser: Profile) => {
    if (!usersModalCompany) return;
    if (!confirm(`Are you sure you want to delete user "${targetUser.full_name}"?`)) {
      return;
    }

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const response = await fetch(`${API_BASE_URL}/api/companies/users/${targetUser.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }

        if (response.ok) {
          await fetchCompanyUsers(usersModalCompany.id);
          return;
        } else {
          const errData = await response.json();
          alert(errData.detail || "Failed to delete user.");
          return;
        }
      } catch (err) {
        console.error("API error during user deletion:", err);
        alert("Server communication error.");
        return;
      }
    }

    // Offline / Fallback
    mockDb.deleteProfile(targetUser.id);
    fetchCompanyUsers(usersModalCompany.id);
  };

  const handleResendInvite = async (targetUser: Profile) => {
    if (!usersModalCompany) return;
    setResendingUserId(targetUser.id);
    setUserSuccessMessage(null);
    setUserError(null);

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const response = await fetch(`${API_BASE_URL}/api/companies/users/${targetUser.id}/resend-invite`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setUserSuccessMessage(data.message || `Credentials email successfully resent to ${targetUser.email}`);
        } else {
          const errData = await response.json();
          setUserError(errData.detail || "Failed to resend credentials email.");
        }
      } catch (err) {
        setUserError("Server communication error while resending credentials.");
      } finally {
        setResendingUserId(null);
      }
    } else {
      // Mock fallback
      setTimeout(() => {
        setUserSuccessMessage(`(Offline Mode) Credentials reset for ${targetUser.email}`);
        setResendingUserId(null);
      }, 500);
    }
  };

  const startCreateUser = () => {
    setUserFullName("");
    setUserEmail("");
    setUserPassword("");
    setUserRole("company_admin");
    setSelectedUser(null);
    setUserError(null);
    setUserSuccessMessage(null);
    setResendInviteOnEdit(false);
    setUserFormMode("create");
  };

  const startEditUser = (targetUser: Profile) => {
    setSelectedUser(targetUser);
    setUserFullName(targetUser.full_name);
    setUserEmail(targetUser.email);
    setUserRole(targetUser.role);
    setUserPassword("");
    setUserError(null);
    setUserSuccessMessage(null);
    setResendInviteOnEdit(false);
    setUserFormMode("edit");
  };

  const refreshData = async () => {
    if (typeof window !== "undefined") {
      const sessionStr = sessionStorage.getItem("wfs_session");
      if (sessionStr) {
        const profile = JSON.parse(sessionStr) as Profile;
        setUser(profile);
        
        // Guard: Only Superadmin can access this page
        if (profile.role !== "superadmin") {
          router.push("/dashboard");
          return;
        }

        const isOffline = window.location.protocol === "file:";
        const API_BASE_URL = (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "";

        const macs = mockDb.getMachinery();
        setMachinery(macs);

        if (!isOffline) {
          try {
            const token = sessionStorage.getItem("wfs_token");
            const response = await fetch(`${API_BASE_URL}/api/companies/`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            if (response.status === 401) {
              sessionStorage.removeItem("wfs_token");
              sessionStorage.removeItem("wfs_role");
              sessionStorage.removeItem("wfs_session");
              router.push("/login");
              return;
            }
            if (response.ok) {
              const data = await response.json() as Company[];
              setCompanies(data);
              // Sync to local storage for offline fallback compatibility
              mockDb.setCompanies(data);
              return;
            }
          } catch (err) {
            console.warn("Could not fetch companies from API, using mockDb fallback:", err);
          }
        }

        // Fallback to local storage
        const comps = mockDb.getCompanies();
        setCompanies(comps);
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!companyName.trim()) {
      setStatus({ type: "error", text: "Please enter a valid company name." });
      return;
    }

    // Name collision check only if registering new company or name changes on edit
    const isNewName = !editingCompany || editingCompany.name.toLowerCase() !== companyName.trim().toLowerCase();
    if (isNewName) {
      const exists = companies.some(c => c.name.toLowerCase() === companyName.trim().toLowerCase());
      if (exists) {
        setStatus({ type: "error", text: "A company with this name is already registered." });
        return;
      }
    }

    setIsSubmitting(true);

    const thresholdVal = maintenanceThreshold.trim() ? parseFloat(maintenanceThreshold) : null;
    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const url = editingCompany
          ? `${API_BASE_URL}/api/companies/${editingCompany.id}`
          : `${API_BASE_URL}/api/companies/`;
        const method = editingCompany ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            name: companyName.trim(),
            maintenance_threshold: thresholdVal
          })
        });

        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }

        if (response.ok) {
          setStatus({ 
            type: "success", 
            text: editingCompany 
              ? "B2B Company settings updated successfully!" 
              : "B2B Company registered successfully!" 
          });
          setCompanyName("");
          setMaintenanceThreshold("");
          setEditingCompany(null);
          refreshData();
          setIsSubmitting(false);
          return;
        } else {
          const errData = await response.json();
          setStatus({ type: "error", text: errData.detail || "Failed to save company." });
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("API error, failing back to mockDb:", err);
      }
    }

    // Offline / Fallback
    setTimeout(() => {
      try {
        if (editingCompany) {
          mockDb.updateCompany(editingCompany.id, companyName.trim(), thresholdVal || undefined);
          setStatus({ type: "success", text: "B2B Company settings updated successfully!" });
        } else {
          mockDb.addCompany(companyName.trim(), thresholdVal || undefined);
          setStatus({ type: "success", text: "B2B Company registered successfully!" });
        }
        setCompanyName("");
        setMaintenanceThreshold("");
        setEditingCompany(null);
        refreshData();
      } catch (err) {
        setStatus({ type: "error", text: "Failed to save company." });
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  const openConfirmation = (action: "delete" | "toggle-active", company: Company) => {
    setConfirmAction(action);
    setSelectedCompany(company);
    setConfirmPassword("");
    setModalError(null);
    setShowConfirmModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!confirmPassword) {
      setModalError("Please enter your password to authorize this action.");
      return;
    }

    if (!selectedCompany) return;

    setIsModalSubmitting(true);

    const isOffline = typeof window !== "undefined" && window.location.protocol === "file:";
    const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

    if (!isOffline) {
      try {
        const token = sessionStorage.getItem("wfs_token");
        const endpoint = confirmAction === "delete"
          ? `${API_BASE_URL}/api/companies/${selectedCompany.id}`
          : `${API_BASE_URL}/api/companies/${selectedCompany.id}/toggle-active`;
        
        const method = confirmAction === "delete" ? "DELETE" : "PATCH";

        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ password: confirmPassword })
        });

        if (response.status === 401) {
          sessionStorage.removeItem("wfs_token");
          sessionStorage.removeItem("wfs_role");
          sessionStorage.removeItem("wfs_session");
          router.push("/login");
          return;
        }

        if (response.ok) {
          setShowConfirmModal(false);
          setConfirmPassword("");
          setSelectedCompany(null);
          refreshData();
          
          if (confirmAction === "delete") {
            setStatus({ type: "success", text: "B2B Company and all associated accounts/machines deleted successfully!" });
          } else {
            setStatus({ type: "success", text: "B2B Company status toggled successfully!" });
          }
          setIsModalSubmitting(false);
          return;
        } else {
          const errData = await response.json();
          setModalError(errData.detail || "Authentication check failed. Please check your password.");
          setIsModalSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("API error during authorization:", err);
        setModalError("Server communication error. Cannot verify credentials.");
        setIsModalSubmitting(false);
        return;
      }
    }

    // Offline / MockDb Fallback
    setTimeout(() => {
      try {
        if (confirmPassword !== "admin1234") {
          setModalError("Invalid password confirmation. Please enter your password.");
          setIsModalSubmitting(false);
          return;
        }

        const comps = mockDb.getCompanies();
        if (confirmAction === "delete") {
          // Delete from local storage mockDb
          const updatedComps = comps.filter(c => c.id !== selectedCompany.id);
          mockDb.setCompanies(updatedComps);
          
          // Also delete associated machinery in local storage
          const macs = mockDb.getMachinery();
          const updatedMacs = macs.filter(m => m.company_id !== selectedCompany.id);
          mockDb.setMachinery(updatedMacs);
          
          setStatus({ type: "success", text: "B2B Company and all associated assets deleted successfully!" });
        } else {
          // Toggle active
          const updatedComps = comps.map(c => {
            if (c.id === selectedCompany.id) {
              return { ...c, active: !c.active };
            }
            return c;
          });
          mockDb.setCompanies(updatedComps);
          setStatus({ type: "success", text: "B2B Company status toggled successfully!" });
        }

        setShowConfirmModal(false);
        setConfirmPassword("");
        setSelectedCompany(null);
        refreshData();
      } catch (err) {
        setModalError("Failed to update data.");
      } finally {
        setIsModalSubmitting(false);
      }
    }, 1000);
  };

  // Get asset count per company
  const getAssetCount = (companyId: string) => {
    return machinery.filter(m => m.company_id === companyId).length;
  };

  // Filtered companies based on search query
  const filteredCompanies = companies.filter(comp =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Building className="h-6 w-6 text-zinc-400" /> B2B Companies Directory
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Add new client corporations, toggle active status, or delete accounts from the system.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Register Company Form (Span 1) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              {editingCompany ? (
                <>
                  <Edit className="h-4 w-4 text-zinc-400" /> Edit B2B Client
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-zinc-400" /> Register B2B Client
                </>
              )}
            </h3>

            {status && (
              <div className={`p-3 rounded-lg text-xs border transition-all duration-300 ${
                status.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                {status.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="comp-name" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Company Name</label>
                <input
                  type="text"
                  id="comp-name"
                  placeholder="e.g. Delta Transport Inc."
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="comp-threshold" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Maintenance Threshold (Hours)</label>
                <input
                  type="number"
                  id="comp-threshold"
                  min="1"
                  placeholder="e.g. 250 (leave empty for machine default)"
                  value={maintenanceThreshold}
                  onChange={(e) => setMaintenanceThreshold(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-zinc-800 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? "Saving Company..." : (editingCompany ? "Save Changes" : "Register Company")}
                </button>
                {editingCompany && (
                  <button
                    type="button"
                    onClick={cancelEditCompany}
                    className="w-full inline-flex h-10 items-center justify-center rounded-lg border border-zinc-950 bg-zinc-900/20 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Companies List (Span 3) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Briefcase className="h-4 w-4 text-zinc-400" /> B2B Clients Registry
            </h3>

            {companies.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-900 bg-zinc-950/50 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
                />
              </div>
            )}

            {companies.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                No B2B companies found in the registry.
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                No companies match your search "{searchQuery}".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">Company Name</th>
                      <th className="py-3 px-2">Database ID</th>
                      <th className="py-3 px-2 text-center">Threshold</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-center">Active Assets</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {filteredCompanies.map(comp => (
                      <tr key={comp.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="py-4 px-2 font-bold text-zinc-200">
                          {comp.name}
                        </td>
                        <td className="py-4 px-2 text-zinc-500 font-mono cursor-help" title={comp.id}>
                          {comp.id.substring(0, 8)}...{comp.id.substring(comp.id.length - 4)}
                        </td>
                        <td className="py-4 px-2 text-center font-mono text-zinc-400">
                          {comp.maintenance_threshold ? `${comp.maintenance_threshold} hrs` : "Default (250 hrs)"}
                        </td>
                        <td className="py-4 px-2">
                          {comp.active === false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Deactivated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-center font-mono font-bold text-zinc-400">
                          {getAssetCount(comp.id)}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => startEditCompany(comp)}
                              title="Edit Company Details"
                              className="p-1.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openUsersModal(comp)}
                              title="Manage Users"
                              className="p-1.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                            >
                              <Users className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openConfirmation("toggle-active", comp)}
                              title={comp.active === false ? "Activate Company" : "Deactivate Company"}
                              className={`p-1.5 rounded border transition-all cursor-pointer ${
                                comp.active === false
                                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                              }`}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openConfirmation("delete", comp)}
                              title="Delete Company and Assets"
                              className="p-1.5 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Password Verification Modal */}
      {showConfirmModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md border border-zinc-900 bg-zinc-950 rounded-2xl shadow-2xl p-6 relative space-y-4">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowConfirmModal(false);
                setConfirmPassword("");
                setSelectedCompany(null);
              }}
              className="absolute top-4 right-4 p-1 border border-zinc-900 rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-200">
                Security Authorization Required
              </h3>
            </div>

            {/* Warning Message */}
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                {confirmAction === "delete" ? (
                  <p>
                    <strong>WARNING:</strong> You are about to permanently delete B2B client <strong>"{selectedCompany.name}"</strong>. This will delete all associated machinery, operator accounts, and maintenance histories. This action is irreversible.
                  </p>
                ) : (
                  <p>
                    You are about to change the active status of B2B client <strong>"{selectedCompany.name}"</strong>. Deactivated companies will block operators from logging into the platform.
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="p-2 border border-rose-500/20 bg-rose-500/10 rounded-lg text-xs text-rose-400">
                {modalError}
              </div>
            )}

            {/* Password verification form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="confirm-pass" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Superadmin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-700" />
                  <input
                    type="password"
                    id="confirm-pass"
                    required
                    placeholder="Enter password to authorize"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-zinc-800 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmPassword("");
                    setSelectedCompany(null);
                  }}
                  className="px-4 h-10 border border-zinc-900 bg-zinc-900/40 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className={`inline-flex items-center justify-center px-4 h-10 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer ${
                    confirmAction === "delete"
                      ? "bg-rose-600 text-zinc-100 hover:bg-rose-700"
                      : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                  }`}
                >
                  {isModalSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Authorizing...
                    </>
                  ) : (
                    confirmAction === "delete" ? "Authorize Deletion" : "Authorize Status Toggle"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Management Modal */}
      {showUsersModal && usersModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl border border-zinc-900 bg-zinc-950 rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowUsersModal(false);
                setUsersModalCompany(null);
                setUsersList([]);
              }}
              className="absolute top-4 right-4 p-1 border border-zinc-900 rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 shrink-0">
              <Users className="h-5 w-5 text-zinc-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-200">
                Manage Admins: {usersModalCompany.name}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto py-4 flex-1 space-y-4">
              {userSuccessMessage && (
                <div className="p-3 border border-emerald-500/20 bg-emerald-500/10 rounded-lg text-xs text-emerald-400 flex items-center justify-between">
                  <span>{userSuccessMessage}</span>
                  <button onClick={() => setUserSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-300 font-bold ml-2">&times;</button>
                </div>
              )}
              {userError && (
                <div className="p-3 border border-rose-500/20 bg-rose-500/10 rounded-lg text-xs text-rose-400 flex items-center justify-between">
                  <span>{userError}</span>
                  <button onClick={() => setUserError(null)} className="text-rose-500 hover:text-rose-300 font-bold ml-2">&times;</button>
                </div>
              )}

              {userFormMode === "list" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Registered administrators who can manage equipment and log hours.</span>
                    <button
                      type="button"
                      onClick={startCreateUser}
                      className="inline-flex h-8 items-center px-3 rounded-lg bg-zinc-100 text-[11px] font-semibold text-zinc-950 hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add User
                    </button>
                  </div>

                  {isFetchingUsers ? (
                    <div className="py-12 flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                    </div>
                  ) : usersList.length === 0 ? (
                    <div className="py-12 text-center text-xs text-zinc-500 font-mono border border-dashed border-zinc-900 rounded-xl">
                      No administrator accounts found for this company.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950/20">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-900 bg-zinc-900/10 text-zinc-500 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Full Name</th>
                            <th className="py-2.5 px-3">Email Address</th>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-zinc-300">
                          {usersList.map(item => (
                            <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                              <td className="py-3 px-3 font-bold text-zinc-200">{item.full_name}</td>
                              <td className="py-3 px-3 text-zinc-400 font-mono">{item.email}</td>
                              <td className="py-3 px-3">
                                <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-800 uppercase font-mono">
                                  {item.role === 'superadmin' ? 'Superadmin' : 'Company Admin'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleResendInvite(item)}
                                    disabled={resendingUserId === item.id}
                                    title="Resend Welcome Email & Credentials"
                                    className="p-1 rounded border border-cyan-950/30 bg-cyan-950/10 text-cyan-400 hover:bg-cyan-950/20 cursor-pointer disabled:opacity-50"
                                  >
                                    {resendingUserId === item.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Mail className="h-3 w-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => startEditUser(item)}
                                    title="Edit User"
                                    className="p-1 rounded border border-zinc-850 bg-zinc-900 text-zinc-400 hover:text-zinc-250 cursor-pointer"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleUserDelete(item)}
                                    title="Delete User"
                                    className="p-1 rounded border border-rose-950/30 bg-rose-950/5 text-rose-400 hover:bg-rose-950/10 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                // Create or Edit Form
                <form onSubmit={handleUserSubmit} className="space-y-4 max-w-md mx-auto border border-zinc-900 bg-zinc-950/40 p-5 rounded-xl">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <span>{userFormMode === "create" ? "Add New Administrator" : "Edit User Profile"}</span>
                    <button 
                      type="button" 
                      onClick={() => setUserFormMode("list")}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      &larr; Back to list
                    </button>
                  </h4>

                  {userError && (
                    <div className="p-2.5 border border-rose-500/20 bg-rose-500/10 rounded-lg text-xs text-rose-400">
                      {userError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="user-fullname" className="text-[10px] uppercase font-bold text-zinc-500">Full Name</label>
                      <input
                        type="text"
                        id="user-fullname"
                        required
                        placeholder="e.g. John Doe"
                        value={userFullName}
                        onChange={(e) => setUserFullName(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-zinc-850 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="user-email" className="text-[10px] uppercase font-bold text-zinc-500">Email Address (Domain emails allowed)</label>
                      <input
                        type="email"
                        id="user-email"
                        required
                        placeholder="e.g. john@apex.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-zinc-850 transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="user-role" className="text-[10px] uppercase font-bold text-zinc-500">System Role</label>
                      <select
                        id="user-role"
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as any)}
                        className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 focus:outline-none focus:border-zinc-850 transition-colors"
                      >
                        <option value="company_admin">Company Admin (Limited tenant access)</option>
                        <option value="superadmin">Superadmin (Global platform access)</option>
                      </select>
                    </div>

                    {userFormMode === "edit" && (
                      <>
                        <div className="space-y-1.5">
                          <label htmlFor="user-pass" className="text-[10px] uppercase font-bold text-zinc-500">
                            New Password (Leave blank to keep current)
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-700" />
                            <input
                              type="password"
                              id="user-pass"
                              placeholder="••••••••"
                              value={userPassword}
                              onChange={(e) => setUserPassword(e.target.value)}
                              className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-zinc-850 transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-cyan-900/30 bg-cyan-950/10 text-cyan-400">
                          <input
                            type="checkbox"
                            id="resend-invite-checkbox"
                            checked={resendInviteOnEdit}
                            onChange={(e) => setResendInviteOnEdit(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="resend-invite-checkbox" className="text-xs leading-relaxed cursor-pointer select-none">
                            <strong>Resend Welcome Credentials:</strong> Automatically generate a new temporary password and email it to this address.
                          </label>
                        </div>
                      </>
                    )}

                    {userFormMode === "create" && (
                      <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 leading-relaxed">
                        <strong>📧 Auto-generated password:</strong> A secure temporary password will be generated automatically and sent to the user&apos;s email. They will be required to change it on their first login.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end pt-3 border-t border-zinc-900 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUserFormMode("list")}
                      className="px-4 h-9 border border-zinc-900 bg-zinc-900/40 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUserSubmitting}
                      className="inline-flex items-center justify-center px-4 h-9 rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 shadow-md transition-all cursor-pointer"
                    >
                      {isUserSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          Saving...
                        </>
                      ) : (
                        userFormMode === "create" ? "Register User" : "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
