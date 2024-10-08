import { Box } from "@mui/material";
import Logo from "@src/assets/love_letters_logo.jpeg";
import { Outlet } from "react-router-dom";
import Notification from "../common/notification";

const AuthLayout = () => {
  return (
    <Box display="flex" alignItems="center" flexDirection="column">
      <Box component="img" src={Logo} sx={{ width: "200px", height: "auto" }} />
      <Notification />
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
