/**
 * AvatarUploader — drop-in replacement for the broken hidden-input version.
 *
 * Uses AntD's <Upload> with:
 *   - beforeUpload={() => false}  → prevents auto-POST, gives us the File object
 *   - showUploadList={false}      → we manage the preview ourselves
 *   - accept="image/*"
 *
 * Local preview is generated via URL.createObjectURL so the user sees
 * the new image immediately before the mutation resolves.
 * On error (404 / CORS on the server URL), the initials fallback is shown.
 *
 * Drop this into UserProfile.tsx replacing the old AvatarUploader component.
 * Everything else in UserProfile stays the same.
 */

import { Upload, Image } from "antd";
import type { UploadFile } from "antd/es/upload";
import { Camera } from "lucide-react";
import { useState } from "react";
import { buildMediaUrl } from "@/utils/media";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("") || "?";

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface AvatarUploaderProps {
  /** Path/URL from the server — passed through buildMediaUrl */
  currentImage?: string;
  /** Display name used for initials fallback */
  name: string;
  /** Called once the user selects a valid image file */
  onUpload: (file: File) => Promise<void>;
  /** While the upload mutation is in-flight */
  isUploading: boolean;
}

const AvatarUploader = ({
  currentImage,
  name,
  onUpload,
  isUploading,
}: AvatarUploaderProps) => {
  // Local object URL — shows the chosen image before the server responds
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  // Tracks whether the server image failed to load
  const [serverImgError, setServerImgError] = useState(false);

  const serverUrl = buildMediaUrl(currentImage, { useNoLogo: false });
  // Use local preview first, fall back to server URL
  const displayUrl = localPreview ?? (serverImgError ? null : serverUrl);
  const initials = getInitials(name);

  return (
    <div className="flex flex-col items-center gap-y-3">
      {/* ── Avatar + Upload trigger ── */}
      <div className="relative">
        {/* Avatar circle */}
        <div
          className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-[#C9A84C] text-3xl select-none "
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            boxShadow: "0 4px 20px rgba(13,27,46,0.25)",
          }}
        >
          {displayUrl ? (
            <Image
              key={displayUrl} /* force re-mount when URL changes */
              src={displayUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => {
                // Server image broken — clear preview & show initials
                setLocalPreview(null);
                setServerImgError(true);
              }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* ── AntD Upload wrapping the camera button ── */}
        <Upload
          accept="image/jpeg,image/png,image/webp,image/gif"
          showUploadList={false}
          /*
           * beforeUpload:
           *  1. Validates size (≤ 2 MB).
           *  2. Creates a local object URL for instant preview.
           *  3. Calls onUpload(file) to fire the mutation.
           *  4. Returns false — AntD will NOT attempt its own HTTP request.
           */
          beforeUpload={async (file: UploadFile) => {
            const raw = file as unknown as File;

            // ── Size guard ──
            const isUnder2MB = raw.size / 1024 / 1024 < 2;
            if (!isUnder2MB) {
              // Import toast at top of your file: import { toast } from "sonner"
              // We reference it via window to keep this snippet self-contained.
              // In your actual file just call toast.error(…) directly.
              toast.error("Avatar too large — max 2 MB");
              return false;
            }

            // ── Local preview ──
            // Revoke the previous object URL to avoid memory leaks
            if (localPreview) URL.revokeObjectURL(localPreview);
            const objectUrl = URL.createObjectURL(raw);
            setLocalPreview(objectUrl);
            setServerImgError(false); // reset any prior error state

            // ── Trigger mutation ──
            await onUpload(raw);

            // Returning false stops AntD's built-in upload mechanism
            return false;
          }}
          disabled={isUploading}
        >
          {/* Camera button — sits in the bottom-right corner of the avatar */}
          <button
            type="button"
            disabled={isUploading}
            className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            }}
            // Prevent the button's own click from bubbling and double-firing
            // onClick={(e) => e.stopPropagation()}
          >
            {isUploading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-[#C9A84C] animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-[#C9A84C]" />
            )}
          </button>
        </Upload>
      </div>

      {/* Caption */}
      <p className="text-[10px] text-slate-400 text-center font-medium">
        Click the camera icon to update photo
        <br />
        <span className="opacity-60">JPG, PNG, WebP · max 2 MB</span>
      </p>
    </div>
  );
};

export default AvatarUploader;

// ═══════════════════════════════════════════════════════════════════
// HOW TO WIRE IT INTO UserProfile.tsx
// ═══════════════════════════════════════════════════════════════════
//
// 1. Remove the old AvatarUploader definition from UserProfile.tsx.
//
// 2. Import this component:
//      import AvatarUploader from "@/features/admins/components/AvatarUploader";
//    (adjust path as needed)
//
// 3. The usage inside UserProfile is UNCHANGED:
//
//      <AvatarUploader
//        currentImage={profile?.staffImage}
//        name={displayName}
//        onUpload={(file) => {
//          const fd = new FormData();
//          fd.append("StaffImage", file);
//          uploadImage.mutate({ id: userId!, data: fd });
//        }}
//        isUploading={uploadImage.isPending}
//      />
//
// 4. Make sure toast.error is called inside beforeUpload instead of
//    console.warn if you want the 2 MB error surfaced to the user:
//
//      if (!isUnder2MB) {
//        toast.error("Image must be under 2 MB.");
//        return false;
//      }
//
// That's it — no other changes needed in UserProfile.tsx.
