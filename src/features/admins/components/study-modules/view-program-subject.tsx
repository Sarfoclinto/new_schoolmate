/**
 * ViewProgramSubjects.tsx
 * Read-only view of all programs with their assigned subjects and sub-levels.
 * Full-width (no form panel), card-per-program layout.
 */

import { Table } from "antd";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  ChevronDown,
  BookOpen,
  GitBranch,
  LayoutList,
} from "lucide-react";
import type { ProgramGet, SubjectGet } from "@/types/api/setup/study-modules";
import useFetch from "@/hooks/api/use-fetch";
import { programKeys } from "@/config/query-keys";
import {
  getAllProgramsFn,
  getProgramSubjectsFn,
} from "@/services/setup/study-module";
import type { SubLevelGet } from "@/types/api/setup/sublevel";
import { MotionDiv } from "@/components/custom/motion";
import type { ColumnsType } from "antd/es/table";

// ─── Single expanded program card ────────────────────────────
const ProgramCard = ({
  program,
  index,
}: {
  program: ProgramGet;
  index: number;
}) => {
  const [expanded, setExpanded] = useState(index === 0);
  const programId = program.programId;

  const { data: programData, isLoading: loadingProgramData } = useFetch({
    queryFn: () => getProgramSubjectsFn(programId!),
    queryKeys: programKeys.list({ programId }),
    enabled: !!programId,
  });

  const subjectDataSource = useMemo(
    () => programData?.subjects.subjects?.map((s) => ({ ...s })) ?? [],
    [programData],
  );
  const sublevelDataSource = useMemo(
    () => programData?.subLevels?.map((s) => ({ ...s })) ?? [],
    [programData],
  );

  const subjectColumns: ColumnsType<SubjectGet> = [
    {
      key: "subjectName",
      title: "Subject",
      dataIndex: "subjectName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E] flex items-center gap-x-2">
          <BookOpen className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
          {v}
        </span>
      ),
    },
  ];

  const sublevelColumns: ColumnsType<SubLevelGet> = [
    {
      key: "subLevelName",
      title: "Sub-Level",
      dataIndex: "subLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E] flex items-center gap-x-2">
          <GitBranch className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0" />
          {v}
        </span>
      ),
    },
    {
      key: "alias",
      title: "Alias",
      dataIndex: "subLevelAlias",
      width: 120,
      render: (v: string) => (
        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {v ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
    >
      {/* Card header / toggle */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-x-4 px-6 py-4 border-b border-slate-100 text-left cursor-pointer transition-colors hover:bg-slate-50/60"
        style={
          expanded
            ? {
                background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
              }
            : {}
        }
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            expanded
              ? "bg-white/10 text-[#C9A84C]"
              : "bg-slate-100 text-[#1E3A5F]"
          }`}
        >
          <LayoutList className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`font-bold capitalize text-sm truncate ${
              expanded ? "text-white" : "text-[#0D1B2E]"
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {program.programName}
          </p>
          <div className="flex items-center gap-x-3 mt-0.5">
            <span
              className={`text-[11px] font-semibold ${
                expanded ? "text-[#C9A84C]" : "text-slate-400"
              }`}
            >
              {subjectDataSource.length} subject
              {subjectDataSource.length !== 1 && "s"}
            </span>
            <span
              className={`w-px h-3 ${expanded ? "bg-white/20" : "bg-slate-200"}`}
            />
            <span
              className={`text-[11px] font-semibold ${
                expanded ? "text-[#C9A84C]" : "text-slate-400"
              }`}
            >
              {sublevelDataSource.length} sub-level
              {sublevelDataSource.length !== 1 && "s"}
            </span>
          </div>
        </div>

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`shrink-0 ${expanded ? "text-white/60" : "text-slate-300"}`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* Subjects */}
              <div>
                <div className="px-5 py-3 flex items-center gap-x-2 bg-amber-50/60 border-b border-amber-100">
                  <BookOpen className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B6914]">
                    Subjects
                  </span>
                </div>
                <Table
                  columns={subjectColumns}
                  dataSource={subjectDataSource}
                  rowKey="subjectId"
                  loading={loadingProgramData}
                  size="small"
                  pagination={false}
                  styles={{ header: { cell: { color: "white" } } }}
                  locale={{
                    emptyText: (
                      <div className="py-6 text-slate-400 text-xs text-center">
                        No subjects assigned
                      </div>
                    ),
                  }}
                />
              </div>

              {/* Sub-levels */}
              <div>
                <div className="px-5 py-3 flex items-center gap-x-2 bg-blue-50/60 border-b border-blue-100">
                  <GitBranch className="w-3.5 h-3.5 text-[#1E3A5F]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#1E3A5F]">
                    Sub-Levels
                  </span>
                </div>
                <Table
                  columns={sublevelColumns}
                  dataSource={sublevelDataSource}
                  rowKey="subLevelId"
                  loading={loadingProgramData}
                  size="small"
                  pagination={false}
                  styles={{ header: { cell: { color: "white" } } }}
                  locale={{
                    emptyText: (
                      <div className="py-6 text-slate-400 text-xs text-center">
                        No sub-levels assigned
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

// ═══════════════════════════════════════════════════════════
const ViewProgramSubjects = () => {
  const { data: programs, isLoading: loadingPrograms } = useFetch({
    queryFn: getAllProgramsFn,
    queryKeys: programKeys.list(),
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Summary bar */}
      <MotionDiv
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 bg-white rounded-2xl border border-slate-100 px-6 py-4 flex items-center gap-x-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#1E3A5F] shrink-0">
          <Eye className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#0D1B2E]">
            Program Mapping Overview
          </p>
          <p className="text-xs text-slate-400">
            Click any program to expand its subject and sub-level assignments.
          </p>
        </div>
        {programs && (
          <span className="ml-auto text-[10px] font-bold tracking-widest text-[#C9A84C] bg-[#0D1B2E] px-2.5 py-0.5 rounded-full">
            {programs.length} programs
          </span>
        )}
      </MotionDiv>

      {/* Program cards */}
      {loadingPrograms ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : !programs?.length ? (
        <div
          className="bg-white rounded-2xl border border-slate-100 p-12 text-center"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <LayoutList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">
            No programs found.
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Add programs in the Programs tab first.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {programs.map((program, i) => (
            <ProgramCard key={program.programId} program={program} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewProgramSubjects;
