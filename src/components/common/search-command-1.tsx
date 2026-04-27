"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth.store";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import adminPaths from "@/config/admin.routes";
import staffPaths from "@/config/staff.routes";
import {
  LayoutGrid,
  // Users,
  Briefcase,
  BarChart3,
  DollarSign,
  Bell,
  Lock,
  Calendar,
  HelpCircle,
  Settings,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  GraduationCap,
  Plus,
  Eye,
  List,
  FileText,
  Hash,
  ClipboardList,
  Pencil,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RouteItem {
  label: string;
  href: string;
}

// ─── Category config (icon + accent colour) ───────────────────────────────────
const CATEGORY_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    color: string; // icon container bg
    text: string; // icon text colour
    border: string;
  }
> = {
  Dashboard: {
    icon: <LayoutGrid className="w-3.5 h-3.5" />,
    color: "bg-[#EEF2F8]",
    text: "text-[#1E3A5F]",
    border: "border-[#D0DCF0]",
  },
  "Institution Setup": {
    icon: <Settings className="w-3.5 h-3.5" />,
    color: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
  },
  Students: {
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    color: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  Staff: {
    icon: <Briefcase className="w-3.5 h-3.5" />,
    color: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  Reports: {
    icon: <BarChart3 className="w-3.5 h-3.5" />,
    color: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-200",
  },
  Finance: {
    icon: <DollarSign className="w-3.5 h-3.5" />,
    color: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  "Events & Notices": {
    icon: <Bell className="w-3.5 h-3.5" />,
    color: "bg-rose-50",
    text: "text-rose-500",
    border: "border-rose-200",
  },
  Permissions: {
    icon: <Lock className="w-3.5 h-3.5" />,
    color: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
  },
  Sessions: {
    icon: <Calendar className="w-3.5 h-3.5" />,
    color: "bg-fuchsia-50",
    text: "text-fuchsia-600",
    border: "border-fuchsia-200",
  },
  Requests: {
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    color: "bg-orange-50",
    text: "text-orange-500",
    border: "border-orange-200",
  },
  "Assignments & Records": {
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-200",
  },
  Attendance: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  Remarks: {
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: "bg-indigo-50",
    text: "text-indigo-500",
    border: "border-indigo-200",
  },
};

// Fallback
const DEFAULT_CAT = {
  icon: <Hash className="w-3.5 h-3.5" />,
  color: "bg-slate-100",
  text: "text-slate-500",
  border: "border-slate-200",
};

// ─── Feature label → action hint ──────────────────────────────────────────────
const getActionHint = (
  label: string,
): { icon: React.ReactNode; hint: string } => {
  const l = label.toLowerCase();
  if (
    l.includes("register") ||
    l.includes("create") ||
    l.includes("add") ||
    l.includes("new")
  )
    return { icon: <Plus className="w-3 h-3" />, hint: "Create" };
  if (l.includes("view all") || l.includes("all "))
    return { icon: <List className="w-3 h-3" />, hint: "List" };
  if (l.includes("detail") || l.includes("profile") || l.includes("view"))
    return { icon: <Eye className="w-3 h-3" />, hint: "View" };
  if (l.includes("report") || l.includes("record"))
    return { icon: <FileText className="w-3 h-3" />, hint: "Report" };
  if (l.includes("mark") || l.includes("attendance"))
    return { icon: <CheckCircle2 className="w-3 h-3" />, hint: "Action" };
  if (l.includes("update") || l.includes("edit"))
    return { icon: <Pencil className="w-3 h-3" />, hint: "Edit" };
  if (l.includes("assign"))
    return { icon: <ClipboardList className="w-3 h-3" />, hint: "Assign" };
  return { icon: <ArrowRight className="w-3 h-3" />, hint: "Open" };
};

// ─── Category ordering ────────────────────────────────────────────────────────
const CATEGORY_PRIORITY: Record<string, number> = {
  Dashboard: 0,
  "Institution Setup": 1,
  Students: 2,
  Staff: 3,
  "Assignments & Records": 4,
  Reports: 5,
  Finance: 6,
  "Events & Notices": 7,
  Attendance: 8,
  Sessions: 9,
  Permissions: 10,
  Requests: 11,
  Remarks: 12,
  General: 99,
};

// ─── Route key → category ─────────────────────────────────────────────────────
const getCategory = (key: string): string => {
  if (["index", "profile"].includes(key)) return "Dashboard";
  if (
    [
      "setup",
      "roles",
      "educationalLevel",
      "academicLevel",
      "promotionPath",
      "subLevel",
      "studyModules",
      "facultyNClassroom",
      "assessmentNGrading",
      "facilities",
      "yearsNTerms",
    ].includes(key)
  )
    return "Institution Setup";
  if (
    [
      "students",
      "registerStudent",
      "studentDetails",
      "viewAll",
      "viewByEdu",
      "viewByAca",
      "viewBySub",
    ].includes(key)
  )
    return "Students";
  if (
    [
      "staff",
      "createStaff",
      "staffAssignment",
      "principalTeacher",
      "staffDetails",
      "allStaff",
      "staffByMode",
      "staffByRole",
    ].includes(key)
  )
    return "Staff";
  if (
    [
      "reports",
      "stuTermReport",
      "stuReportDetail",
      "academicRecords",
      "stuAttReport",
      "classRanking",
      "bulkReportPrint",
    ].includes(key)
  )
    return "Reports";
  if (["finance", "fees", "subLedgers", "bills", "classBill"].includes(key))
    return "Finance";
  if (
    ["notice", "events", "createEvent", "eventDetails", "allEvents"].includes(
      key,
    )
  )
    return "Events & Notices";
  if (["permissions", "admin_permissions", "staff_permissions"].includes(key))
    return "Permissions";
  if (
    [
      "sessions",
      "openAcademicTerm",
      "closeAcademicTerm",
      "closeAcademicYear",
    ].includes(key)
  )
    return "Sessions";
  if (key === "request") return "Requests";
  if (
    [
      "myWork",
      "classesnSubjects",
      "academicRecords",
      "passMark",
      "addRecord",
      "viewRecords",
      "updateRecord",
    ].includes(key)
  )
    return "Assignments & Records";
  if (["attendance", "viewAttendance", "markAttendance"].includes(key))
    return "Attendance";
  if (["remarks"].includes(key)) return "Remarks";
  return "General";
};

// ─────────────────────────────────────────────────────────────────────────────
// KBD chip — small keyboard shortcut badge
// ─────────────────────────────────────────────────────────────────────────────
export const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd
    className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md
      text-[10px] font-bold font-mono text-slate-500 bg-slate-100 border border-slate-200
      leading-none"
  >
    {children}
  </kbd>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SearchCommand = () => {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const routes = user?.dashboardType === "admin" ? adminPaths : staffPaths;

  // Build grouped routes
  const groupedRoutes = React.useMemo(() => {
    const groups: Record<string, RouteItem[]> = {};
    Object.entries(routes).forEach(([key, value]) => {
      if (!value || typeof value !== "object" || !("href" in value)) return;
      const item = value as RouteItem;
      if (!item.href || !item.label) return;
      const cat = getCategory(key);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [routes]);

  const sortedCategories = React.useMemo(
    () =>
      Object.entries(groupedRoutes).sort(
        ([a], [b]) =>
          (CATEGORY_PRIORITY[a] ?? 99) - (CATEGORY_PRIORITY[b] ?? 99),
      ),
    [groupedRoutes],
  );

  // Count total results for the current query
  const totalResults = React.useMemo(() => {
    if (!query) return null;
    const q = query.toLowerCase();
    return sortedCategories.reduce(
      (n, [, items]) =>
        n + items.filter((i) => i.label.toLowerCase().includes(q)).length,
      0,
    );
  }, [query, sortedCategories]);

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    navigate(href);
  };

  return (
    <>
      {/* ── Trigger button (shown in the top bar / sidebar) ── */}

      {/* ── Command dialog ── */}
      <CommandDialog
        data-tour="command-list"
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setQuery("");
        }}
      >
        {/* Custom inner layout — we override the default padding */}
        <div className="flex flex-col max-h-[min(560px,80svh)]">
          {/* ── Search input row ── */}
          <div className="flex items-center gap-x-2 px-4 py-3 border-b border-slate-100">
            <svg
              className="w-4 h-4 text-slate-400 shrink-0"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10.5 10.5L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <CommandInput
              placeholder="Search pages and features…"
              value={query}
              onValueChange={setQuery}
              className="flex-1 border-0 outline-none ring-0 shadow-none bg-transparent
                text-sm text-slate-800 placeholder:text-slate-400 font-medium py-0 h-auto
                focus:ring-0 focus:border-0"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            {/* Live result count */}
            {query && totalResults !== null && (
              <span className="text-[11px] font-semibold text-slate-400 shrink-0 tabular-nums">
                {totalResults} result{totalResults !== 1 ? "s" : ""}
              </span>
            )}
            {/* ESC hint */}
            <Kbd>esc</Kbd>
          </div>

          {/* ── Results list ── */}
          <CommandList className="flex-1 overflow-y-auto py-2 px-2">
            <CommandEmpty>
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-300"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="6.5"
                      cy="6.5"
                      r="5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10.5 10.5L14 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    No results for "{query}"
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try a different keyword or category
                  </p>
                </div>
              </div>
            </CommandEmpty>

            {sortedCategories.map(([category, items], idx) => {
              const cfg = CATEGORY_CONFIG[category] ?? DEFAULT_CAT;
              return (
                <React.Fragment key={category}>
                  {idx > 0 && (
                    <CommandSeparator className="my-1.5 bg-slate-100" />
                  )}

                  <CommandGroup
                    heading={
                      // ── Category header ──────────────────────────────────
                      <div className="flex items-center gap-x-2 px-2 py-1.5 mb-0.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center
                          shrink-0 border ${cfg.color} ${cfg.text} ${cfg.border}`}
                        >
                          {cfg.icon}
                        </div>
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {category}
                        </span>
                        <span className="ml-auto text-[10px] font-semibold text-slate-300 tabular-nums">
                          {items.length}
                        </span>
                      </div>
                    }
                  >
                    {items.map((item) => {
                      const { icon: actionIcon, hint } = getActionHint(
                        item.label,
                      );
                      return (
                        <CommandItem
                          key={item.href}
                          value={item.label}
                          onSelect={() => handleSelect(item.href)}
                          className="group flex items-center gap-x-3 px-3 py-2.5 rounded-xl
                            cursor-pointer transition-all my-0.5
                            text-slate-700
                            data-[selected=true]:bg-[#EEF2F8]
                            data-[selected=true]:text-[#0D1B2E]
                            hover:bg-slate-50"
                        >
                          {/* Category colour dot */}
                          <div
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.text.replace("text-", "bg-")}`}
                          />

                          {/* Label */}
                          <span
                            className="flex-1 text-sm font-medium truncate"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {item.label}
                          </span>

                          {/* Action hint — hidden by default, shown on hover/select */}
                          <span
                            className="hidden group-data-[selected=true]:flex items-center
                              gap-x-1 text-[11px] font-semibold text-slate-400 shrink-0"
                          >
                            {actionIcon}
                            {hint}
                          </span>

                          {/* Chevron — appears on hover/select */}
                          <ChevronRight
                            className="w-3.5 h-3.5 text-slate-300 shrink-0
                              opacity-0 group-data-[selected=true]:opacity-100
                              -translate-x-1 group-data-[selected=true]:translate-x-0
                              transition-all"
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </React.Fragment>
              );
            })}
          </CommandList>

          {/* ── Footer keyboard hint strip ── */}
          <div className="flex items-center gap-x-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 rounded-b-xl shrink-0">
            <div
              className="flex items-center gap-x-1.5 text-[11px] text-slate-400"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <div className="flex gap-x-0.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
              </div>
              Navigate
            </div>
            <div className="flex items-center gap-x-1.5 text-[11px] text-slate-400">
              <Kbd>↵</Kbd>
              Open
            </div>
            <div className="flex items-center gap-x-1.5 text-[11px] text-slate-400">
              <Kbd>esc</Kbd>
              Close
            </div>
            <div className="ml-auto flex items-center gap-x-1 text-[11px] text-slate-400">
              <div className="flex gap-x-0.5">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </div>
              Toggle
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  );
};

export default SearchCommand;
