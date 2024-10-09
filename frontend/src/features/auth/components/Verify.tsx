import { CircularProgress } from "@mui/material";
import { useVerifyMutation } from "@src/store/auth-api";
import { useAppDispatch } from "@src/store/hooks";
import { openSnackBar } from "@src/store/notificationSlice";
import ApiError from "@src/types/common/api-error";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const email = searchParams.get("email");
  const id = searchParams.get("id");

  const [verify] = useVerifyMutation();
  useEffect(() => {
    async function fetchData() {
      if (email && id) {
        const { error } = await verify({ email, id });
        if (error) {
          const errorObject = error as ApiError;
          dispatch(
            openSnackBar({
              message: errorObject.data.errorCode
                ? t(`auth:errors.${errorObject.data.errorCode}`)
                : errorObject.data.error,
              severity: "error",
            })
          );
        } else {
          dispatch(
            openSnackBar({
              message: t("auth:verify.success"),
              severity: "success",
            })
          );
        }
        navigate("/login");
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, id]);

  if (!email || !id) {
    dispatch(
      openSnackBar({
        message: t("auth:verify.param_missing"),
        severity: "error",
      })
    );
    return <Navigate to={"/login"} />;
  }

  return <CircularProgress />;
};

export default Verify;
