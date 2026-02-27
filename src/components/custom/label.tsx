import { Tooltip } from "antd";

const Label: React.FC<{ text: string; hint?: string; required?: boolean }> = ({
  text,
  hint,
  required,
}) => (
  <div className="flex items-center gap-1.5 mb-1.5">
    <span className="text-[11px] font-semibold text-gray-600">
      {text}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </span>
    {hint && (
      <Tooltip title={hint}>
        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold flex items-center justify-center cursor-help">
          ?
        </span>
      </Tooltip>
    )}
  </div>
);

export default Label;
