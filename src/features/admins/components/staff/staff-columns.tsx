/**
 * staffColumns.tsx
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
import { Eye } from "lucide-react";
import { formatDate } from "@/utils/date-n-time";
import { buildMediaUrl } from "@/utils/media";
import paths from "@/config/routes";
import { getInitials } from "@/utils/string";

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

export function staffSnCol<T>(width = 70): TableColumnType<T> {
  return {
    key: "staffId",
    title: "ID",
    dataIndex: "staffId",
    align: "center",
    width,
    render: (_, __, idx) => (
      <span className="font-bold text-[11px] tracking-wider text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded-lg">
        {idx + 1}
      </span>
    ),
  };
}

export function staffCodeCol<T extends { staffId: string }>(
  width = 135,
): TableColumnType<T> {
  return {
    key: "staffId",
    title: "ID",
    dataIndex: "staffId",
    width,
    ...searchFilter<T>("staffId" as keyof T, "Search ID"),
    render: (code: string) => (
      <span className="font-bold text-[11px] tracking-wider text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded-lg">
        {code}
      </span>
    ),
  };
}

export function staffTitleCol<T extends { title: string }>(
  width = 90,
): TableColumnType<T> {
  return {
    key: "title",
    title: "Title",
    dataIndex: "title",
    width,
    align: "center",
    filters: ["Mr", "Mrs", "Ms", "Dr"].map((v) => ({ text: v, value: v })),
    onFilter: (value, record) => record.title === value,
    render: (value: string) => (
      <span
        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
          value !== "Male"
            ? "bg-sky-50 text-sky-700 border border-sky-200"
            : "bg-pink-50 text-pink-700 border border-pink-200"
        }`}
      >
        {value}
      </span>
    ),
  };
}

export function staffImageCol<
  T extends { staffImage?: string; firstName: string; lastName: string },
>(width = 52): TableColumnType<T> {
  return {
    key: "staffImage",
    title: "",
    dataIndex: "staffImage",
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
          {getInitials(`${record.firstName} ${record.lastName}`) ?? "?"}
        </Avatar>
      ),
  };
}

export function staffNameCol<T extends { firstName: string; lastName: string }>(
  width: string | number = "50%",
): TableColumnType<T> {
  return {
    key: "firstName",
    title: "Staff Name",
    dataIndex: "firstName",
    width,
    ...searchFilter<T>("firstName" as keyof T, "Search name"),
    render: (name: string, record: T) => (
      <span className="font-semibold text-[#0D1B2E] text-sm">{`${name} ${record.lastName}`}</span>
    ),
  };
}

export function staffRoleCol<T extends { staffRole: string }>(
  width = 120,
  roles?: { text: string; value: string }[],
): TableColumnType<T> {
  return {
    key: "staffRole",
    title: "Role",
    dataIndex: "staffRole",
    width,
    align: "center",
    ...(roles && {
      filters: roles,
      onFilter: (value, record) => record.staffRole === value,
    }),
    render: (value: string) => (
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
        {value}
      </span>
    ),
  };
}
export function staffModeCol<T extends { staffMode: string }>(
  width = 120,
): TableColumnType<T> {
  return {
    key: "staffMode",
    title: "Mode",
    dataIndex: "staffMode",
    width,
    align: "center",
    filters: [
      { text: "Teaching", value: "TEACHING" },
      { text: "Non-Teaching", value: "NON-TEACHING" },
    ],
    onFilter: (value, record) => record.staffMode === value,
    render: (value: string) => (
      <span
        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
          value === "TEACHING"
            ? "bg-sky-50 text-sky-700 border border-sky-200"
            : "bg-pink-50 text-pink-700 border border-pink-200"
        }`}
      >
        {value}
      </span>
    ),
  };
}
export function staffGenderCol<T extends { gender: string }>(
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

export function staffDobCol<T extends { dateOfBirth: string }>(
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

export function staffAddressCol<T extends { address: string }>(
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

export function staffPhoneCol<T extends { staffPhone: string }>(
  width = 135,
): TableColumnType<T> {
  return {
    key: "staffPhone",
    title: "Phone",
    dataIndex: "staffPhone",
    width,
    ...searchFilter<T>("staffPhone" as keyof T, "Search Phone"),
    render: (code: string) => (
      <span className="font-bold text-[11px] tracking-wider text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded-lg">
        {code}
      </span>
    ),
  };
}

export function staffViewActionCol<T extends { staffId: string }>(
  navigate: NavigateFunction,
  detailPath = paths.admin.staffDetails.href,
  width = 94,
): TableColumnType<T> {
  return {
    key: "action",
    title: "",
    align: "center",
    width,
    fixed: "right" as const,
    render: (_: unknown, record: T) => (
      <Tooltip title="View Staff">
        <Button
          size="small"
          onClick={() =>
            navigate(detailPath, { state: { staffId: record.staffId } })
          }
          className="rounded-lg! w-8! h-8! p-0! border-[#1E3A5F]/20! text-[#1E3A5F]! hover:bg-[#0D1B2E]! hover:text-[#C9A84C]! hover:border-[#0D1B2E]! flex items-center justify-center"
          icon={<Eye className="w-3.5 h-3.5" />}
        />
      </Tooltip>
    ),
  };
}
