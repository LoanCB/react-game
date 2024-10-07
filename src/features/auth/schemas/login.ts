import { object, string } from "yup";

const loginSchema = object({
  email: string()
    .email("Adresse mail invalide")
    .required("Adresse mail requise"),
  password: string().required(),
});

export interface loginValues {
  email: string;
  password: string;
}

export default loginSchema;
