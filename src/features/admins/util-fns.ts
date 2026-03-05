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
