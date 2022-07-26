const { Sequelize, DataTypes, Model } = require("sequelize");
const db = require("../config/db.config");
const Product_Subscription=require('./Product_Subscription');
const Product_Scope = require('./Product_Scope');
const Product_Type = require('./Product_Type');

const Product = db.define("product",{
    product_id: {
        type: DataTypes.UUID,
        autoIncrement: true,
        primaryKey: true,
      },

    product_code:DataTypes.STRING,
    product_name:DataTypes.STRING,
    product_type_id:DataTypes.INTEGER,
    apply_eol:DataTypes.STRING,
    apply_ius:DataTypes.STRING,
    creation_date: DataTypes.DATE,
    creation_user: DataTypes.STRING,
    modification_date: DataTypes.DATE,
    modification_user: DataTypes.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true,
    schema: 'comm_prod',
    tableName: 'product', 
  }
);

//-------------------------------------RELACION PRODUCTO / PRODUCT-SUBSCRIPTION----------------------------------------

//Un producto va a aparecer en muchos ProducSubscription
Product.hasMany(Product_Subscription,{foreignKey: 'product_id',sourceKey: 'product_id'});
//Un productSubscription va a contener un producto
Product_Subscription.belongsTo(Product, {foreignKey: 'product_id',targetKey: 'product_id'});


//-------------------------------------RELACION PRODUCTO / PRODUCT-SCOPE----------------------------------------

//Un producto va a aparecer en muchos Product_Scope
Product.hasMany(Product_Scope,{foreignKey: 'product_id',sourceKey: 'product_id'});
//Un Product_Scope va a contener un producto
Product_Scope.belongsTo(Product, {foreignKey: 'product_id',targetKey: 'product_id'});

//-------------------------------------RELACION PRODUCTO / PRODUCT-TYPE----------------------------------------

//Un producto va a tener un Product_Type
Product.belongsTo(Product_Type,{foreignKey: 'product_type_id',sourceKey: 'product_type_id'});

//Un Product_Type va a aparecer en muchos productos
Product_Type.hasMany(Product, {foreignKey: 'product_type_id',targetKey: 'product_type_id'});

module.exports = Product;
