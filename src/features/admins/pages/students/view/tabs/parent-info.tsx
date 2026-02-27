import { MotionDiv } from "@/components/custom/motion";
import { Image } from "antd";
import { User, Phone } from "lucide-react";
import { buildMediaUrl } from "@/utils/media";

interface Props {
  mother: {
    id: string;
    name: string;
    img: string;
    phone: string;
    occupation: string;
    status: "Deceased" | "Alive";
  };
  father: {
    studentId: string;
    id: string;
    name: string;
    img: string;
    phone: string;
    occupation: string;
    status: "Deceased" | "Alive";
  };
}

const ParentsInfo = ({ father, mother }: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <PersonInfoCard
        title="Father"
        icon={<User className="w-3.5 h-3.5" />}
        img={father.img}
        statusBadge={father.status}
        fields={[
          {
            label: "Full Name",
            value: father.name,
            icon: <User className="w-3 h-3" />,
          },
          {
            label: "Phone",
            value: father.phone,
            icon: <Phone className="w-3 h-3" />,
          },
          { label: "Occupation", value: father.occupation },
        ]}
      />
      <PersonInfoCard
        title="Mother"
        icon={<User className="w-3.5 h-3.5" />}
        img={mother.img}
        statusBadge={mother.status}
        fields={[
          {
            label: "Full Name",
            value: mother.name,
            icon: <User className="w-3 h-3" />,
          },
          {
            label: "Phone",
            value: mother.phone,
            icon: <Phone className="w-3 h-3" />,
          },
          { label: "Occupation", value: mother.occupation },
        ]}
      />
    </div>
  );
};
export default ParentsInfo;

/** A single person info card — reused for Father, Mother, Guardian */
export const PersonInfoCard = ({
  title,
  icon,
  img,
  fields,
  statusBadge,
  // accentColor = "navy",
}: {
  title: string;
  icon: React.ReactNode;
  img?: string;
  fields: { label: string; value?: string; icon?: React.ReactNode }[];
  statusBadge?: string;
  // accentColor?: "navy" | "gold";
}) => {
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
  const isDeceased = statusBadge?.toLowerCase() === "deceased";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 2px 10px rgba(13,27,46,0.06)" }}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-x-3 px-5 py-3"
        style={{
          background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        }}
      >
        <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
          {icon}
        </div>
        <span
          className="text-white font-bold text-xs uppercase tracking-widest flex-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </span>
        {statusBadge && (
          <span
            className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full
            ${
              isDeceased
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {statusBadge}
          </span>
        )}
      </div>

      <div className="p-5 flex items-start gap-x-4">
        {/* Avatar */}
        <div
          className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-white
          ${isDeceased ? "grayscale opacity-60" : ""}`}
          style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.10)" }}
        >
          {img ? (
            <Image
              src={buildMediaUrl(img)}
              width={64}
              height={64}
              className="object-cover w-full h-full"
              fallback="/no-logo.png"
              preview={!!img}
            />
          ) : (
            <div className="w-full h-full bg-[#0D1B2E] flex items-center justify-center text-[#C9A84C] text-base font-bold select-none">
              {initials || "?"}
            </div>
          )}
        </div>

        {/* Fields grid */}
        <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex flex-col gap-y-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-x-1">
                {f.icon && <span className="text-slate-300">{f.icon}</span>}
                {f.label}
              </span>
              <span
                className="text-sm font-semibold text-[#0D1B2E] truncate"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {f.value || (
                  <span className="text-slate-300 font-normal italic text-xs">
                    N/A
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MotionDiv>
  );
};
