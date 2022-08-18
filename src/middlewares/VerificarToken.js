var jwt = require('jsonwebtoken');
const { connectLogger } = require('log4js');
//Authorization: Barer <token>
const VerificarToken =(req, res, next) => {
    
    try {
        const bearerHeader = req.headers['authorization'];
        let bearerToken = '';
        if(typeof bearerHeader !== 'undefined') {
          bearerToken = bearerHeader;
          console.log(process.env.PUBLIC_KEY)
          jwt.verify(bearerToken, process.env.PUBLIC_KEY, (error, authData) => {
            //req.token.expiresIn= '365d';
    
            if(error){
              console.log(error.message);
              res.sendStatus(403);
            }else{
              next();
            }
          })
        }
        else res.sendStatus(403);
      } catch (error) {
        return res.status(403).json({message: "Ocurrio un error al autenticar el token. Verifique su token por favor.", error: error})
      }
      
  }
  
  module.exports = VerificarToken;
