import { studentKeys } from "@/config/query-keys";
import { usePhotoState } from "@/features/admins/util-fns";
import useUpdate from "@/hooks/api/use-update";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "antd";
import { CheckCircle2, Heart, UploadIcon, User, Users } from "lucide-react";
import { toast } from "sonner";

interface Props {
  images: {
    studentId: string;
    student: string;
    parentId: string;
    mother: string;
    father: string;
    guardianId: string;
    guardian: string;
  };
}

const UpdateImages = ({ images }: Props) => {
  const qc = useQueryClient();
  const studentPhoto = usePhotoState(images.student);
  const fatherPhoto = usePhotoState(images.father);
  const motherPhoto = usePhotoState(images.mother);
  const guardianPhoto = usePhotoState(images.guardian);

  const update = useUpdate({
    updateFn: () =>
      Promise.resolve({ responseCode: 1, responseMessage: "Success" }),
    mutationOptions: {
      mutationKey: ["student-update", "personal-info", images.studentId],
    },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        invalidate();
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Failed to update personal info", {
        description: err.message,
      });
    },
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: studentKeys.detail(images.studentId) });

  const handleSave = () => {
    const fd = new FormData();
    studentPhoto.fileList.forEach((f) => {
      if (f.originFileObj) fd.append("StudentImage", f.originFileObj);
    });
    fatherPhoto.fileList.forEach((f) => {
      if (f.originFileObj) fd.append("FatherImage", f.originFileObj);
    });
    motherPhoto.fileList.forEach((f) => {
      if (f.originFileObj) fd.append("MotherImage", f.originFileObj);
    });
    guardianPhoto.fileList.forEach((f) => {
      if (f.originFileObj) fd.append("GuardianImage", f.originFileObj);
    });
    update.mutate(fd);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <p className="text-xs text-slate-900 mb-4 leading-relaxed p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
        <span className="font-bold text-[#041325]">Note: </span>
        Only upload photos you want to change. Unchanged photos will remain
        as-is.
      </p>

      <div className="flex flex-col gap-y-3">
        <PersonPhotoCard
          label="Student"
          icon={<User className="w-3 h-3" />}
          photo={studentPhoto}
        />
        <PersonPhotoCard
          label="Father"
          icon={<Users className="w-3 h-3" />}
          photo={fatherPhoto}
        />
        <PersonPhotoCard
          label="Mother"
          icon={<Users className="w-3 h-3" />}
          photo={motherPhoto}
        />
        <PersonPhotoCard
          label="Guardian"
          icon={<Heart className="w-3 h-3" />}
          photo={guardianPhoto}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={update.isPending}
        className={`mt-5 w-full h-11 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-x-2.5 transition-all duration-200
          ${update.isPending ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-white hover:opacity-90 active:scale-[0.98] cursor-pointer"}`}
        style={
          update.isPending
            ? {}
            : {
                background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
              }
        }
      >
        {update.isPending ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
            Save Photos
          </>
        )}
      </button>
    </div>
  );
};
export default UpdateImages;

const PersonPhotoCard = ({
  label,
  icon,
  photo,
}: {
  label: string;
  icon: React.ReactNode;
  photo: ReturnType<typeof usePhotoState>;
}) => (
  <div className="flex flex-col gap-y-2 p-4 bg-slate-50 border border-slate-100 rounded-xl">
    <div className="flex items-center gap-x-2 mb-1">
      <div className="w-6 h-6 rounded-lg bg-[#0D1B2E] flex items-center justify-center text-[#C9A84C] shrink-0">
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-[#1E3A5F]">
        {label}
      </span>
    </div>

    {/* Current photo preview */}
    <div className="flex items-center gap-x-3">
      <div
        className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white bg-[#0D1B2E] shrink-0"
        style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.12)" }}
      >
        <img
          src={photo.previewUrl}
          alt={label}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/no-logo.png";
          }}
        />
      </div>
      <Upload
        listType="text"
        fileList={photo.fileList}
        onChange={photo.handleChange}
        beforeUpload={() => false}
        accept="image/*"
        maxCount={1}
      >
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 px-3 py-2 text-[11px] font-semibold text-[#1E3A5F] bg-white border border-slate-200 rounded-lg hover:bg-[#1E3A5F] hover:text-white hover:border-[#1E3A5F] transition-all cursor-pointer"
        >
          <UploadIcon className="w-3 h-3" />
          {photo.fileList.length > 0 ? "Change" : "Upload"}
        </button>
      </Upload>
    </div>
  </div>
);
