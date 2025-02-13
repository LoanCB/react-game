import { Box, Button } from "@mui/material";
import Back1 from "@src/assets/discs/back_1.png";
import Back2 from "@src/assets/discs/back_2.png";
import Back3 from "@src/assets/discs/back_3.png";
import Back4 from "@src/assets/discs/back_4.png";
import Back5 from "@src/assets/discs/back_5.png";
import Back6 from "@src/assets/discs/back_6.png";
import Base1 from "@src/assets/discs/base_1.png";
import Base2 from "@src/assets/discs/base_2.png";
import Base3 from "@src/assets/discs/base_3.png";
import Base4 from "@src/assets/discs/base_4.png";
import Base5 from "@src/assets/discs/base_5.png";
import Base6 from "@src/assets/discs/base_6.png";
import Flower1 from "@src/assets/discs/flower_1.png";
import Flower2 from "@src/assets/discs/flower_2.png";
import Flower3 from "@src/assets/discs/flower_3.png";
import Flower4 from "@src/assets/discs/flower_4.png";
import Flower5 from "@src/assets/discs/flower_5.png";
import Flower6 from "@src/assets/discs/flower_6.png";
import Skull1 from "@src/assets/discs/skull_1.png";
import Skull2 from "@src/assets/discs/skull_2.png";
import Skull3 from "@src/assets/discs/skull_3.png";
import Skull4 from "@src/assets/discs/skull_4.png";
import Skull5 from "@src/assets/discs/skull_5.png";
import Skull6 from "@src/assets/discs/skull_6.png";
import Win1 from "@src/assets/discs/win_1.png";
import Win2 from "@src/assets/discs/win_2.png";
import Win3 from "@src/assets/discs/win_3.png";
import Win4 from "@src/assets/discs/win_4.png";
import Win5 from "@src/assets/discs/win_5.png";
import Win6 from "@src/assets/discs/win_6.png";
import { MouseEventHandler } from "react";

interface Props {
  position: number;
  type: "back" | "base" | "flower" | "skull" | "win";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const ImagePath = ({ position, type }: Props) => {
  switch (type) {
    case "back":
      switch (position) {
        case 1:
          return Back1;
        case 2:
          return Back2;
        case 3:
          return Back3;
        case 4:
          return Back4;
        case 5:
          return Back5;
        case 6:
          return Back6;
      }
      break;
    case "base":
      switch (position) {
        case 1:
          return Base1;
        case 2:
          return Base2;
        case 3:
          return Base3;
        case 4:
          return Base4;
        case 5:
          return Base5;
        case 6:
          return Base6;
      }
      break;
    case "flower":
      switch (position) {
        case 1:
          return Flower1;
        case 2:
          return Flower2;
        case 3:
          return Flower3;
        case 4:
          return Flower4;
        case 5:
          return Flower5;
        case 6:
          return Flower6;
      }
      break;
    case "skull":
      switch (position) {
        case 1:
          return Skull1;
        case 2:
          return Skull2;
        case 3:
          return Skull3;
        case 4:
          return Skull4;
        case 5:
          return Skull5;
        case 6:
          return Skull6;
      }
      break;
    case "win":
      switch (position) {
        case 1:
          return Win1;
        case 2:
          return Win2;
        case 3:
          return Win3;
        case 4:
          return Win4;
        case 5:
          return Win5;
        case 6:
          return Win6;
      }
  }
};

const DiscImage = ({ position, type, onClick, disabled }: Props) => {
  const disableButton = disabled || type === "base";

  const getSx = () => {
    switch (type) {
      case "base":
        return {
          height: "200px",
          width: "auto",
          zIndex: 1,
        };
      case "back":
        return {
          height: "190px",
          width: "auto",
          position: "absolute",
          top: 2,
          left: 3,
          zIndex: disableButton ? 2 : 3,
        };
      default:
        return {
          height: "190px",
          width: "auto",
          zIndex: disableButton ? 2 : 3,
        };
    }
  };

  return (
    <Button
      onClick={(event) => onClick && onClick(event)}
      disabled={disableButton}
      sx={{
        padding: 0,
        minWidth: 0,
        backgroundColor: "transparent",
        hover: {
          transform: "scale(1.25)",
        },
        ...getSx(),
      }}
    >
      <Box component="img" src={ImagePath({ position, type })} sx={getSx()} />
    </Button>
  );
};

export default DiscImage;
