//ver: https://www.youtube.com/watch?v=nYAfe7er0zI&ab_channel=Inform%C3%A1ticaDP


const Server=require('./src/models/Server');
const server = new Server();

server.listen(8000, '0.0.0.0');

//Arrancar api: npm run serve
