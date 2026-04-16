import { usePayment } from "@/store/payment.store";
import { Form, Input } from "antd";
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
      <Form.Item
        name="payer"
        rules={[{ required: true, message: "Payer phone is required" }]}
        label={
          <p
            className="text-xs font-bold text-slate-500 uppercase tracking-wide my-0! py-0!"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Payer
          </p>
        }
        className="flex flex-col w-full my-0! py-0!"
        labelCol={{ style: { paddingBottom: 0, marginBottom: 0 } }}
      >
        <Input
          size="large"
          placeholder="Enter the payer's phone number"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          className="my-0!"
        />
      </Form.Item>
      <Form.Item
        name="description"
        rules={[{ required: true, message: "Payment description is required" }]}
        label={
          <p
            className="text-xs font-bold text-slate-500 uppercase tracking-wide my-0! py-0!"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Description
          </p>
        }
        className="flex flex-col w-full my-0! py-0!"
        labelCol={{ style: { paddingBottom: 0, marginBottom: 0 } }}
      >
        <Input.TextArea
          size="large"
          placeholder="Enter payment description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="my-0!"
        />
      </Form.Item>
    </>
  );
};
export default PayerNDescription;
