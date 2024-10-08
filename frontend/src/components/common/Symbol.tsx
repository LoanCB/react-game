import { styled } from "@mui/material";
import { MaterialSymbol } from "material-symbols";

const Symbol = styled(
  ({ name, className }: { name: MaterialSymbol; className?: string }) => (
    <span className={"material-symbols-rounded " + className}>{name}</span>
  )
)`
  width: 24px;
  color: currentColor;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48;
`;

export { Symbol };
