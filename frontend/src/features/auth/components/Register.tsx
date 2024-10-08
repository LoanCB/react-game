import { Box, Button, Container, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import KTextField from "../../formik/components/KTextField";
import registerSchema, { RegisterValues } from "../schemas/register";

const Register = () => {
  const { t } = useTranslation();

  const initialValues: RegisterValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const formik = useFormik<RegisterValues>({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: (values) => console.log(JSON.stringify(values)),
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
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
          <KTextField
            formik={formik}
            name="firstName"
            label="Prénom"
            props={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
            }}
          />
          <KTextField
            formik={formik}
            name="lastName"
            label="Nom"
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
            <Button fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }}>
              {t("auth:login.connect")}
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
