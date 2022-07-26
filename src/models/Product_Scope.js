const { Sequelize, DataTypes, Model } = require("sequelize");
const db = require("../config/db.config");
const Product=require('./Product');

const Product_Scope = db.define("product_scope",{
    product_scope_id:{
        type: DataTypes.UUID,
        autoIncrement: true,
        primaryKey: true,
      },
    product_id: DataTypes.UUID,
    product_max_access_count:DataTypes.INTEGER,
    product_max_user_count:DataTypes.INTEGER,
    scope_start_date:DataTypes.DATE,
    scope_finish_date:DataTypes.DATE,
    is_active:DataTypes.BOOLEAN,
    creation_date: DataTypes.DATE,
    creation_user: DataTypes.STRING,
    modification_date: DataTypes.DATE,
    modification_user: DataTypes.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true,
    schema: 'comm_prod',
    tableName: 'product_scope', 
  }
);



module.exports = Product_Scope;
