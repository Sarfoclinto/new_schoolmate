/**
 * studentColumns.tsx
 * Typed column builder functions shared across all student list pages.
 * Import only what each page needs.
 */

import {
  Avatar,
  Button,
  Image,
  Input,
  Tooltip,
  type TableColumnType,
} from "antd";
import type { NavigateFunction } from "react-router-dom";
import { Eye, FileText, GraduationCap } from "lucide-react";
import { formatDate } from "@/utils/date-n-time";
import { buildMediaUrl } from "@/utils/media";
import paths from "@/config/routes";
import { toast } from "sonner";

// ─── Inline search filter helper ─────────────────────────────
function searchFilter<T>(
  dataIndex: keyof T,
  placeholder: string,
): Pick<TableColumnType<T>, "filterDropdown" | "onFilter"> {
  return {
    filterDropdown: ({ selectedKeys, setSelectedKeys, confirm }) => (
      <div className="p-2">
        <Input
          size="small"
          placeholder={placeholder}
          autoFocus
          allowClear
          value={selectedKeys[0] as string}
          className="rounded-lg!"
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            confirm({ closeDropdown: false });
          }}
          onPressEnter={() => confirm()}
          onBlur={() => confirm()}
        />
      </div>
    ),
    onFilter: (value, record) =>
      String(record[dataIndex] ?? "")
        .toLowerCase()
        .includes((value as string).toLowerCase()),
  };
}

// ─── Column builders ─────────────────────────────────────────

export function studentCodeCol<T extends { studentId: string }>(
  width = 135,
): TableColumnType<T> {
  return {
    key: "studentId",
    title: "ID",
    dataIndex: "studentId",
    width,
    ...searchFilter<T>("studentId" as keyof T, "Search ID"),
    render: (code: string) => (
      <span className="font-bold text-[11px] tracking-wider text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded-lg">
        {code}
      </span>
    ),
  };
}

export function studentImageCol<
  T extends { studentImage?: string; fullName: string },
>(width = 52): TableColumnType<T> {
  return {
    key: "studentImage",
    title: "",
    dataIndex: "studentImage",
    width,
    align: "center",
    render: (image: string | undefined, record: T) =>
      image ? (
        <Image
          src={buildMediaUrl(image)}
          width={36}
          height={36}
          className="rounded-xl! object-cover"
          preview={{ mask: <Eye className="w-3 h-3" /> }}
        />
      ) : (
        <Avatar
          size={36}
          className="rounded-xl! bg-[#1E3A5F]! text-[#C9A84C]! font-bold! text-sm! shrink-0"
        >
          {record.fullName?.[0]?.toUpperCase() ?? "?"}
        </Avatar>
      ),
  };
}

export function studentNameCol<T extends { fullName: string }>(
  width: string | number = "50%",
): TableColumnType<T> {
  return {
    key: "fullName",
    title: "Student Name",
    dataIndex: "fullName",
    width,
    ...searchFilter<T>("fullName" as keyof T, "Search name"),
    render: (name: string) => (
      <span className="font-semibold text-[#0D1B2E] text-sm">{name}</span>
    ),
  };
}

