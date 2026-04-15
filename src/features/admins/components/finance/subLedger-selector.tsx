import { usePayment } from "@/store/payment.store";
import { Select } from "antd";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

const SubledgerSelector = () => {
  const { setSubLegder, subLedgers, selected } = usePayment(
    useShallow((s) => ({
      subLedgers: s.studentSubLedgers,
      setSubLegder: s.setSelectedSubLedger,
      selected: s.selectedSubLedger,
    })),
  );

  const subOptions = useMemo(() => {
    return subLedgers.map((s) => ({ label: s.sl, value: s.slCode }));
  }, [subLedgers]);

  return (
    <>
      <div className="flex flex-col w-full">
        <p
          className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          SubLedger
        </p>
        <Select
          size="large"
          allowClear
          options={subOptions}
          placeholder="Select sub ledger"
          value={selected}
          onChange={(v) => setSubLegder(v)}
        />
      </div>
    </>
  );
};
export default SubledgerSelector;
