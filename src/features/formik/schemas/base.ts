import { string } from "yup";

export const stringRequired = (fieldName?: string) =>
  string().required(`Champs ${fieldName ?? ""} requis`);