export function genderCol<T extends { gender: string }>(
  width = 90,
): TableColumnType<T> {
  return {
    key: "gender",
    title: "Gender",
    dataIndex: "gender",
    width,
    align: "center",
    filters: [
      { text: "Male", value: "Male" },
      { text: "Female", value: "Female" },
    ],
    onFilter: (value, record) => record.gender === value,
    render: (value: string) => (
      <span
        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
          value === "Male"
            ? "bg-sky-50 text-sky-700 border border-sky-200"
            : "bg-pink-50 text-pink-700 border border-pink-200"
        }`}
      >
        {value}
      </span>
    ),
  };
}

export function dobCol<T extends { dateOfBirth: string }>(
  width = 120,
): TableColumnType<T> {
  return {
    key: "dateOfBirth",
    title: "Date of Birth",
    dataIndex: "dateOfBirth",
    width,
    render: (date: string) => (
      <span className="text-xs font-semibold text-slate-500">
        {formatDate(date)}
      </span>
    ),
  };
}

export function addressCol<T extends { address: string }>(
  width?: string | number,
): TableColumnType<T> {
  return {
    key: "address",
    title: "Address",
    dataIndex: "address",
    ellipsis: true,
    width,
    render: (address: string) => (
      <Tooltip title={address}>
        <span className="text-sm text-slate-500 truncate max-w-80 block">
          {address}
        </span>
      </Tooltip>
    ),
  };
}

export function eduLevelCol<T extends { educationalLevelName?: string }>(
  width = 130,
): TableColumnType<T> {
  return {
    key: "educationalLevelName",
    title: "Edu. Level",
    dataIndex: "educationalLevelName",
    width,
    render: (v: string) => (
      <span className="text-xs font-semibold text-[#1E3A5F] bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
        {v ?? "—"}
      </span>
    ),
  };
}

export function programCol<T extends { programName?: string }>(
  width = 120,
): TableColumnType<T> {
  return {
    key: "programName",
    title: "Program",
    dataIndex: "programName",
    width,
    render: (v: string) => (
      <span className="text-xs font-semibold text-slate-500">{v ?? "N/A"}</span>
    ),
  };
}

export function acaLevelCol<T extends { academicLevelName?: string }>(
  width = 120,
): TableColumnType<T> {
  return {
    key: "academicLevelName",
    title: "Aca. Level",
    dataIndex: "academicLevelName",
    width,
    render: (v: string) => (
      <span className="text-xs font-semibold text-slate-500">{v ?? "—"}</span>
    ),
  };
}

export function subLevelCol<T extends { subLevelName?: string }>(
  width = 120,
): TableColumnType<T> {
  return {
    key: "subLevelName",
    title: "Class",
    dataIndex: "subLevelName",
    width,
    render: (v: string) => (
      <span className="text-xs font-bold text-[#1E3A5F] bg-slate-100 px-2 py-1 rounded-lg">
        {v ?? "—"}
      </span>
    ),
  };
}

export function viewActionCol<T extends { studentId: string }>(
  navigate: NavigateFunction,
  detailPath = paths.admin.studentDetails.href,
  width = 54,
): TableColumnType<T> {
  return {
    key: "action",
    title: "",
    width,
    fixed: "right" as const,
    render: (_: unknown, record: T) => (
      <Tooltip title="View student">
        <Button
          size="small"
          onClick={() =>
            navigate(detailPath, { state: { studentId: record.studentId } })
          }
          className="rounded-lg! w-8! h-8! p-0! border-[#1E3A5F]/20! text-[#1E3A5F]! hover:bg-[#0D1B2E]! hover:text-[#C9A84C]! hover:border-[#0D1B2E]! flex items-center justify-center"
          icon={<Eye className="w-3.5 h-3.5" />}
        />
      </Tooltip>
    ),
  };
}

type ReportReq = {
  studentId: string;
  subLevelId: string;
};

export function generateReportCol<T extends ReportReq>(
  navigate: NavigateFunction,
  year?: string,
  term?: string,
  width = 100,
): TableColumnType<T> {
  return {
    key: "report-actions",
    title: "Reports",
    width,
    align: "center",
    fixed: "right" as const,
    render: (_: unknown, record: T) => (
      <div className="flex items-center gap-x-2">
        <Tooltip title="Generate Report">
          <Button
            size="small"
            onClick={() => {
              if (!year || !term) {
                toast.info("Please select year and term first");
                return;
              }
              navigate(paths.admin.stuReportDetail.href, {
                state: {
                  studentId: record.studentId,
                  subLevelId: record.subLevelId,
                  year,
                  term,
                },
              });
            }}
            className="rounded-lg! w-8! h-8! p-0! border-[#1E3A5F]/20! text-[#1E3A5F]! hover:bg-[#0D1B2E]! hover:text-[#C9A84C]! hover:border-[#0D1B2E]! flex items-center justify-center"
            icon={<FileText className="w-3.5 h-3.5" />}
          />
        </Tooltip>
        <Tooltip title="Generate Transcript">
          <Button
            size="small"
            onClick={() => {
              // Logic for transcript generation
            }}
            className="rounded-lg! w-8! h-8! p-0! border-amber-200! text-amber-600! hover:bg-amber-600! hover:text-white! hover:border-amber-600! flex items-center justify-center bg-amber-50"
            icon={<GraduationCap className="w-3.5 h-3.5" />}
          />
        </Tooltip>
      </div>
    ),
  };
}
