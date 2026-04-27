import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CirclePlus,
  ChevronsUp,
  Upload,
  ArrowLeft,
  HomeIcon,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import PrimaryButton from "../custom/primary-button";
import { LiveClock } from "../custom/live-clock";
import { getUserDashboardRoute } from "@/utils/auth";

export type Crumb = {
  label: string;
  path?: string;
  icon?: ReactNode;
  type?: "link" | "text";
};

export type AdditionalButton = {
  label: ReactNode;
  onClick: () => Promise<void> | void;
  className?: string;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
};

interface PageHeaderProps {
  title?: React.ReactNode;
  back?: boolean;
  showExcelButton?: boolean;
  onUploadClick?: () => void;
  breadcrumbs: Array<Crumb>;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  button?: React.ReactNode;

  uploadLable?: string;
  uploadClassName?: string;
  uploadIcon?: ReactNode;

  otherButtons?: AdditionalButton[];

  showLiveClock?: boolean;
  liveClockProps?: React.ComponentProps<typeof LiveClock>;

  className?: string;
}

export const PageHeader = ({
  title,
  breadcrumbs,
  actionButton,
  back = false,
  showExcelButton = false,
  onUploadClick,
  button,
  uploadClassName,
  uploadLable,
  uploadIcon,
  otherButtons,
  showLiveClock = true,
  liveClockProps = { mode: "both" },
  className,
}: PageHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h1
          className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbLink href={getUserDashboardRoute()}>
              <HomeIcon className="size-3.5" />
            </BreadcrumbLink>
            <BreadcrumbSeparator />
            {breadcrumbs?.map((crumb, index) => (
              <React.Fragment key={crumb.label}>
                <BreadcrumbItem className="min-w-fit">
                  {index === breadcrumbs.length - 1 ? (
                    <span className="min-w-fit cursor-pointer text-slate-400 flex items-center gap-x-1 text-xs">
                      {crumb.icon} {crumb.label}
                    </span>
                  ) : crumb.type !== "link" ? (
                    <span className="text-[#1E3A5F] font-semibold cursor-pointer text-xs">
                      {crumb.icon} {crumb.label}
                    </span>
                  ) : (
                    <BreadcrumbLink href={crumb.path} className=" text-xs">
                      {crumb.icon} {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between gap-2">
        {button
          ? button
          : actionButton && (
              <PrimaryButton
                label={actionButton.label}
                icon={
                  back ? (
                    <ArrowLeft />
                  ) : (
                    <CirclePlus size={14} className="mr-2" />
                  )
                }
                className="bg-[#3096f5] py-1.5"
                onClick={actionButton.onClick}
              />
            )}

        {showExcelButton && (
          <PrimaryButton
            icon={uploadIcon ?? <Upload size={14} className="mr-2" />}
            onClick={onUploadClick}
            className={cn(
              "bg-green-600 hover:bg-green-700 flex items-center py-1.5",
              uploadClassName,
            )}
            label={uploadLable ?? "Upload Excel"}
          />
        )}
        {otherButtons && (
          <div className="flex items-center gap-x-2">
            {otherButtons.map((btn, idx) => (
              <PrimaryButton key={idx} {...btn} />
            ))}
          </div>
        )}
        {showLiveClock && <LiveClock {...liveClockProps} />}
        <div className="w-9 h-9 flex items-center justify-center border rounded-md cursor-pointer">
          <ChevronsUp size={14} />
        </div>
      </div>
    </div>
  );
};
