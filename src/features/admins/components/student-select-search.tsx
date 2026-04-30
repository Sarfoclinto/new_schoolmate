import { useDebounce } from "@/hooks/use-debounce";
import { searchStudentFn } from "@/services/student";
import type { StudentOption } from "@/types/api/student";
import { useQuery } from "@tanstack/react-query";
import { Select, Spin, type SelectProps } from "antd";
import { Shield, User } from "lucide-react";
import { useState } from "react";

interface StudentSearchSelectProps extends Omit<
  SelectProps,
  "options" | "filterOption" | "onSearch" | "loading"
> {
  /** Placeholder label */
  placeholder?: string;
  /** Called when a guardian is selected — returns the full option object */
  onStudentSelect?: (guardian: StudentOption) => void;
}

const StudentSearchSelect = ({
  placeholder = "Search student by name or phone...",
  onStudentSelect,
  onChange,
  value,
  size = "large",
  ...rest
}: StudentSearchSelectProps) => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 350);

  const { data, isFetching } = useQuery({
    queryKey: ["student-search", debouncedSearch],
    queryFn: () =>
      searchStudentFn({
        search: debouncedSearch || undefined,
        page: 1,
        limit: 30,
      }),
    // Keep previous results visible while fetching new ones
    placeholderData: (prev) => prev,
    // Don't refetch on window focus for a search box
    staleTime: 30_000,
  });

  const students = data?.data ?? [];

  // Build options with rich labels
  const options = students.map((s) => ({
    value: s.studentId,
    label: s.fullName,
    // Store full guardian data for onGuardianSelect callback
    student: s satisfies StudentOption,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (val: string, option: any) => {
    onChange?.(val, option);
    if (option && onStudentSelect) {
      onStudentSelect(option.student);
    }
  };

  const handleSearch = (val: string) => {
    setSearchText(val);
  };

  return (
    <Select
      value={value}
      size={size}
      placeholder={placeholder}
      //   filterOption={false} // server-side filtering
      showSearch={{ onSearch: handleSearch, filterOption: false }}
      onChange={handleChange}
      loading={isFetching}
      notFoundContent={
        isFetching ? (
          <div className="flex items-center justify-center py-4 gap-2">
            <Spin size="small" />
            <span
              className="text-xs text-slate-400"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Searching...
            </span>
          </div>
        ) : searchText.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <User className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
            <span
              className="text-xs text-slate-400"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Type to search student
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <User className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
            <span
              className="text-xs text-slate-400"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              No student found for "{searchText}"
            </span>
          </div>
        )
      }
      optionRender={(opt) => {
        const stu = opt?.data?.student as StudentOption;
        return (
          <div className="flex items-center gap-2.5 py-0.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(30,58,95,0.08)" }}
            >
              <Shield
                className="w-3.5 h-3.5 text-[#1E3A5F]"
                strokeWidth={1.8}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-xs font-semibold text-[#0D1B2E] truncate"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {stu.fullName}
                </span>
                {stu.subLevelName && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium shrink-0"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {stu.subLevelName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  Guardian
                </span>
                {stu.guardianId && (
                  <span
                    className="text-[10px] text-slate-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    |{stu.guardianName} · {stu.guardianContact}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }}
      options={options}
      {...rest}
    />
  );
};

export default StudentSearchSelect;
