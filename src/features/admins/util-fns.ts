import type { Permission } from "@/config/permissions";
import { buildMediaUrl } from "@/utils/media";
import { dataURLtoFile } from "@/utils/others";
import type { UploadFile } from "antd";
import { useEffect, useRef, useState } from "react";
import type Webcam from "react-webcam";

/** Build a preview URL from a path — handles empty/undefined */
/** usePhotoState — manages file list + preview URL + webcam capture */
export function usePhotoState(initialPath?: string) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState(buildMediaUrl(initialPath));
  const webcamRef = useRef<Webcam | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(buildMediaUrl(initialPath));
    setFileList([]);
  }, [initialPath]);

  const handleChange = ({ fileList: fl }: { fileList: UploadFile[] }) => {
    setFileList(fl);
    if (fl[0]?.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(fl[0].originFileObj);
    }
  };

  const stopStream = () => {
    const stream = webcamRef.current?.video?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  };

  const capture = () => {
    const src = webcamRef.current?.getScreenshot();
    if (src) {
      setPreviewUrl(src);
      setFileList([
        {
          uid: `-${Date.now()}`,
          name: "captured.jpg",
          status: "done",
          url: src,
          originFileObj: dataURLtoFile(src, "captured.jpg"),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ]);
      stopStream();
      setCameraOpen(false);
    }
  };

  return {
    fileList,
    previewUrl,
    webcamRef,
    cameraOpen,
    setCameraOpen,
    handleChange,
    capture,
    stopStream,
  };
}

// READ ↔ WRITE dependency map
const WRITE_REQUIRES_READ: Partial<Record<Permission, Permission>> = {
  // admin
  "admin:setup:write": "admin:setup:read",
  "admin:students:write": "admin:students:read",
  "admin:staff:write": "admin:staff:read",
  "admin:finance:write": "admin:finance:read",
  "admin:events:write": "admin:events:read",
  "admin:records:write": "admin:records:read",
  "admin:attendance:write": "admin:attendance:read",
  "admin:permissions:write": "admin:permissions:read",
  "admin:session:write": "admin:session:read",

  // staff
  "staff:assignments:write": "staff:assignments:read",
  "staff:records:write": "staff:records:read",
};

/** Given a permission key, return its paired READ (if it's a WRITE) */
export const getReadCounterpart = (p: Permission): Permission | null =>
  WRITE_REQUIRES_READ[p] ?? null;

/** Given a READ permission, return its paired WRITE (if one exists) */
export const getWriteCounterpart = (p: Permission): Permission | null => {
  const entry = Object.entries(WRITE_REQUIRES_READ).find(
    ([, read]) => read === p,
  );
  return entry ? (entry[0] as Permission) : null;
};

export const isWritePermission = (p: Permission) => p.endsWith(":write");
export const isReadPermission = (p: Permission) => p.endsWith(":read");

// ── Enforce consistency: adding WRITE auto-adds READ; removing READ auto-removes WRITE
export const enforceConstraints = (
  current: Set<Permission>,
  toggled: Permission,
  adding: boolean,
): Set<Permission> => {
  const next = new Set(current);
  if (adding) {
    next.add(toggled);
    // WRITE requires READ
    const read = getReadCounterpart(toggled);
    if (read) next.add(read);
  } else {
    next.delete(toggled);
    // Removing READ removes paired WRITE
    if (isReadPermission(toggled)) {
      const write = getWriteCounterpart(toggled);
      if (write) next.delete(write);
    }
  }
  return next;
};

// ── Adjust permissions to remove all at once
export const toggleGroupAll = (
  current: Set<Permission>,
  group: Permission[],
  allOn: boolean,
): Set<Permission> => {
  let next = new Set(current);
  if (allOn) {
    // Turn everything off
    group.forEach((p) => {
      next.delete(p);
      if (isReadPermission(p)) {
        const write = getWriteCounterpart(p);
        if (write) next.delete(write);
      }
    });
  } else {
    // Turn everything on (adds all + auto-dependencies)
    group.forEach((p) => {
      next = enforceConstraints(next, p, true);
    });
  }
  return next;
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES (adapt to your API shape)
// ═══════════════════════════════════════════════════════════════════════════════
// interface StaffListItem {
//   userId: string;
//   fullName: string;
//   staffRole: string;
//   email: string;
//   staffImage?: string;
//   currentPermissions: Permission[];
// }
