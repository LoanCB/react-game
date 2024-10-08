import { Alert, Snackbar } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { closeSnackBar } from "@src/store/notificationSlice";
import { RootState } from "@src/store/store";
import { SyntheticEvent } from "react";

const Notification = () => {
  const dispatch = useAppDispatch();

  const notificationState = useAppSelector(
    (state: RootState) => state.notification
  );
  const { isActiveSnackBar, message, severity } = notificationState;

  const handleClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(closeSnackBar());
  };

  if (!notificationState) {
    return null;
  }

  return (
    <>
      <Snackbar
        open={isActiveSnackBar}
        onClose={handleClose}
        TransitionProps={{ enter: true, exit: true }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Alert severity={severity} onClose={handleClose} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Notification;
