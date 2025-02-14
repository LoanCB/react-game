import { Button } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { GameState } from "@src/types/game/game";
import { t } from "i18next";
import { NavigateFunction } from "react-router-dom";

interface CurrentPlayer {
  id: string;
  username: string;
  game_players: { isActive: boolean };
}

const GameListColumns = (navigate: NavigateFunction): GridColDef[] => [
  {
    field: "players",
    flex: 1,
    valueGetter: (_value, row) =>
      row.players.reduce(
        (acc: number, cur: CurrentPlayer) =>
          cur.game_players.isActive ? acc + 1 : acc,
        0
      ),
  },
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
      <Button onClick={() => navigate(`/game/${params.row.id}/`)}>
        {t(`game:list.${params.row.state === "pending" ? "join" : "resume"}`)}
      </Button>
    ),
  },
];

export default GameListColumns;
