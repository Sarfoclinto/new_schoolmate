import { Spin } from "antd";
import { Loader2Icon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

type PrimaryButtonProps = {
  label: ReactNode;
  onClick?: (val: unknown) => void;
  style?: CSSProperties;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  htmlType?: "button" | "submit" | "reset";
  customStyle?: CSSProperties;
};

const PrimaryButton = ({
  label,
  onClick,
  style,
  icon,
  loading,
  disabled,
  className,
  htmlType = "submit",
  customStyle,
}: PrimaryButtonProps) => {
  return (
    <button
      type={htmlType}
      disabled={disabled}
      style={{ ...style, ...customStyle }}
      onClick={(val) => onClick && onClick(val)}
      className={`rounded-md shadow-sm px-4 py-1 text-white ${
        disabled ? "cursor-not-allowed" : ""
      } ${loading ? "opacity-75 hover:opacity-60" : "hover:opacity-80"} ${
        !(disabled || loading) && "active:opacity-70"
      } ${className}`}
    >
      <span className="flex items-center justify-end">
        {loading && (
          <Spin
            size="small"
            indicator={
              <Loader2Icon className="mr-2" style={{ color: "white" }} />
            }
          />
        )}{" "}
        {icon} {label}
      </span>
    </button>
  );
};

export default PrimaryButton;
