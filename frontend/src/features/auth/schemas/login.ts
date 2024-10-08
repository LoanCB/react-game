import { stringRequired } from "@src/features/formik/schemas/base";
import { object, string } from "yup";

const loginSchema = object({
  email: string()
    .email("Adresse mail invalide")
    .required("Adresse mail requise"),
  password: stringRequired(),
});

export interface LoginValues {
  email: string;
  password: string;
}

export default loginSchema;
