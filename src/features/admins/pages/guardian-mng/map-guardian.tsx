import { MotionDiv } from "@/components/custom/motion";
import type { GuardianStudentMapPost } from "@/types/api/guardian";
import { Button, Form } from "antd";
import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import GuardianSearchSelect from "../../components/guardian-select-search";
import StudentSearchSelect from "../../components/student-select-search";

type Props = {
  isOpen: boolean;
  close: () => void;
  count: number;
};

const GuardianMap = ({ close, isOpen, count }: Props) => {
  const [form] = Form.useForm<GuardianStudentMapPost>();
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <MotionDiv
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(13,27,46,0.35)",
                backdropFilter: "blur(2px)",
              }}
              onClick={close}
            />
            {/* drawer panel */}
            <MotionDiv
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 bg-white flex flex-col"
              style={{
                width: "min(570px, 100vw)",
                boxShadow: "-8px 0 40px rgba(13,27,46,0.15)",
              }}
            >
              {/* ── Drawer header ─── */}
              <div
                className="flex items-center gap-x-3 px-5 py-4 shrink-0"
                style={{
                  background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-x-2 mt-0.5 flex-wrap gap-y-0.5">
                    <div className="text-slate-200 font-medium">
                      Guardians ({count})
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={close}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 flex-1">
                {/* Form */}
                <Form<GuardianStudentMapPost>
                  form={form}
                  layout="vertical"
                  className="flex-1 h-full!"
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex flex-col gap-y-5">
                      <Form.Item
                        name="guardianId"
                        label="Guardian"
                        rules={[
                          { required: true, message: "Guardian is required" },
                        ]}
                      >
                        <GuardianSearchSelect />
                      </Form.Item>

                      <Form.Item
                        name="studentIds"
                        label="Student(s)"
                        rules={[
                          { required: true, message: "Student(s) is required" },
                          {
                            type: "array",
                            min: 1,
                            message: "At least 1 student is required",
                          },
                        ]}
                      >
                        <StudentSearchSelect mode="multiple" />
                      </Form.Item>
                    </div>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" block>
                        Create Mapping
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default GuardianMap;
