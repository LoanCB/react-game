import { Box, Button, Container, Typography } from "@mui/material";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
import KTextField from "../../formik/components/KTextField";
import loginSchema, { loginValues } from "../schemas/login";

const Login = () => {
  const initialValues = {
    email: "",
    password: "",
  };

  const formik = useFormik<loginValues>({
    initialValues,
    validationSchema: loginSchema,
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
          Se connecter
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
          >
            Se connecter
          </Button>
          <Link to="/register">
            <Button fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }}>
              Créer un compte
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
