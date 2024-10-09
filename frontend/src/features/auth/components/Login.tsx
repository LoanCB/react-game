import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useLoginMutation } from "@src/store/auth-api";
import { useAppDispatch } from "@src/store/hooks";
import { openSnackBar } from "@src/store/notificationSlice";
import { setUser } from "@src/store/userSlice";
import { LoginError } from "@src/types/auth/login";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import KTextField from "../../formik/components/KTextField";
import loginSchema, { LoginValues } from "../schemas/login";

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const initialValues: LoginValues = {
    email: "",
    password: "",
  };
  const [login, { isLoading }] = useLoginMutation();

  const handleFormSubmit = async (values: LoginValues) => {
    const { data, error } = await login(values);
    if (error) {
      const errorObject = error as LoginError;
      dispatch(
        openSnackBar({
          message: errorObject.data.errorCode
            ? t(`auth:errors.${errorObject.data.errorCode}`)
            : errorObject.data.error,
          severity: "error",
        })
      );
    } else if (data) {
      dispatch(setUser({ ...data.user, token: data.token }));
      navigate("/");
    }
  };

  const formik = useFormik<LoginValues>({
    initialValues,
    validationSchema: loginSchema,
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
          {t("auth:login.connect")}
        </Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            color="success"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress /> : t("auth:login.connect")}
          </Button>
          <Link to="/register">
            <Button fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }}>
              {t("auth:register.create_account")}
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
