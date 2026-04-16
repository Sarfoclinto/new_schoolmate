import { Form, InputNumber } from "antd";

type Props = {
  tendered?: number;
  setTendered?: (v: number) => void;
  required?: boolean;
};

const AmountTendered = ({ setTendered, tendered, required = false }: Props) => {
  return (
    <Form.Item
      name="tendered"
      rules={[{ required }]}
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
    >
      <InputNumber
        className="w-full!"
        size="large"
        placeholder="0.00"
        min={0}
        precision={2}
        value={tendered}
        onChange={(v) => setTendered?.(v ?? 0)}
      />
    </Form.Item>
  );
};
export default AmountTendered;
