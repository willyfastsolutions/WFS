"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ChevronDown, 
  Search,
  Settings,
  HelpCircle,
  Briefcase,
  AlertTriangle,
  Info
} from "lucide-react";
import { Profile, Company, ChecklistTemplate, ChecklistItem, mockDb } from "../mockDb";
import { motion, AnimatePresence } from "framer-motion";

export default function ChecklistManagement() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  
  // Custom Company Dropdown State for Superadmin Template Creation
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null); // null means "Global Default"
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");

  // Template Form State
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [templateStatus, setTemplateStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);

  // New Item Inline Form State (mapped by templateId)
  const [newItemLabels, setNewItemLabels] = useState<{ [templateId: string]: string }>({});
  const [newItemCategories, setNewItemCategories] = useState<{ [templateId: string]: 'routine' | 'safety' | 'specific' }>({});

  const refreshData = () => {
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

        // Fetch templates
        const comps = mockDb.getCompanies();
        setCompanies(comps);

        // Fetch templates depending on user role
        const temps = mockDb.getChecklistTemplates();
        setTemplates(temps);

        // Fetch checklist items
        const allItems = mockDb.getChecklistItems();
        setItems(allItems);
      }
    }
  };

  useEffect(() => {
    mockDb.initialize();
    refreshData();
  }, []);

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setTemplateStatus(null);

    if (!templateName.trim()) {
      setTemplateStatus({ type: "error", text: "Please enter a valid checklist name." });
      return;
    }

    setIsSubmittingTemplate(true);

    setTimeout(() => {
      try {
        // Determine template company assignment
        const targetCompanyId = user?.role === "superadmin" ? selectedCompanyId : user?.company_id;
        
        mockDb.addChecklistTemplate(
          templateName.trim(),
          templateDesc.trim(),
          targetCompanyId || null
        );

        setTemplateStatus({ type: "success", text: "Checklist template created successfully!" });
        setTemplateName("");
        setTemplateDesc("");
        refreshData();
      } catch (err) {
        setTemplateStatus({ type: "error", text: "Failed to create checklist template." });
      } finally {
        setIsSubmittingTemplate(false);
      }
    }, 800);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this checklist template? This will delete all its inspection questions.")) {
      mockDb.deleteChecklistTemplate(id);
      refreshData();
    }
  };

  const handleAddItem = (templateId: string) => {
    const label = newItemLabels[templateId] || "";
    const category = newItemCategories[templateId] || "routine";

    if (!label.trim()) return;

    mockDb.addChecklistItem(templateId, label.trim(), category);
    
    // Clear input
    setNewItemLabels(prev => ({ ...prev, [templateId]: "" }));
    // Reset category
    setNewItemCategories(prev => ({ ...prev, [templateId]: "routine" }));
    
    refreshData();
  };

  const handleDeleteItem = (itemId: string) => {
    mockDb.deleteChecklistItem(itemId);
    refreshData();
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "Global Default";
    return companies.find(c => c.id === companyId)?.name || "Unknown Company";
  };

  const selectedCompanyName = selectedCompanyId === null 
    ? "Global Default (All Companies)" 
    : companies.find(c => c.id === selectedCompanyId)?.name || "Global Default";

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-zinc-400" /> Maintenance Checklists
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Build and customize preventive maintenance routines and safety inspections for machinery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Create Checklist Form */}
        <div className="xl:col-span-1 space-y-6">
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 space-y-4 backdrop-blur-md">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Plus className="h-4 w-4 text-zinc-400" /> Create New Checklist
            </h3>

            {templateStatus && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg text-xs border transition-all duration-300 ${
                  templateStatus.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}
              >
                {templateStatus.text}
              </motion.div>
            )}

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              
              {/* Superadmin Tenant Selector */}
              {user?.role === "superadmin" && (
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Assign to Tenant Company</label>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
                      setCompanySearchQuery("");
                    }}
                    className="flex w-full h-10 items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs font-semibold text-zinc-300 hover:border-zinc-800 hover:text-zinc-100 transition-all cursor-pointer"
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
                        {/* Search Box */}
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
              )}

              {/* Template Name */}
              <div className="space-y-1.5">
                <label htmlFor="temp-name" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Checklist Name</label>
                <input
                  type="text"
                  id="temp-name"
                  placeholder="e.g. OSHA Safety Checks"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
                />
              </div>

              {/* Template Description */}
              <div className="space-y-1.5">
                <label htmlFor="temp-desc" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Description (Optional)</label>
                <textarea
                  id="temp-desc"
                  placeholder="Summarize the scope of these checklist items..."
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-zinc-900 bg-zinc-950 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingTemplate}
                className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-100 transition-all shadow-md cursor-pointer"
              >
                {isSubmittingTemplate ? "Creating..." : "Create Template"}
              </button>
            </form>
          </div>

          {/* Quick Info Card */}
          <div className="border border-zinc-900 bg-zinc-900/5 rounded-xl p-5 text-xs text-zinc-500 space-y-3 font-sans leading-relaxed">
            <h4 className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-zinc-400" /> Inspection Categories
            </h4>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-zinc-400">Routine Service:</strong> Maintenance tasks such as oil/filter changes or hardware replacements.</li>
              <li><strong className="text-zinc-400">Safety Check:</strong> Standards-based safety checks (lights, tire integrity, horn, guards).</li>
              <li><strong className="text-zinc-400">Specific Check:</strong> Specialized custom inspections tailored to a specific model.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Templates & Items List */}
        <div className="xl:col-span-2 space-y-6">
          
          {templates.length === 0 ? (
            <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl py-16 text-center text-xs text-zinc-500 font-mono">
              No checklist templates found. Create one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {templates.map((temp) => {
                const tempItems = items.filter(i => i.template_id === temp.id);
                const isGlobal = !temp.company_id;

                return (
                  <motion.div
                    key={temp.id}
                    layout
                    className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 shadow-xl space-y-5"
                  >
                    {/* Template Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-zinc-200 text-base">{temp.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                            isGlobal 
                              ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }`}>
                            {isGlobal ? "Global Default" : getCompanyName(temp.company_id)}
                          </span>
                        </div>
                        {temp.description && (
                          <p className="text-xs text-zinc-400 mt-1 font-sans font-light">{temp.description}</p>
                        )}
                      </div>

                      {/* Delete Template Button */}
                      {/* Allow tenant admins to delete their company's template, or superadmins to delete any */}
                      {(user?.role === "superadmin" || temp.company_id === user?.company_id) && (
                        <button
                          onClick={() => handleDeleteTemplate(temp.id)}
                          className="p-1.5 border border-zinc-900 rounded bg-zinc-950 text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Checklist Questions Table / List */}
                    <div className="border-t border-zinc-900 pt-4 space-y-3">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Inspection Questions ({tempItems.length})</div>
                      
                      {tempItems.length === 0 ? (
                        <div className="py-6 text-center text-xs text-zinc-650 italic font-sans">
                          No items added to this checklist yet. Add one below.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <AnimatePresence>
                            {tempItems.map((item) => (
                              <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center justify-between p-3 rounded-lg border border-zinc-900/60 bg-zinc-950/40 text-xs hover:border-zinc-800 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Bullet Indicator */}
                                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                                  <span className="text-zinc-350 font-medium font-sans">{item.label}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Category Tag */}
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                                    item.category === "routine" 
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                      : item.category === "safety"
                                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                      : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                  }`}>
                                    {item.category}
                                  </span>

                                  {/* Delete Question Button */}
                                  {(user?.role === "superadmin" || temp.company_id === user?.company_id) && (
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-1 rounded text-zinc-650 hover:text-rose-400 transition-colors cursor-pointer"
                                      title="Remove Item"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Inline Form to Add Checklist Question */}
                    {(user?.role === "superadmin" || temp.company_id === user?.company_id) && (
                      <div className="border-t border-zinc-900 pt-4 space-y-3">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Add Inspection Item</div>
                        
                        <div className="flex flex-col md:flex-row gap-3">
                          {/* Item Label Input */}
                          <input
                            type="text"
                            placeholder="e.g. Inspect hydraulic lines for micro-leaks..."
                            value={newItemLabels[temp.id] || ""}
                            onChange={(e) => setNewItemLabels(prev => ({ ...prev, [temp.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddItem(temp.id);
                            }}
                            className="flex-1 h-9 px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 transition-colors"
                          />

                          {/* Category Radio Chips (Interactive, NO native selects) */}
                          <div className="flex items-center gap-1.5 p-1 border border-zinc-900 bg-zinc-950 rounded-lg">
                            {(["routine", "safety", "specific"] as const).map((cat) => {
                              const selectedCat = newItemCategories[temp.id] || "routine";
                              const isSel = selectedCat === cat;
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setNewItemCategories(prev => ({ ...prev, [temp.id]: cat }))}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    isSel
                                      ? "bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700/50"
                                      : "text-zinc-600 hover:text-zinc-400 border border-transparent"
                                  }`}
                                >
                                  {cat}
                                </button>
                              );
                            })}
                          </div>

                          {/* Add Item Button */}
                          <button
                            type="button"
                            onClick={() => handleAddItem(temp.id)}
                            className="h-9 px-4 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700/30 text-xs font-semibold hover:bg-zinc-700 hover:text-zinc-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
