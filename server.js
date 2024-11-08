const express   = require('express');
const http      = require('http');
const WebSocket = require('ws');

const app     = express();

const { updateAdminClientCount } = require('./utils/functions');

// criando servidor http
const server  = http.createServer(app);

// criando servidor websocket
const wss     = new WebSocket.Server({ server });

const APP_PORT = process.env.PORT || 3000;
const APP_URL  = process.env.URL  || `http://localhost:${APP_PORT}`;

// rotas
app.use("/public", express.static(__dirname + '/public'));
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
app.get("/admin", (req, res) => res.sendFile(__dirname + "/public/admin.html"));

//iniciando servidor
server.listen(APP_PORT, () =>
  console.log(`Servidor ouvindo a porta ${APP_PORT}!`)
);

// lista de clientes conectados
let clients = [];

//ações do websocket
wss.on('connection', ws => {
  clients.push(ws);
  updateAdminClientCount(wss);

  // filtra retirando o websocket do clients
  ws.on("close", () => {
    clients = clients.filter(client => client !== ws);
    updateAdminClientCount(wss);
  });

  ws.on("message", handleIncomingMessage.bind(null, ws));
})

