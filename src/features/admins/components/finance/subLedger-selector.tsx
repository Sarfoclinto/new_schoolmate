import { usePayment } from "@/store/payment.store";
import { Form, Select } from "antd";
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
      <Form.Item
        name="subledger"
        label={
          <p
            className="text-xs font-bold text-slate-500 uppercase tracking-wide my-0! py-0!"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            SubLedger
          </p>
        }
        className="flex flex-col w-full my-0! py-0!"
        labelCol={{ style: { paddingBottom: 0, marginBottom: 0 } }}
      >
        <Select
          size="large"
          allowClear
          options={subOptions}
          placeholder="Select sub ledger"
          value={selected}
          onChange={(v) => setSubLegder(v)}
        />
      </Form.Item>
    </>
  );
};
export default SubledgerSelector;
