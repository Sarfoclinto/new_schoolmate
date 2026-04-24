"use client";

import { useEffect, useMemo } from "react";
import { Tour, Button, Space, Divider } from "antd";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useTourStore } from "@/store/tour.store";
import { featureTours } from "@/config/feature-tours";

/**
 * AutomaticTourManager handles displaying new feature tours automatically
 * when the app loads. Users haven't acknowledged these features yet.
 */
const AutomaticTourManager = () => {
  const {
    acknowledgedTours,
    currentFeatureTourIndex,
    showAutoTour,
    acknowledgeTour,
    // skipCurrentTour,
    nextFeatureTour,
    previousFeatureTour,
    startAutoTours,
    closeAutoTours,
  } = useTourStore();

  // Get pending tours (not yet acknowledged)
  const pendingTours = useMemo(() => {
    return featureTours
      .filter((tour) => tour.enabled && !acknowledgedTours[tour.id])
      .sort((a, b) => b.priority - a.priority);
  }, [acknowledgedTours]);

  // Start tours on mount
  useEffect(() => {
    if (pendingTours.length > 0) {
      startAutoTours(pendingTours);
    }
  }, [pendingTours, startAutoTours]);

  if (!showAutoTour || pendingTours.length === 0) {
    return null;
  }

  const currentTour = pendingTours[currentFeatureTourIndex];
  const isLastTour = currentFeatureTourIndex === pendingTours.length - 1;
  const totalTours = pendingTours.length;

  const handleClose = () => {
    acknowledgeTour(currentTour.id);
    if (isLastTour) {
      closeAutoTours();
    } else {
      nextFeatureTour();
    }
  };

  const handleSkip = () => {
    acknowledgeTour(currentTour.id);
    if (isLastTour) {
      closeAutoTours();
    } else {
      nextFeatureTour();
    }
  };

  const handleNext = () => {
    acknowledgeTour(currentTour.id);
    if (isLastTour) {
      closeAutoTours();
    } else {
      nextFeatureTour();
    }
  };

  const handlePrevious = () => {
    previousFeatureTour();
  };

  return (
    <Tour
      open={showAutoTour}
      onClose={handleClose}
      steps={currentTour.steps.map((step) => ({
        ...step,
        description: (
          <div className="space-y-3">
            <div className="text-sm text-slate-600">{step.description}</div>
            <Divider className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {currentFeatureTourIndex + 1} of {totalTours}
              </span>
              <span className="text-xs text-slate-500">
                {currentTour.featureName}
              </span>
            </div>
            <Space size="small" style={{ width: "100%" }}>
              {currentFeatureTourIndex > 0 && (
                <Button
                  size="small"
                  icon={<ChevronLeft className="w-4 h-4" />}
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
              <Button size="small" onClick={handleSkip}>
                Skip
              </Button>
              <Button
                type="primary"
                size="small"
                icon={
                  isLastTour ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )
                }
                onClick={handleNext}
              >
                {isLastTour ? "Done" : "Next"}
              </Button>
            </Space>
          </div>
        ),
      }))}
    />
  );
};

export default AutomaticTourManager;
