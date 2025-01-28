import { Alert, CircularProgress, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useGamesListQuery } from "@src/store/game-api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import GameListColumns from "../utils/game-list-columns";

const ListGame = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, error, isLoading } = useGamesListQuery();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{t("game:list.error")}</Alert>;
  }

  const columns = GameListColumns(navigate);

  if (data) {
    return (
      <>
        <Typography>Liste des Parties public</Typography>
        <DataGrid rows={data} columns={columns} />
      </>
    );
  }

  return false;
};

export default ListGame;
