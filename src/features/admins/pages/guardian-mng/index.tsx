import { MotionDiv } from "@/components/custom/motion";
import { ChevronRight, ClipboardList, ShieldAlert } from "lucide-react";
import {
  CardHeader,
  EmptyState,
} from "../../components/teacher-util-components";
import useFetch from "@/hooks/api/use-fetch";
import { getAllGuardiansWithWardsFn } from "@/services/guardian";
import { guardianKeys } from "@/config/query-keys";
import type { ColumnsType } from "antd/es/table";
import type { GuardianWithWard } from "@/types/api/guardian";
import Table from "antd/es/table";
import { Button, Image } from "antd";
import { buildMediaUrl } from "@/utils/media";
import { getInitials } from "@/utils/string";
import { useDisclosure } from "@/hooks/use-disclosure";
import GuardianMap from "./map-guardian";

const GuardianManagement = () => {
  const { data: guardians = [], isLoading: loadingGuardians } = useFetch({
    queryFn: getAllGuardiansWithWardsFn,
    queryKeys: guardianKeys.custom("without-wards"),
    enabled: false,
  });
  const { isOpen, open, close } = useDisclosure(false);

  const count = guardians.length;

  const columns: ColumnsType<GuardianWithWard> = [
    {
      key: "sn",
      title: "S/N",
      render: (_, __, idx) => idx + 1,
      width: "20px",
      align: "center",
    },
    {
      key: "img",
      title: "Img",
      dataIndex: "guardianImage",
      width: "60px",
      align: "center",
      render: (v, r) =>
        v ? (
          <Image src={buildMediaUrl(v)} className="size-5 rounded-full" />
        ) : (
          <span className="size-5 rounded-lg text-amber-500 bg-slate-800">
            {getInitials(r.guardianName)}
          </span>
        ),
    },
    {
      key: "name",
      title: "Name",
      dataIndex: "guardianName",
      width: "40%",
      render: (v, r) => (
        <span className="flex flex-col">
          <span className="font-bold">{v}</span>
          <span className="text-xs font-medium">
            {r.guardianRelationship} &middot; {r.guardianContact}
          </span>
        </span>
      ),
    },
    {
      key: "wards",
      title: "Wards",
      render: (_, r) =>
        r.wards && r.wards.length > 0 ? (
          <span>
            {r.wards.map((w, i) => (
              <span
                key={i}
                className="text-amber-500 font-medium text-lg mx-1.5"
              >
                {w.wardName}
              </span>
            ))}
          </span>
        ) : (
          <span className="text-gray-500 font-medium text-lg">
            No ward assigned
          </span>
        ),
    },
  ];

  return (
    <>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
        {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
        <MotionDiv
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5 flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h1
              className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Guardian Management
            </h1>
            <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
              <span className="text-[#1E3A5F] font-semibold">Guardian</span>
              <ChevronRight className="w-3 h-3" />
              <span>Guardians</span>
            </nav>
          </div>

          <Button type="primary" onClick={open}>
            Map Students To Guardian
          </Button>
        </MotionDiv>

        <div className="flex flex-col gap-y-5">
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
          >
            <CardHeader
              icon={<ShieldAlert className="w-4 h-4" />}
              title="Guardians"
              badge={count ? `${count} total` : undefined}
            />
          </MotionDiv>

          {guardians.length > 0 ? (
            <Table<GuardianWithWard>
              styles={{ header: { cell: { color: "whitesmoke" } } }}
              rowKey={(r, i) => r.guardianId + i}
              loading={loadingGuardians}
              pagination={false}
              columns={columns}
              dataSource={guardians}
              locale={{
                emptyText: (
                  <EmptyState
                    icon={<ClipboardList className="w-6 h-6" />}
                    message="No guardian found"
                    sub="None found"
                  />
                ),
              }}
            />
          ) : (
            <EmptyState
              icon={<ClipboardList className="w-6 h-6" />}
              message="No guardian found"
              sub="None found"
            />
          )}
        </div>
        <GuardianMap isOpen={isOpen} close={close} count={count} />
      </div>
    </>
  );
};
export default GuardianManagement;
