import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import PlayerGame from "./playerGame.js";
import User from "./users.js";

const Game = sequelize.define("game", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  winnerScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  state: {
    type: DataTypes.ENUM("pending", "playing", "finished"),
    allowNull: false,
    defaultValue: "pending",
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  winnerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

Game.belongsTo(User, { foreignKey: "creatorId", as: "creatorPlayer" });
Game.belongsTo(User, { foreignKey: "winnerId", as: "winPlayer" });
Game.belongsToMany(User, {
  through: PlayerGame,
  foreignKey: "gameId",
  otherKey: "userId",
  as: "players",
});

export default Game;
