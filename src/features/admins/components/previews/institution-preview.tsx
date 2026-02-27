import { MotionDiv } from "@/components/custom/motion";
import { PreviewRow } from "../preview-row";
import {
  BookOpen,
  Calendar,
  Globe,
  Hash,
  Landmark,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { InstitutionGet } from "@/types/api/setup/institution";

interface Props {
  logoSrc: string;
  institution: InstitutionGet | undefined;
}

const InsititutionPreview = ({ logoSrc, institution }: Props) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="xl:sticky xl:top-6"
    >
      <div
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 4px 24px rgba(13,27,46,0.08)" }}
      >
        {/* Preview header — navy banner */}
        <div
          className="relative px-6 pt-8 pb-16 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          {/* Decorative circle */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: "#C9A84C" }}
          />
          <div
            className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-5"
            style={{ background: "#C9A84C" }}
          />
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C] mb-0 relative z-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Profile Preview
          </p>
        </div>

        {/* Logo overlapping the banner */}
        <div className="flex justify-center -mt-10 px-6 relative z-10">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-white bg-white overflow-hidden shrink-0"
            style={{ boxShadow: "0 8px 24px rgba(13,27,46,0.15)" }}
          >
            <img
              src={logoSrc}
              alt="Institution Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/no-logo.png";
              }}
            />
          </div>
        </div>

        {/* Name + Motto */}
        <div className="text-center px-6 pt-3 pb-4 border-b border-slate-100">
          <h3
            className="text-base font-bold text-[#0D1B2E] capitalize leading-snug mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {institution?.name ?? "Your Institution Name"}
          </h3>
          {institution?.motto && (
            <p className="text-xs italic text-slate-400 font-medium">
              "{institution.motto}"
            </p>
          )}
          {institution?.institutionType && (
            <span
              className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "rgba(201,168,76,0.12)",
                color: "#8B6914",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {institution.institutionType}
            </span>
          )}
        </div>

        {/* Detail rows */}
        <div className="px-5 py-2">
          <PreviewRow
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Established"
            value={institution?.establishedYear}
          />
          <PreviewRow
            icon={<Mail className="w-3.5 h-3.5" />}
            label="Email"
            value={institution?.email}
          />
          <PreviewRow
            icon={<Phone className="w-3.5 h-3.5" />}
            label="Phone"
            value={institution?.contact}
          />
          <PreviewRow
            icon={<Globe className="w-3.5 h-3.5" />}
            label="Website"
            value={institution?.websiteLink}
            link
          />
          <PreviewRow
            icon={<MapPin className="w-3.5 h-3.5" />}
            label="Location"
            value={
              [
                institution?.town,
                institution?.city,
                institution?.region,
                institution?.country,
              ]
                .filter(Boolean)
                .join(", ") || undefined
            }
          />
          <PreviewRow
            icon={<Hash className="w-3.5 h-3.5" />}
            label="GPS Address"
            value={institution?.address}
          />
          <PreviewRow
            icon={<Landmark className="w-3.5 h-3.5" />}
            label="Postal Address"
            value={institution?.postalAddress}
          />
        </div>

        {/* Description */}
        {institution?.description && (
          <div className="mx-5 mb-5 mt-1 p-4 bg-[#F8FAFD] rounded-xl border border-slate-100">
            <p
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              About
            </p>
            <div
              className="text-xs text-slate-600 leading-relaxed line-clamp-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              dangerouslySetInnerHTML={{ __html: institution.description }}
            />
          </div>
        )}

        {!institution && (
          <div className="flex flex-col items-center py-8 gap-2 px-6 text-center">
            <BookOpen className="w-10 h-10 text-slate-200" />
            <p className="text-sm text-slate-400 leading-relaxed">
              Fill in the form to see your institution profile preview here.
            </p>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};
export default InsititutionPreview;
