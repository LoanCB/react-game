import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import User from "./users.js";

const Game = sequelize.define("game", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  state: {
    type: DataTypes.ENUM("pending", "playing", "finished", "paused"),
    allowNull: false,
    defaultValue: "pending",
  },
  creatorId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currentPlayerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currentBet: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
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

const PlayerGame = sequelize.define("player_game", {
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

Game.belongsToMany(User, { through: PlayerGame, as: "players" });
User.belongsToMany(Game, { through: PlayerGame, as: "games" });

Game.belongsTo(User, { foreignKey: "creator", as: "creatorPlayer" });
Game.belongsTo(User, { foreignKey: "winner", as: "winPlayer" });

export default Game;
export { PlayerGame };
