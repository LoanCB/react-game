import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import PlayerGame from "./playerGame.js";

const User = sequelize.define("user", {
  id: {
    type: DataTypes.STRING,
    autoIncrement: false,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bestScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

User.belongsToMany(Game, {
  through: PlayerGame,
  foreignKey: "userId",
  otherKey: "gameId",
  as: "games",
});

export default User;
