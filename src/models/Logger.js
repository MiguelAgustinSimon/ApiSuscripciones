const { getLogger, configure } =require("log4js");

configure({
    appenders:{
        app:{type:'file',filename:'./src/logs/app.log'},
        out:{type:'stdout'}
    },
    categories:{
        default:{
            appenders:["app","out"],
            level:"info"
        }
    }
});

const logger=getLogger();

module.exports = {
    //Aca exporto 
    logger
}
