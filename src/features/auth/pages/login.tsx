import { Button, Card, Form, Input } from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import usePost from "@/hooks/api/use-post";
import { useAuth } from "@/store/auth.store";
import { toast } from "sonner";
import { LoginPayloadSchema } from "../../../schemas";
import { LockIcon, User2Icon } from "lucide-react";
import type { LoginPayload } from "@/types/api/setup/auth-n-user";
import { loginFn } from "@/services/auth";
import { useShallow } from "zustand/react/shallow";
import { getUserDashboardRoute } from "@/utils/auth";
import { useSignalRStore } from "@/store/signalr.store";

const LoginPage = () => {
  const [form] = Form.useForm<LoginPayload>();
  const { login, isAuth, user } = useAuth(
    useShallow((s) => ({
      login: s.login,
      isAuth: s.isAuth,
      user: s.user,
    })),
  );
  const setPermissionsAndSessions = useSignalRStore(
    useShallow((s) => s.setPermissionAndSessions),
  );
  const navigate = useNavigate();

  const { mutate, isPending } = usePost({
    postFn: loginFn,
    onSuccess: (res) => {
      if (res.responseCode === 1 && res.isAuth) {
        const permissionsAndSesssions = res.other;
        if (permissionsAndSesssions) {
          setPermissionsAndSessions(permissionsAndSesssions);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { other: __, ...rest } = res;
        login(rest);
        navigate(getUserDashboardRoute(), { replace: true });
      } else {
        toast.error(res.responseMessage);
      }
    },
    onError: (err) => {
      if (err.code === "ERR_NETWORK") {
        toast.error("Network error", {
          description: "Check connection and try again",
        });
      } else {
        toast.error(err.message);
      }
    },
  });

  if (isAuth && user) {
    const route = getUserDashboardRoute();
    return <Navigate to={route} replace />;
  }

  const onFinish = (values: LoginPayload) => {
    const data = LoginPayloadSchema.safeParse(values);
    if (data.success) {
      mutate(data.data);
    } else {
      const error = data.error;
      error.issues.forEach((issue) => toast.error(issue.message));
    }
  };

  return (
    <div
      className={`relative flex justify-center items-center min-h-screen bg-center bg-cover p-4`}
      style={{
        backgroundImage: `url(/lib.jpg)`,
      }}
    >
      <div className="absolute z-10 top-0 bottom-0 left-0 right-0 bg-black/50" />
      {/* Left Side: Text Section */}
      <div className="hidden lg:flex flex-col z-20 items-start max-w-md text-white!">
        <h1 className="text-3xl font-bold text-center">SCHOOL MATE</h1>
        <p className="mt-4 text">
          Welcome to the SCHOOL MATE Portal! Your gateway to all essential
          academic resources, schedules, and updates. Stay connected, manage
          your courses, and enhance your learning experience with ease.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg p-6 rounded-xl bg-black/70! z-20 text-white! backdrop-blur-md">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Login - Portal
        </h2>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            label={<span className="text-white">User ID</span>}
            name="UserId"
            rules={[
              { required: true, message: "Please enter your Phone number" },
            ]}
          >
            <Input
              prefix={<User2Icon className="size-4" />}
              placeholder="eg. ST-0009"
            />
          </Form.Item>
          <Form.Item
            label={<span className="text-white">Password</span>}
            name="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockIcon className="size-4" />}
              placeholder="Enter your password"
            />
          </Form.Item>
          <Button
            type="primary"
            disabled={isPending}
            loading={isPending}
            className="w-full"
            htmlType="submit"
          >
            Sign In
          </Button>
        </Form>
      </Card>
    </div>
  );
};
export default LoginPage;
