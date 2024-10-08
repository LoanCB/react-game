import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useRegisterMutation } from "@src/store/auth-api";
import { useAppDispatch } from "@src/store/hooks";
import { openSnackBar } from "@src/store/notificationSlice";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import KTextField from "../../formik/components/KTextField";
import registerSchema, { RegisterValues } from "../schemas/register";

const Register = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const handleFormSubmit = async (values: RegisterValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = values;
    try {
      await register(rest);
      dispatch(
        openSnackBar({
          message: t("auth:register.success"),
          severity: "success",
        })
      );
      navigate("/login");
    } catch {
      dispatch(
        openSnackBar({ message: t("auth:register.error"), severity: "error" })
      );
    }
  };

  const initialValues: RegisterValues = {
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const formik = useFormik<RegisterValues>({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: handleFormSubmit,
  });

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          {t("auth:register.register")}
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          <KTextField
            formik={formik}
            name="firstname"
            label="Prénom"
            props={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
            }}
          />
          <KTextField
            formik={formik}
            name="lastname"
            label="Nom"
            props={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
            }}
          />
          <KTextField
            formik={formik}
            name="username"
            label="Surnom"
            props={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
            }}
          />
          <KTextField
            formik={formik}
            name="email"
            label="Adresse mail"
            props={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              type: "email",
            }}
          />
          <KTextField
            formik={formik}
            name="password"
            label="Mot de passe"
            props={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              type: "password",
            }}
          />
          <KTextField
            formik={formik}
            name="confirmPassword"
            label="Confirmation de mot de passe"
            props={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              type: "password",
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            color="success"
          >
            {t("auth:register.create_account")}
          </Button>
          <Link to="/login">
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress /> : t("auth:login.connect")}
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
