const express = require("express");
const db = require("../config/db.config.js");
var cors = require("cors");
require('express-async-errors');


class Server {
    constructor() {
      
        this.app = express();
    
        if (process.env.STAGE == "PROD") {
            this.port = process.env.PORT || 3001;
        } else {
            this.port = 3001;
        }
    
        //Connect to database
        this.dbConnection();

        //middlewares
        this.middlewares();

        //App routes
        this.routes();
    }

    async dbConnection() {
        try {
          await db.authenticate();
          console.log("Database online");
        } catch (error) {
          throw new Error(error);
        }
    }

    
  middlewares() {
    // CORS
    this.app.use(cors());

    //Body lecture
    const router = require('express').Router();
    this.app.use("/", router);
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.end();
    });
  }

    routes() {
        this.app.use("/api", require("../routes/SuscripcionRoutes"));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Escuchando en puerto ${this.port}`);
        });
      }


}
module.exports = Server;