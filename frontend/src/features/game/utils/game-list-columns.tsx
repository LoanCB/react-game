import { Button } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { GameState } from "@src/types/game/game";
import { t } from "i18next";
import { NavigateFunction } from "react-router-dom";

const GameListColumns = (navigate: NavigateFunction): GridColDef[] => [
  {
    field: "private",
    flex: 1,
    valueGetter: (value: boolean) =>
      t(`game:list.${value ? "private" : "public"}`),
  },
  {
    field: "state",
    flex: 1,
    valueGetter: (value: GameState) => t(`game:list.state.${value}`),
  },
  {
    field: "actions",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <Button onClick={() => navigate(`/game/${params.row.id}`)}>
        {t("game:list.join")}
      </Button>
    ),
  },
];

export default GameListColumns;
