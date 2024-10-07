import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Logo from "../../assets/love_letters_logo.jpeg";

const AuthLayout = () => {
  return (
    <Box display="flex" alignItems="center" flexDirection="column">
      <Box component="img" src={Logo} sx={{ width: "200px", height: "auto" }} />
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
