import { Tour, Button, Space, Divider } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTourStore } from "@/store/tour.store";
import { generalTours } from "@/config/feature-tours";

/**
 * ManualTourManager handles manual tours that users can trigger
 * at any time to get a guided walkthrough of the app.
 */
const ManualTourManager = () => {
  const {
    currentGeneralTourStep,
    isManualTourActive,
    nextGeneralTourStep,
    previousGeneralTourStep,
    setGeneralTourStep,
    endManualTour,
  } = useTourStore();

  if (!isManualTourActive || generalTours.length === 0) {
    return null;
  }

  const tour = generalTours[0]; // Currently using first general tour
  const totalSteps = tour.steps.length;

  const handleClose = () => {
    endManualTour();
  };

  const handleNext = () => {
    if (currentGeneralTourStep + 1 < totalSteps) {
      nextGeneralTourStep();
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentGeneralTourStep > 0) {
      previousGeneralTourStep();
    }
  };

  return (
    <Tour
      open={isManualTourActive}
      onClose={handleClose}
      current={currentGeneralTourStep}
      onChange={setGeneralTourStep}
      steps={tour.steps.map((step) => ({
        ...step,
        description: (
          <div className="space-y-3">
            <div className="text-sm text-slate-600">{step.description}</div>
            <Divider className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Step {currentGeneralTourStep + 1} of {totalSteps}
              </span>
              <span className="text-xs text-slate-500">{tour.featureName}</span>
            </div>
            <Space size="small" style={{ width: "100%" }}>
              {currentGeneralTourStep > 0 && (
                <Button
                  size="small"
                  icon={<ChevronLeft className="w-4 h-4" />}
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
              <Button size="small" onClick={handleClose}>
                Exit Tour
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={handleNext}
              >
                {currentGeneralTourStep + 1 === totalSteps ? "Finish" : "Next"}
              </Button>
            </Space>
          </div>
        ),
      }))}
    />
  );
};

export default ManualTourManager;
