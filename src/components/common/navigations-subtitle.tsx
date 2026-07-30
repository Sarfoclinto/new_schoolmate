import { ChevronsUpDown } from "lucide-react";

type Props = {
  onClick: () => void;
};

const NavigationSubtitle = ({ onClick }: Props) => {
  return (
    <div className="px-5 pt-5 pb-2 flex items-center justify-between">
      {" "}
      <span
        className="text-[10px] font-semibold tracking-[0.18em] uppercase"
        style={{ color: "#4A6080", fontFamily: "'DM Sans', sans-serif" }}
      >
        {" "}
        Navigation{" "}
      </span>{" "}
      <button
        type="button"
        onClick={onClick}
        className="text-[#4A6080] hover:text-white transition-colors"
        title="Collapse all menus"
      >
        {" "}
        <ChevronsUpDown className="size-3" />{" "}
      </button>{" "}
    </div>
  );
};
export default NavigationSubtitle;
