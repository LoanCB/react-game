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
    type: DataTypes.ENUM(
      "pending",
      "playing",
      "finished",
      "paused",
      "endRound"
    ),
    allowNull: false,
    defaultValue: "pending",
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
  victoryType: {
    type: DataTypes.ENUM("score", "elimination"),
    allowNull: true,
    defaultValue: null,
  },
});

const GamePlayers = sequelize.define("game_players", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
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
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  passBet: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  eliminated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  resetRound: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Game.belongsToMany(User, { through: GamePlayers, as: "players" });
User.belongsToMany(Game, { through: GamePlayers, as: "games" });

// Creator
Game.belongsTo(User, { foreignKey: "creator", as: "creatorPlayer" });

// Winner
Game.belongsTo(User, { foreignKey: "winner", as: "winPlayer" });

export default Game;
export { GamePlayers };
