/* eslint-disable @typescript-eslint/no-explicit-any */
import { LiveClock } from "@/components/custom/live-clock";
import { MotionButton, MotionDiv } from "@/components/custom/motion";
import useHasPermission from "@/hooks/custom/use-has-permission";
import { cn } from "@/lib/utils";
import { Button, Form, Table, type FormInstance, type TableProps } from "antd";
import { ChevronRight, X } from "lucide-react";
import { AnimatePresence } from "motion/react";

interface SetupPageProps<T extends object> {
  title: string;
  replaceCount?: boolean;
  countReplacement?: React.ReactNode;
  showTitle?: boolean;
  breadcrumb?: [string, string];
  icon: React.ReactNode;
  hint?: { note: string; example?: string };

  /** Live clock props */
  showClock?: boolean;
  clockProps?: React.ComponentProps<typeof LiveClock>;

  // node to place between header and body
  headerNode?: React.ReactNode;

  /** Currently selected record for editing */
  record?: object | null;
  onClearRecord?: () => void;

  form?: FormInstance;
  formContent?: React.ReactNode;
  showForm?: boolean;
  onFinish?: (values: any) => void;
  isPending?: boolean;
  pendingLabel?: string;
  submitLabel?: string;

  // permissions
  requiredRead?: string;
  requiredWrite?: string;

  showFormsHeader?: boolean;
  showTableHeader?: boolean;

  tableTitle?: React.ReactNode | (() => React.ReactNode);

  tableProps: Pick<
    TableProps<T>,
    | "columns"
    | "dataSource"
    | "loading"
    | "rowKey"
    | "pagination"
    | "showHeader"
    | "title"
  > & {
    title?: () => React.ReactNode;
    scroll?: TableProps<T>["scroll"];
  };
}

/**
 * SetupPage — reusable shell for all "form left + table right" setup pages.
 *
 * Usage:
 *   <SetupPage
 *     title="Roles"
 *     breadcrumb={["Institution Setup", "Roles"]}
 *     icon={<Shield />}
 *     hint={{ note: "...", example: "..." }}     // optional
 *     record={record}
 *     onClearRecord={() => setRecord(null)}
 *     formContent={<>...Form.Items...</>}
 *     onFinish={onFinish}
 *     form={form}
 *     isPending={...}
 *     pendingLabel="Saving…"
 *     tableProps={{ columns, dataSource, rowKey, loading }}
 *     tableTitle={<div>...</div>}                // optional extra title row
 *   />
 */

export function SetupPage<T extends object>({
  title,
  showTitle = true,
  replaceCount = false,
  countReplacement,
  breadcrumb,
  icon,
  hint,
  record,
  onClearRecord,
  form,
  formContent,
  onFinish,
  isPending = false,
  pendingLabel = "Saving…",
  submitLabel,
  tableTitle,
  tableProps,
  showClock = true,
  clockProps,
  headerNode,
  showForm = true,
  showFormsHeader = true,
  showTableHeader = true,
  requiredRead = "",
  requiredWrite = "",
}: SetupPageProps<T>) {
  const hasRead = useHasPermission(requiredRead);
  const hasWrite = useHasPermission(requiredWrite);

  const resolvedShowForm = showForm && hasWrite;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-3">
      {/* ── Page header ── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex items-center justify-between",
          showTitle || breadcrumb ? "mb-5" : "mb-0",
        )}
      >
        <div>
          {showTitle && title && (
            <h1
              className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h1>
          )}
          {breadcrumb && (
            <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
              <span className="text-[#1E3A5F] font-semibold">
                {breadcrumb[0]}
              </span>
              <ChevronRight className="w-3 h-3" />
              <span>{breadcrumb[1]}</span>
            </nav>
          )}
        </div>
        {showClock && <LiveClock {...clockProps} />}
      </MotionDiv>

      {headerNode && headerNode}

      {/* ── Two-column grid ── */}
      <div
        className={cn(
          "grid items-start",
          showForm ? "grid-cols-1 lg:grid-cols-2 gap-5" : "grid-cols-1",
        )}
      >
        {/* ════ LEFT – Form ════ */}
        {resolvedShowForm && (
          <MotionDiv
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
          >
            {/* Form header */}
            {showFormsHeader && (
              <div
                className="flex items-center justify-between gap-x-3 px-6 py-4 border-b border-slate-100"
                style={{
                  background:
                    "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                }}
              >
                <div className="flex items-center gap-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
                    {icon}
                  </div>
                  <span className="text-white font-semibold text-sm">
                    {record
                      ? `Edit ${title?.replace(/s$/, "")}`
                      : `Add ${title?.replace(/s$/, "")}`}
                  </span>
                </div>

                {/* Editing badge + clear */}
                <AnimatePresence>
                  {record && (
                    <MotionButton
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={onClearRecord}
                      className="flex items-center gap-x-1.5 text-[10px] font-bold tracking-widest uppercase bg-[#C9A84C]/20 text-[#C9A84C] px-2.5 py-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      Editing <X className="w-3 h-3" />
                    </MotionButton>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="p-6">
              {/* Hint box */}
              {hint && (
                <div className="mb-5 p-4 rounded-xl border border-blue-100 bg-blue-50/60">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-[#1E3A5F]">Note: </span>
                    {hint.note}
                  </p>
                  {hint.example && (
                    <p className="text-xs text-slate-500 mt-1.5">
                      <span className="font-semibold">Example: </span>
                      {hint.example}
                    </p>
                  )}
                </div>
              )}

              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={onFinish}
                className="flex flex-col gap-y-0"
              >
                {formContent}

                <Form.Item className="mb-0! mt-4!">
                  <Button
                    htmlType="submit"
                    type="primary"
                    size="large"
                    block
                    loading={isPending}
                    className="h-11! rounded-xl! font-bold! tracking-wide!"
                  >
                    {isPending
                      ? pendingLabel
                      : (submitLabel ??
                        (record
                          ? "Save Changes"
                          : `Add ${title?.replace(/s$/, "")}`))}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </MotionDiv>
        )}

        {/* ════ RIGHT – Table ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white relative rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          {!hasRead && (
            <span
              aria-disabled="true"
              className="z-999! absolute inset-0 bg-slate-800/90 backdrop-blur-xs! cursor-not-allowed group flex w-full h-full items-center justify-center"
            >
              <span className="group-hover:flex hidden transition-all duration-100 text-white">
                You don't have permission to view
              </span>
            </span>
          )}
          {showTableHeader && (
            <div
              className="flex items-center gap-x-3 px-6 py-4 border-b border-slate-100"
              style={{
                background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
                {icon}
              </div>
              <span className="text-white font-semibold text-sm">
                {title} Overview
              </span>
              {!replaceCount && tableProps.dataSource && (
                <span className="ml-auto text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2.5 py-0.5 rounded-full">
                  {(tableProps.dataSource as any[]).length} total
                </span>
              )}
              {replaceCount && countReplacement && (
                <span className="ml-auto text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2.5 py-0.5 rounded-full">
                  {countReplacement}
                </span>
              )}
            </div>
          )}

          {/* Optional extra title row (e.g. filter chips) */}
          {tableTitle && (
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 text-xs">
              {typeof tableTitle === "function" ? tableTitle() : tableTitle}
            </div>
          )}

          <div className="overflow-x-auto">
            <Table
              styles={{ header: { cell: { color: "white" } } }}
              {...tableProps}
              pagination={
                tableProps.pagination ?? { pageSize: 6, showSizeChanger: false }
              }
              className="setup-table"
              classNames={{ header: { cell: "setup-page-header-cell" } }}
              size="middle"
            />
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}
