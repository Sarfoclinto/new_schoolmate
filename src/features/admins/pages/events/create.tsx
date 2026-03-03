import { eduKeys, eventKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import type { EventGet, EventPost } from "@/types/api/event";
import { useQueryClient } from "@tanstack/react-query";
import { DatePicker, Form, Input, Select, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { SetupPage } from "../../components/setup-page";
import {
  createEventFn,
  deleteEventFn,
  getAllEvents,
  updateEventFn,
} from "@/services/event";
import usePost from "@/hooks/api/use-post";
import { toast } from "sonner";
import useUpdate from "@/hooks/api/use-update";
import { useAuth } from "@/store/auth.store";
import type { ColumnsType } from "antd/es/table";
import { CalendarPlusIcon } from "lucide-react";
import { formatDate } from "@/utils/date-n-time";
import { TableActions } from "../../components/table-action";
import dayjs from "@/lib/dayjs";
import type { SelectTypes } from "@/types/ui";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";

const { RangePicker } = DatePicker;
type FormValues = {
  Title: string;
  Description: string;
  Date: dayjs.Dayjs[];
  Type: "Event" | "Holiday" | "Break";
  EducationalLevel: {
    label: string;
    value: string;
  };
};

const CreateEvent = () => {
  // states
  const [form] = Form.useForm<FormValues>();
  const user = useAuth((s) => s.user);
  const terms = useAuth((s) => s.other.academicTerm);
  const [record, setRecord] = useState<EventGet | null>(null);
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);

  const qc = useQueryClient();

  //   effect
  useEffect(() => {
    if (record && record.academicTermCalendarId) {
      form.setFieldsValue({
        Title: record.title,
        Date:
          record.startDate && record.endDate
            ? [
                dayjs(record.startDate, "YYYY-MM-DD"),
                dayjs(record.endDate, "YYYY-MM-DD"),
              ]
            : undefined,
        Type: record.calendarType,
        Description: record.description,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);
  const termId = useMemo(() => {
    return terms.find((t) => t.educationalLevelId === selectedEdu?.value)
      ?.academicTermId;
  }, [selectedEdu?.value, terms]);

  // queries
  const { data: events, isLoading: loadingEvents } = useFetch({
    queryFn: () => getAllEvents(termId!),
    queryKeys: eventKeys.list({ termId }),
    enabled: !!termId,
  });
  const { data: eduLevels, isLoading: loadingEduLevels } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  //   memoized values
  const dataSource = useMemo(() => {
    if (!events) return [];
    return events;
  }, [events]);

  const eduOptions = useMemo(() => {
    if (!eduLevels) return [];
    return eduLevels.map((e) => ({
      label: e.educationalLevelName,
      value: e.educationalLevelId,
    }));
  }, [eduLevels]);

  // fns
  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: eventKeys.list({ termId }) });
  };

  // mutations
  const { mutate: addEvent, isPending: addingEvent } = usePost({
    postFn: createEventFn,
    mutationOptions: { mutationKey: ["events", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create event`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateEvent, isPending: updatingEvent } = useUpdate({
    updateFn: updateEventFn,
    mutationOptions: { mutationKey: ["events", "update"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create event`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteEvent, isPending: deletingEvent } = usePost({
    postFn: deleteEventFn,
    mutationOptions: { mutationKey: ["events", "delete"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to delete event`, {
        description: err?.message,
      });
    },
  });

  // fns
  const onFinish = (values: FormValues) => {
    if (!user) {
      toast.info("You are not logged in");
      return;
    }
    if (!termId) {
      toast.info("No active term found", {
        description: "Login in again or contact admin",
      });
      return;
    }
    const payload: EventPost = {
      AcademicTermId: termId,
      UserId: user.userId,

      CalendarType: values.Type,
      Description: values.Description,
      EndDate: dayjs(values.Date[1]).format("YYYY-MM-DD"),
      StartDate: dayjs(values.Date[0]).format("YYYY-MM-DD"),
      Title: values.Title,
    };

    if (record?.academicTermCalendarId) {
      updateEvent({ data: payload, id: record.academicTermCalendarId });
    } else {
      addEvent(payload);
    }
  };
  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  // data
  const isPending = addingEvent || updatingEvent || deletingEvent;
  const columns: ColumnsType<EventGet> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E] text-xs">
          {v ?? "Untitled Event"}
        </span>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#1E3A5F]">
            {formatDate(row.startDate)}
          </span>
          <span className="text-[9px] text-slate-400 uppercase tracking-tighter">
            to {formatDate(row.endDate)}
          </span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "calendarType",
      key: "calendarType",
      width: 80,
      render: (v: string) => {
        const colors: Record<string, string> = {
          Holiday: "gold",
          Event: "green",
          Break: "blue",
        };
        return (
          <Tag
            color={colors[v] || "default"}
            className="text-[10px] font-bold uppercase px-2 rounded-md border-none"
          >
            {v}
          </Tag>
        );
      },
    },
    {
      key: "action",
      title: "",
      width: 80,
      align: "right",
      render: (_, row) => (
        <TableActions
          onEdit={() => {
            setRecord(row);
          }}
          onDelete={() => {}}
          onConfirmDelete={() => deleteEvent(row.academicTermCalendarId)}
          deleteTitle="Delete this event?"
        />
      ),
    },
  ];

  return (
    <SetupPage
      title="Create Event"
      breadcrumb={["Events", "Create Event"]}
      hint={{
        note: "Create events such as holidays and breaks for the school. These will be shown on the calendar on all dashboards",
        example: "March 6th, 2026-Holiday, 8th-12th March-Break, etc",
      }}
      icon={<CalendarPlusIcon className="size-4" />}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingEvent
          ? "Updating…"
          : deletingEvent
            ? "Deleting…"
            : addingEvent
              ? "Adding…"
              : "Add Event"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingEvents,
        rowKey: "academicTermCalendarId",
        // showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            name="EducationalLevel"
            label="Educational Level"
            rules={[
              {
                required: true,
                message: "Educational Level is required",
              },
            ]}
            extra={
              <span className="text-xs font-medium font-mono">
                Select same educational level to see events
              </span>
            }
          >
            <Select
              placeholder="Select Educational Level"
              showSearch
              labelInValue
              onChange={(opt) => {
                setSelectedEdu(opt);
              }}
              options={eduOptions}
              loading={loadingEduLevels}
              disabled={loadingEduLevels}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="Title"
            label="Title"
            rules={[
              {
                required: true,
                message: "Title is required",
              },
            ]}
          >
            <Input placeholder="Event title or name. eg. Holiday name or Break name" />
          </Form.Item>
          <Form.Item
            name="Date"
            label="Start and End Date"
            extra={
              <span className="text-xs font-medium font-mono">
                Select same date if a single day event or holiday
              </span>
            }
            rules={[
              {
                required: true,
                message: "Please select start and end date",
              },
            ]}
          >
            <RangePicker className="w-full" />
          </Form.Item>
          <Form.Item
            label="Event Type"
            name="Type"
            required
            rules={[
              {
                required: true,
                message: "Please select Type",
              },
            ]}
          >
            <Select
              placeholder="Select either Event or Holiday"
              options={[
                {
                  label: "Event",
                  value: "Event",
                },
                {
                  label: "Holiday",
                  value: "Holiday",
                },
                {
                  label: "Break",
                  value: "Break",
                },
              ]}
            />
          </Form.Item>
          <Form.Item label="Description" name="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      }
    />
  );
};
export default CreateEvent;
