"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Search,
  Info, AlertTriangle
} from "lucide-react";
import { Profile, Company, ChecklistTemplate, ChecklistItem, mockDb } from "../mockDb";
import { motion, AnimatePresence } from "framer-motion";

export default function ChecklistManagement() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Data States
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  
  // Master View State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null); // null means "Global Default"
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");

  // New Item Inline Form State
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<'routine' | 'safety' | 'specific'>('routine');
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const API_BASE_URL = typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5000" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "";

  const refreshData = async () => {
    if (typeof window === "undefined") return;
    const sessionStr = sessionStorage.getItem("wfs_session");
    if (!sessionStr) return;
    
    const profile = JSON.parse(sessionStr) as Profile;
    setUser(profile);
    
    if (profile.role !== "superadmin" && profile.role !== "company_admin") {
      router.push("/dashboard");
      return;
    }

    if (profile.role !== "superadmin") {
      setSelectedCompanyId(profile.company_id || null);
    }

    // Fetch Companies
    const comps = mockDb.getCompanies();
    setCompanies(comps);

    // Fetch Templates & Items
    if (window.location.protocol !== "file:") {
      const token = sessionStorage.getItem("wfs_token") || "";
      try {
        const res = await fetch(`${API_BASE_URL}/api/checklists/templates`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
          const allItems: ChecklistItem[] = [];
          data.forEach((t: any) => {
            if (t.items) allItems.push(...t.items);
          });
          setItems(allItems);
        }
      } catch (err) {
        console.error("API fetch error", err);
      }
    } else {
      setTemplates(mockDb.getChecklistTemplates());
      setItems(mockDb.getChecklistItems());
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, []);

  // Determine active target template
  // If the selected company has templates, use the first one as master. 
  const globalTemplates = templates.filter(t => t.company_id === null);
  const globalTemplateIds = globalTemplates.map(t => t.id);

  const activeTemplates = templates.filter(t => t.company_id === selectedCompanyId);
  const masterTemplate = activeTemplates.length > 0 ? activeTemplates[0] : null;
  const activeTemplateIds = activeTemplates.map(t => t.id);
  
  let activeItems: (ChecklistItem & { isGlobalInherited?: boolean })[] = [];
  if (selectedCompanyId === null) {
      activeItems = items.filter(i => globalTemplateIds.includes(i.template_id));
  } else {
      const globalItems = items.filter(i => globalTemplateIds.includes(i.template_id)).map(i => ({...i, isGlobalInherited: true}));
      const companyItems = items.filter(i => activeTemplateIds.includes(i.template_id));
      activeItems = [...globalItems, ...companyItems];
  }

  const handleAddItem = async () => {
    if (!newItemLabel.trim()) return;

    setStatusMsg(null);
    let targetTemplateId = masterTemplate?.id;

    if (!targetTemplateId) {
      // Need to create a Master template first
      if (typeof window !== "undefined" && window.location.protocol !== "file:") {
        const token = sessionStorage.getItem("wfs_token") || "";
        try {
          const res = await fetch(`${API_BASE_URL}/api/checklists/templates`, {
            method: "POST",
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: "Master Checklist",
              description: "Unified checklist",
              company_id: selectedCompanyId
            })
          });
          if (res.ok) {
            const data = await res.json();
            targetTemplateId = data.id;
          } else {
            setStatusMsg({ type: "error", text: "Failed to create master template." });
            return;
          }
        } catch (err) {
          setStatusMsg({ type: "error", text: "Network error creating template." });
          return;
        }
      } else {
        const newTemp = mockDb.addChecklistTemplate("Master Checklist", "Unified checklist", selectedCompanyId);
        targetTemplateId = newTemp.id;
      }
    }

    if (!targetTemplateId) return;

    // Now create the item
    if (typeof window !== "undefined" && window.location.protocol !== "file:") {
      const token = sessionStorage.getItem("wfs_token") || "";
      try {
        const res = await fetch(`${API_BASE_URL}/api/checklists/items`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            template_id: targetTemplateId,
            label: newItemLabel.trim(),
            category: newItemCategory
          })
        });
        if (!res.ok) {
          setStatusMsg({ type: "error", text: "Failed to add item." });
          return;
        }
      } catch (err) {
        setStatusMsg({ type: "error", text: "Network error adding item." });
        return;
      }
    } else {
      mockDb.addChecklistItem(targetTemplateId, newItemLabel.trim(), newItemCategory);
    }

    setNewItemLabel("");
    setNewItemCategory("routine");
    refreshData();
  };

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const itemId = itemToDelete;
    setItemToDelete(null);

    if (typeof window !== "undefined" && window.location.protocol !== "file:") {
      const token = sessionStorage.getItem("wfs_token") || "";
      await fetch(`${API_BASE_URL}/api/checklists/items/${itemId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } else {
      mockDb.deleteChecklistItem(itemId);
    }
    refreshData();
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "Global Default";
    return companies.find(c => c.id === companyId)?.name || "Unknown Company";
  };

  const selectedCompanyName = selectedCompanyId === null 
    ? "Global Default (All Companies)" 
    : companies.find(c => c.id === selectedCompanyId)?.name || "Global Default";

  // Group items
  const routineItems = activeItems.filter(i => i.category === 'routine');
  const safetyItems = activeItems.filter(i => i.category === 'safety');
  const specificItems = activeItems.filter(i => i.category === 'specific');

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-zinc-400" /> Maintenance Checklists
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage the unified master checklist for routine, safety, and specific inspections.
          </p>
        </div>
      </div>

      {statusMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-xs border transition-all duration-300 ${
            statusMsg.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {statusMsg.text}
        </motion.div>
      )}

      {/* Main Unified View */}
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 shadow-xl space-y-6">
        
        {/* Top Controls: Target Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div className="flex-1">
            {user?.role === "superadmin" ? (
              <div className="space-y-1.5 relative max-w-sm">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Checklist</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
                    setCompanySearchQuery("");
                  }}
                  className="flex w-full h-10 items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-sm font-semibold text-zinc-300 hover:border-zinc-800 hover:text-zinc-100 transition-all cursor-pointer"
                >
                  <span>{selectedCompanyName}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </button>

                <AnimatePresence>
                  {isCompanyDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl z-30 max-h-60 overflow-y-auto space-y-1"
                    >
                      <div className="p-1.5 border-b border-zinc-900 flex items-center gap-1.5">
                        <Search className="h-3.5 w-3.5 text-zinc-650 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Search company..."
                          value={companySearchQuery}
                          onChange={(e) => setCompanySearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-8 px-2 rounded border border-zinc-900 bg-zinc-900 text-[11px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompanyId(null);
                          setIsCompanyDropdownOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium rounded-md hover:bg-zinc-900 transition-colors cursor-pointer ${
                          selectedCompanyId === null ? "text-zinc-100 bg-zinc-900/40" : "text-zinc-400"
                        }`}
                      >
                        Global Default (All Companies)
                      </button>
                      {companies
                        .filter(comp => comp.name.toLowerCase().includes(companySearchQuery.toLowerCase()))
                        .map((comp) => (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              setSelectedCompanyId(comp.id);
                              setIsCompanyDropdownOpen(false);
                            }}
                            className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium rounded-md hover:bg-zinc-900 transition-colors cursor-pointer ${
                              selectedCompanyId === comp.id ? "text-zinc-100 bg-zinc-900/40" : "text-zinc-400"
                            }`}
                          >
                            {comp.name}
                          </button>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Checklist</label>
                <div className="h-10 flex items-center px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm font-semibold text-zinc-300">
                  {selectedCompanyName}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              selectedCompanyId === null 
                ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            }`}>
              {selectedCompanyId === null ? "Global Context" : "Tenant Context"}
            </span>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-900/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Add Inspection Item</h4>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. Inspect hydraulic lines for micro-leaks..."
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
              }}
              className="flex-1 h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
            />

            <div className="flex items-center gap-1.5 p-1 border border-zinc-900 bg-zinc-950 rounded-lg">
              {(['routine', 'safety', 'specific'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewItemCategory(cat)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    newItemCategory === cat
                      ? "bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700/50"
                      : "text-zinc-600 hover:text-zinc-400 border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="h-10 px-6 rounded-lg bg-zinc-100 text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        {/* Unified Checklist Display */}
        <div className="space-y-8 pt-4">
          {/* Helper Component to Render Sections */}
          {(() => {
            const renderSection = (title: string, catItems: ChecklistItem[], colorClass: string) => (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0]}`} />
                  {title} ({catItems.length})
                </h3>
                {catItems.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-zinc-900/60 bg-zinc-950/20 text-center text-xs text-zinc-600 italic">
                    No items in this category.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {catItems.map((item) => (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-zinc-900/60 bg-zinc-950/40 text-sm hover:border-zinc-800 transition-colors"
                        >
                          <span className="text-zinc-300 font-sans">{item.label}</span>
                          {item.isGlobalInherited ? (
                             <span className="text-[9px] px-2 py-0.5 border border-purple-500/20 text-purple-400 bg-purple-500/10 rounded uppercase" title="Inherited from Global Default">Global</span>
                          ) : (
                             <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-md text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Remove Item"
                             >
                              <Trash2 className="h-4 w-4" />
                             </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            );

            return (
              <>
                {renderSection("Routine Maintenance", routineItems, "bg-emerald-500")}
                {renderSection("Safety Inspections", safetyItems, "bg-amber-500")}
                {renderSection("Specific Checks", specificItems, "bg-cyan-500")}
              </>
            );
          })()}
        </div>

      </div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <AlertTriangle className="h-6 w-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Delete Item?</h3>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    Are you sure you want to remove this inspection item? This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex w-full gap-3 pt-4 border-t border-zinc-900/60">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 h-10 rounded-lg bg-zinc-900 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 h-10 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/20 cursor-pointer"
                  >
                    Yes, delete it
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
