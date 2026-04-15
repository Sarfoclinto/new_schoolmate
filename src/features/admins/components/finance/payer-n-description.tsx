import { usePayment } from "@/store/payment.store";
import { Input } from "antd";
import { useShallow } from "zustand/react/shallow";

const PayerNDescription = () => {
  const { description, payer, setDescription, setPayer } = usePayment(
    useShallow((s) => ({
      payer: s.payer,
      setPayer: s.setPayer,
      description: s.description,
      setDescription: s.setDescription,
    })),
  );
  return (
    <>
      <div className="flex flex-col w-full">
        <p
          className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Payer
        </p>
        <Input
          size="large"
          placeholder="Enter the payer's phone number"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
        />
      </div>
      <div className="flex flex-col w-full">
        <p
          className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Description
        </p>
        <Input.TextArea
          size="large"
          placeholder="Enter payment description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </>
  );
};
export default PayerNDescription;
