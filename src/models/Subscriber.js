const { Sequelize, DataTypes, Model } = require("sequelize");
const db = require("../config/db.config");

//const sequelize = new Sequelize("sqlite::memory:");
const Subscriber = db.define(
  "subscriber",
  {
    subscriber_id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    organization_id: DataTypes.UUID,
    subscriber_name: DataTypes.STRING,
    subscriber_ref_id: DataTypes.STRING,
    subscriber_max_user_count: DataTypes.INTEGER,
    //subscriber_status_id: DataTypes.INTEGER,
    creation_date: DataTypes.DATE,
    creation_user: DataTypes.STRING,
    modification_date: DataTypes.DATE,
    modification_user: DataTypes.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true,
    schema: 'app_entity',
    tableName: 'subscriber', 
  }
);

module.exports = Subscriber;