const { Sequelize, DataTypes, Model } = require("sequelize");
const db = require("../config/db.config");
const Product=require('./Product');

const Product_Type = db.define("product_type",{
    product_type_id:{
        type: DataTypes.UUID,
        autoIncrement: true,
        primaryKey: true,
      },
    product_type_code: DataTypes.STRING,
    product_type_name:DataTypes.STRING,
    creation_date: DataTypes.DATE,
    creation_user: DataTypes.STRING,
    modification_date: DataTypes.DATE,
    modification_user: DataTypes.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true,
    schema: 'comm_prod',
    tableName: 'product_type', 
  }
);



module.exports = Product_Type;
