import { Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

const SecureLayout = () => {
  return (
    <>
      <Typography>Secured layout</Typography>
      <Outlet />
    </>
  );
};
export default SecureLayout;
