import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  winnerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const GamePlayers = sequelize.define("player_game", {
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Game,
      key: "id",
    },
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Game.belongsToMany(User, { through: GamePlayers, as: "players" });
User.belongsToMany(Game, { through: GamePlayers, as: "games" });

Game.belongsTo(User, { foreignKey: "creator", as: "creatorPlayer" });
Game.belongsTo(User, { foreignKey: "winner", as: "winPlayer" });

export default Game;
export { GamePlayers };
