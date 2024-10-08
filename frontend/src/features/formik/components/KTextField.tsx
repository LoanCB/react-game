import { TextField, TextFieldProps, TextFieldVariants } from "@mui/material";
import { FormikProps } from "formik";

interface KTextFieldProps<Values> {
  formik: FormikProps<Values>;
  name: keyof Values;
  label: string;
  props?: {
    variant?: TextFieldVariants;
  } & Omit<TextFieldProps, "variant">;
}

const KTextField = <Values,>({
  formik,
  name,
  label,
  props,
}: KTextFieldProps<Values>) => {
  return (
    <TextField
      id={name.toString()}
      label={label}
      name={name as string}
      autoComplete={name.toString()}
      value={formik.values[name]}
      onChange={formik.handleChange}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]?.toString()}
      {...props}
      variant={props?.variant || "standard"}
    />
  );
};

export default KTextField;
