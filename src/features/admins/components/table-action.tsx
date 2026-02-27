import { Button, Popconfirm, Tooltip, type PopconfirmProps } from "antd";
import { Pencil, Trash2 } from "lucide-react";

interface UsePop {
  tooltipTitle: string;
  popConfirmConfig: PopconfirmProps;
}
interface WithoutPop {
  renderNode: React.ReactNode;
}

export type UsePopOrWithoutPop = UsePop | WithoutPop;

interface TableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
  deleteTitle?: string;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  node?: UsePopOrWithoutPop;
  editProps?: {
    title?: string;
    icon?: React.ReactNode;
  };
}

export const TableActions = ({
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  deleteTitle = "Delete this record?",
  editDisabled,
  deleteDisabled,
  node,
  editProps = { title: "Edit", icon: <Pencil className="w-3.5 h-3.5" /> },
}: TableActionsProps) => (
  <div className="flex items-center gap-x-2">
    {onEdit && (
      <Tooltip title={editProps.title}>
        <Button
          size="small"
          disabled={editDisabled}
          onClick={onEdit}
          className="border-[#1E3A5F]/20! text-[#1E3A5F]! hover:bg-[#1E3A5F]! hover:text-white! rounded-lg! w-8! h-8! p-0! flex items-center justify-center"
          icon={editProps.icon}
        />
      </Tooltip>
    )}

    {onDelete && onConfirmDelete && (
      <Tooltip title="Delete">
        <Popconfirm
          title={deleteTitle}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, size: "small" }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        >
          <Button
            size="small"
            danger
            disabled={deleteDisabled}
            onClick={onDelete}
            className="rounded-lg! w-8! h-8! p-0! flex items-center justify-center"
            icon={<Trash2 className="w-3.5 h-3.5" />}
          />
        </Popconfirm>
      </Tooltip>
    )}

    {node && "renderNode" in node ? (
      node.renderNode
    ) : (
      <Tooltip title={node?.tooltipTitle}>
        {node?.popConfirmConfig && <Popconfirm {...node.popConfirmConfig} />}
      </Tooltip>
    )}
  </div>
);
