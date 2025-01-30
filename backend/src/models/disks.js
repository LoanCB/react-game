import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import Game from "./games.js";
import User from "./users.js";

const Disc = sequelize.define("disc", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  type: {
    type: DataTypes.ENUM("flower", "skull"),
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isRevealed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Disc.belongsTo(User);
Disc.belongsTo(Game);

export default Disc;
