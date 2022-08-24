const { Sequelize, DataTypes, Model } = require("sequelize");
const db = require("../config/db.config");
const Product = require('./Product');
const Subscriber = require('./Subscriber');

const Product_Subscription = db.define("product_subscription",{
    product_subscription_id: {
        type: DataTypes.UUID,
        autoIncrement: true,
        primaryKey: true,
      },
    subscriber_id:DataTypes.UUID,
    product_id:DataTypes.UUID,      
    subscription_start_date:DataTypes.DATE,
    subscription_finish_date:DataTypes.DATE,
    is_active:DataTypes.BOOLEAN,
    erp_thematic:DataTypes.STRING,
    account_executive_ref_id:DataTypes.UUID,
    creation_date: DataTypes.DATE,
    creation_user: DataTypes.STRING,
    modification_date: DataTypes.DATE,
    modification_user: DataTypes.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true,
    schema: 'comm_prod',
    tableName: 'product_subscription', 
  }
);
  
//Un Subscriber va a aparecer en muchos ProducSubscription
Subscriber.hasMany(Product_Subscription,{foreignKey: 'subscriber_id',sourceKey: 'subscriber_id'});
//Un productSubscription va a contener un Subscriber
Product_Subscription.belongsTo(Subscriber, {foreignKey: 'subscriber_id',targetKey: 'subscriber_id'});



module.exports = Product_Subscription;
