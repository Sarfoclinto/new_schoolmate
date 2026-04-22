import { useSignalRStore } from "@/store/signalr.store";

const useHasPermission = (permission?: string, def: boolean = true) => {
  const permissions = useSignalRStore((s) => s.permissions);
  if (!permissions || permissions.length === 0) return false;

  if (!permission) return def;

  const hasPermission = permissions.includes(permission);
  return hasPermission;
};
export default useHasPermission;
