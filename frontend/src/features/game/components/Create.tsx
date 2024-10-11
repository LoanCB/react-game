import { CircularProgress } from "@mui/material";
import { useCreateGameMutation } from "@src/store/game-api";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { openSnackBar } from "@src/store/notificationSlice";
import { RootState } from "@src/store/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CreateGame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const user = useAppSelector((state: RootState) => state.user);
  const [createGame] = useCreateGameMutation();

  const handleCreateGame = async () => {
    const { data, error } = await createGame(user!.id);
    if (data) {
      dispatch(
        openSnackBar({ message: t("game:create.success"), severity: "success" })
      );
      navigate(`game/${data.gameId}`);
    }
    if (error) {
      dispatch(
        openSnackBar({ message: t("game:create.error"), severity: "error" })
      );
      console.error(error);
      navigate("/");
    }
  };

  useEffect(() => {
    handleCreateGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CircularProgress />;
};

export default CreateGame;
