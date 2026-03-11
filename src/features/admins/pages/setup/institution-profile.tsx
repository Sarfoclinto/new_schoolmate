import "@/styles/insitution-profile.css";
import { regionData } from "@/data/region-data";
import useFetch from "@/hooks/api/use-fetch";
import { useQueryClient } from "@tanstack/react-query";
import { Form, type UploadFile } from "antd";
import type { Dayjs } from "dayjs";
import { useCallback, useState, useEffect } from "react";
import dayjs from "@/lib/dayjs";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import { toast } from "sonner";
import { MotionDiv } from "@/components/custom/motion";
import { CheckCircle2, ChevronRight, Loader } from "lucide-react";
import { InstitutionForm } from "../../components/forms/institution-form";
import InsititutionPreview from "../../components/previews/institution-preview";
import {
  createInstitution,
  getInstitutionProfile,
  updateInstitution,
} from "@/services/setup/institution";
import { institutionKeys } from "@/config/query-keys";
import { buildMediaUrl } from "@/utils/media";
import { useUnsavedChangesWarning } from "@/hooks/useUsavedChangesWarning";
import { signalRSelectors, useSignalRStore } from "@/store/signalr.store";

const InstitutionProfile = () => {
  const [form] = Form.useForm();
  const updateInst = useSignalRStore(signalRSelectors.setInstitution);
  const [avatarFile, setAvatarFile] = useState<UploadFile[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [cityList, setCityList] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialValues, setInitialValues] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/no-logo.png");
  const queryClient = useQueryClient();

  //   queries here
  const { data: institution, isLoading: loadingInsititution } = useFetch({
    queryFn: getInstitutionProfile,
    queryKeys: institutionKeys.custom("profile"),
  });

  useEffect(() => {
    if (institution && institution.institutionId) {
      updateInst(institution);
      const values = {
        Name: institution.name,
        EstablishedYear: institution.establishedYear
          ? dayjs(institution.establishedYear, "YYYY")
          : undefined,
        InstitutionType: institution.institutionType,
        Email: institution.email,
        Contact: institution.contact,
        Country: institution.country ?? "Ghana",
        Region: institution.region,
        City: institution.city,
        Town: institution.town,
        PostalAddress: institution.postalAddress,
        Address: institution.address,
        WebsiteLink: institution.websiteLink,
        Motto: institution.motto,
        Description: institution.description,
      };
      form.setFieldsValue(values);
      setInitialValues(values);
      setAvatarUrl(buildMediaUrl(institution.logo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasChanges) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useUnsavedChangesWarning(hasChanges);

  const { mutate: create, isPending: creating } = usePost({
    postFn: createInstitution,
    mutationOptions: { mutationKey: ["institution", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        queryClient.invalidateQueries({
          queryKey: institutionKeys.all,
        });
        setAvatarFile([]);
        setHasChanges(false);
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create institution`, {
        description: err?.message,
      });
    },
  });

  const { mutate: update, isPending: updating } = useUpdate({
    updateFn: updateInstitution,
    mutationOptions: { mutationKey: ["institution", "update"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        queryClient.invalidateQueries({
          queryKey: institutionKeys.all,
        });
        setAvatarFile([]);
        setHasChanges(false);
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to update institution`, {
        description: err?.message,
      });
    },
  });

  // ── logo upload ──
  const handleAvatarChange = useCallback(
    ({ fileList }: { fileList: UploadFile[] }) => {
      setAvatarFile(fileList);

      if (fileList.length > 0) {
        setHasChanges(true);
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => setAvatarUrl(e.target?.result as string);
        reader.readAsDataURL(fileList[0].originFileObj);
      } else {
        setAvatarUrl("/no-logo.png");
      }
    },
    [],
  );

  const handleYearChange = (date: Dayjs | null) => {
    if (date) setSelectedYear(date.year().toString());
  };

  const handleRegionChange = (region: string) => {
    setCityList(regionData[region] || []);
    form.setFieldValue("City", undefined);
  };
  const handleValuesChange = () => {
    if (!initialValues) return;

    const currentValues = form.getFieldsValue(true);

    const isDifferent =
      JSON.stringify(normalize(currentValues)) !==
      JSON.stringify(normalize(initialValues));

    setHasChanges(isDifferent || avatarFile.length > 0);
  };

  const isPending = creating || updating;
  const logoSrc = buildMediaUrl(institution?.logo);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any) => {
    const formData = new FormData();
    formData.append("Name", values.Name);
    formData.append("Email", values.Email);
    formData.append("Contact", values.Contact);
    formData.append("Region", values.Region);
    formData.append("City", values.City);
    formData.append("Town", values.Town);
    formData.append("InstitutionType", values.InstitutionType);
    if (institution)
      formData.append("InstitutionId", institution.institutionId ?? "");
    if (selectedYear) formData.append("EstablishedYear", selectedYear);
    if (values.PostalAddress)
      formData.append("PostalAddress", values.PostalAddress);
    if (values.Address) formData.append("Address", values.Address);
    if (values.WebsiteLink) formData.append("WebsiteLink", values.WebsiteLink);
    if (values.Motto) formData.append("Motto", values.Motto);
    formData.append("Description", values.Description ?? "");
    avatarFile.forEach((file) => {
      if (file.originFileObj) formData.append("Logo", file.originFileObj);
    });

    if (institution?.institutionId) {
      update({ data: formData, instId: institution.institutionId });
    } else {
      create(formData);
    }
  };

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1
            className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Institution Profile
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">
              Institution Setup
            </span>
            <ChevronRight className="w-3 h-3" />
            <span>Profile</span>
          </nav>
        </div>

        {loadingInsititution ? (
          <div className="flex items-center gap-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            <Loader className="w-4 h-4 animate-spin" />
            Checking Profile...
          </div>
        ) : (
          institution && (
            <div className="flex items-center gap-x-2">
              {/* Profile configured */}
              <div className="flex items-center gap-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Profile configured
              </div>

              {/* Unsaved Changes Badge */}
              {hasChanges && (
                <div className="flex items-center gap-x-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl animate-pulse">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  Unsaved changes
                </div>
              )}
            </div>
          )
        )}
      </MotionDiv>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ════════ LEFT: Form ════════ */}
        <InstitutionForm
          form={form}
          isPending={isPending}
          cityList={cityList}
          avatarUrl={avatarUrl}
          avatarFile={avatarFile}
          institutionId={institution?.institutionId}
          hasChanges={hasChanges}
          handleValuesChange={handleValuesChange}
          onFinish={onFinish}
          handleAvatarChange={handleAvatarChange}
          handleYearChange={handleYearChange}
          handleRegionChange={handleRegionChange}
        />

        {/* ════════ RIGHT: Preview card ════════ */}
        <InsititutionPreview logoSrc={logoSrc} institution={institution} />
      </div>
    </main>
  );
};
export default InstitutionProfile;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (values: any) => {
  return {
    ...values,
    EstablishedYear: values.EstablishedYear
      ? values.EstablishedYear.year()
      : null,
  };
};
