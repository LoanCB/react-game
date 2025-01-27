import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";

const PlayerGame = sequelize.define("player_game", {
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default PlayerGame;
