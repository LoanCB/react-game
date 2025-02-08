import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Logo from "@src/assets/logo.webp";
import { useCreateGameMutation } from "@src/store/game-api";
import { useAppDispatch } from "@src/store/hooks";
import useLocalStorage from "@src/store/local-storage";
import { openSnackBar } from "@src/store/notificationSlice";
import { removeUser, setUser } from "@src/store/userSlice";
import { User } from "@src/types/user/user";
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Symbol } from "../common/Symbol";
import Notification from "../common/notification";

const SecureLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const [user, setLocalUser] = useLocalStorage<User | null>("user");

  const [createGame] = useCreateGameMutation();
  const handleCreateGame = async () => {
    try {
      const { id } = await createGame(user!.id).unwrap();
      dispatch(
        openSnackBar({ message: t("game:create.success"), severity: "success" })
      );
      navigate(`/game/${id}`);
    } catch (error) {
      dispatch(
        openSnackBar({ message: t("game:create.error"), severity: "error" })
      );
      console.error(error);
      navigate("/");
    }
  };

  const handleLogout = () => {
    dispatch(removeUser());
    setLocalUser(null);
    navigate("/login");
  };
  const pages = [
    {
      text: t("common:secure_layout.create_game"),
      handleClick: () => handleCreateGame(),
    },
    {
      text: t("common:secure_layout.join_game"),
      handleClick: () => navigate("/game/list"),
    },
  ];
  const settings = [
    {
      text: t("common:secure_layout.logout"),
      handleClick: handleLogout,
    },
  ];

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    dispatch(setUser(user));
    return (
      <>
        <AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <Link to="/">
                <Box
                  component="img"
                  src={Logo}
                  sx={{ width: "100px", height: "auto" }}
                />
              </Link>

              <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <Symbol name="menu" />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{ display: { xs: "block", md: "none" } }}
                >
                  {pages.map((page, index) => (
                    <MenuItem
                      key={index + "page mobile"}
                      onClick={page.handleClick}
                    >
                      <Typography sx={{ textAlign: "center" }}>
                        {page.text}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                {pages.map((page, index) => (
                  <Button
                    key={index + "page desktop"}
                    onClick={page.handleClick}
                    sx={{ my: 2, color: "white", display: "block" }}
                  >
                    {page.text}
                  </Button>
                ))}
              </Box>
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar>
                      {user.firstName[0].toUpperCase() +
                        user.lastName[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting, index) => (
                    <MenuItem
                      key={index + "settings"}
                      onClick={setting.handleClick}
                    >
                      <Typography sx={{ textAlign: "center" }}>
                        {setting.text}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        <Notification />
        <Outlet />
      </>
    );
  }
};

export default SecureLayout;
