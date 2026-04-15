import { useMemo } from "react";
import useFetch from "../api/use-fetch";
import { getDetailsFn, verifyPhoneFn } from "@/services/finance";

type VerifyProps = {
  phone: string;
  network: string;
};

const useVerifyPhone = ({ network, phone }: VerifyProps) => {
  const {
    isSuccess: vPSucsess,
    data: vData,
    isLoading: vLoading,
    isError: vIsError,
    error: vError,
  } = useFetch({
    queryKeys: ["verify", network, phone],
    queryFn: () => verifyPhoneFn({ network, msisdn: phone }),
    enabled: phone.length >= 12,
    queryOptions: { retry: false },
  });

  const {
    data: dData,
    isLoading: dLoading,
    isError: dIsError,
    error: dError,
  } = useFetch({
    queryKeys: ["details", network, phone, vPSucsess],
    queryFn: () => getDetailsFn({ network, msisdn: phone }),
    enabled: vPSucsess && vData?.responseCode === "01",
    queryOptions: { retry: false },
  });

  // final values
  const valid = vData?.responseCode === "01";

  const name = useMemo(() => {
    return valid && dData ? dData.name : null;
  }, [dData, valid]);

  const isLoading = vLoading || (valid && dLoading);
  const isError = vIsError || dIsError;
  const error = vError || dError;

  return { valid, name, isLoading, isError, error };
};
export default useVerifyPhone;
