import { eduKeys } from "@/config/query-keys";
import paths from "@/config/routes";
import useFetch from "@/hooks/api/use-fetch";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { useInfo } from "@/store/info.store";
import { signalRSelectors, useSignalRStore } from "@/store/signalr.store";
import { Modal, Button, Empty, Spin, Badge, Tooltip } from "antd";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

const InfoModal = () => {
  const {
    modalOpen,
    openModal,
    acknowledge,
    closeModal,
    dismissModal,
    shouldShowModal,
    // dontShowAgainFn,
  } = useInfo();

  // queries
  const { data: educationalLevels = [], isLoading: loadingEducationalLevels } =
    useFetch({
      queryFn: getAllEduLevelsFn,
      queryKeys: eduKeys.levels(),
    });
  const openedTerms = useSignalRStore(signalRSelectors.academicTerms);

  // Calculate unopened levels
  const unopenedLevels = useMemo(() => {
    if (!educationalLevels || !Array.isArray(educationalLevels)) return [];

    const openedLevelIds = new Set(
      openedTerms?.map((t) => t.educationalLevelId) || [],
    );

    return educationalLevels.filter(
      (level) => !openedLevelIds.has(level.educationalLevelId),
    );
  }, [educationalLevels, openedTerms]);

  const hasUnopenedLevels = unopenedLevels.length > 0;

  // Check if modal should be shown on mount and when conditions change
  useEffect(() => {
    if (!modalOpen && shouldShowModal(hasUnopenedLevels)) {
      openModal();
    }
  }, [modalOpen, hasUnopenedLevels, shouldShowModal, openModal]);

  // Periodic check every 30 seconds to see if modal should be shown
  useEffect(() => {
    const interval = setInterval(() => {
      if (!modalOpen && shouldShowModal(hasUnopenedLevels)) {
        openModal();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [modalOpen, hasUnopenedLevels, shouldShowModal, openModal]);

  const handleAcknowledge = () => {
    acknowledge();
    closeModal();
  };

  // const handleDontShowAgain = () => {
  //   dontShowAgainFn();
  //   closeModal();
  // };

  const handleClose = () => {
    dismissModal();
  };

  return (
    <Modal
      open={modalOpen}
      onCancel={handleClose}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <span className="text-destructive font-semibold">
            ⚠️ Action Required
          </span>
        </div>
      }
      styles={{
        body: { padding: 6 },
        container: { padding: 0 },
      }}
      width={600}
      closable={false}
      centered
      mask={{ blur: true, closable: false }}
    >
      <Spin spinning={loadingEducationalLevels}>
        <div className="flex flex-col p-4 gap-y-3">
          {/* Header Message */}
          <div className="bg-red-50 border-l-4 border-destructive p-4 rounded">
            <p className="text-sm font-medium text-gray-800">
              Terms of some educational levels aren't open yet. Please open
              before commencing operations.
            </p>
          </div>

          {/* Currently Opened Terms */}
          {openedTerms && openedTerms.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">
                <span className="text-green-500">✓</span> Currently Opened
                Terms:
              </h5>
              <div className="flex. flex-wrap. grid grid-cols-3 gap-2">
                {openedTerms.map((t) => (
                  <Badge
                    key={t.academicTermId}
                    color="green"
                    text={
                      <span className="text-xs font-medium">
                        {t.educationalLevelName} ({t.academicTermName})
                      </span>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unopened Levels */}
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-900">
              <span className="text-destructive">✗</span> Unopened Educational
              Levels:
            </h5>
            {unopenedLevels.length > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                {unopenedLevels.map((level) => (
                  <div
                    key={level.educationalLevelId}
                    className="flex items-center justify-between p-2 bg-white rounded border border-amber-100"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {level.educationalLevelName}
                    </span>
                    <Badge color="orange" text="Awaiting Term Setup" />
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                description="All educational levels have opened terms"
                style={{ margin: "20px 0" }}
              />
            )}
          </div>

          <Link
            onClick={handleAcknowledge}
            to={paths.admin.openAcademicTerm.href}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 hover:bg-slate-100 text-[#1E3A5F] rounded-lg border border-slate-200 transition-colors text-sm font-semibold group"
          >
            Go to Term Setup{" "}
            <ExternalLink
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            {/* <Button onClick={handleDontShowAgain} variant="filled" danger>
              Don't Show Again
            </Button> */}
            <Tooltip title="Will be reminded in 5 minutes">
              <Button onClick={handleAcknowledge} type="primary">
                Acknowledge
              </Button>
            </Tooltip>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default InfoModal;
