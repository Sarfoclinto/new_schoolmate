import { useAuth } from "@/store/auth.store";
import { useSignalRStore } from "@/store/signalr.store";
import { useUIStore } from "@/store/ui.store";
import { Modal } from "antd";
import { useShallow } from "zustand/react/shallow";

const LogOutModal = () => {
  const logout = useAuth((s) => s.logout);
  const resetStore = useSignalRStore((s) => s.resetStore);
  const { isOpen, close } = useUIStore(
    useShallow((s) => ({
      close: s.closeLogoutMenu,
      isOpen: s.logOutModal,
    })),
  );

  const onLogOut = () => {
    logout();
    resetStore();
    close();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={close}
      title={<span className="text-destructive">Logging Out?</span>}
      okText="Yes"
      okButtonProps={{ danger: true }}
      cancelText="No"
      onOk={onLogOut}
      styles={{
        body: { padding: 6 },
        container: { padding: 0 },
      }}
      closable={false}
    >
      <h5 className="mt-3 ml-2 font-mono">
        Are you sure you want to log out of your account?
      </h5>
    </Modal>
  );
};
export default LogOutModal;
