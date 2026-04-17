import { usePayment } from "@/store/payment.store";
import { Form, InputNumber } from "antd";

type Props = {
  required?: boolean;
  initialValue?: number;
};

const AmountTendered = ({ initialValue = 0, required = true }: Props) => {
  const amount = usePayment((s) => s.amount);
  const initial = amount ?? initialValue;

  return (
    <Form.Item
      name="tendered"
      rules={[{ required, message: "Amount tendered is required" }]}
      label={
        <p
          className="text-xs font-bold text-slate-500 uppercase tracking-wide my-0!"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Amount Tendered
        </p>
      }
      className="my-0! py-0!"
      labelCol={{ style: { paddingBottom: 0, marginBottom: 0 } }}
      initialValue={initial || undefined}
    >
      <InputNumber
        className="w-full!"
        size="large"
        placeholder="0.00"
        min={0}
        precision={2}
      />
    </Form.Item>
  );
};
export default AmountTendered;
