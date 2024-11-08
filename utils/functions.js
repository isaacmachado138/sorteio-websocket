const { ACTIONS, STATUS } = require('../js/config');


/**
 * Atualiza a contagem de clientes não administradores e envia essa contagem para todos os clientes conectados.
 *
 * @param {WebSocket.Server} wss - O servidor WebSocket que contém os clientes conectados.
 */
function updateAdminClientCount(wss) {
  const clientCount = Array.from(wss.clients).filter((client) => !client.isAdmin).length;

  sendClientCount(wss, clientCount);
}


//Função para tratar as mensagens recebidas pelo WebSocket
/**
 * Manipula a mensagem recebida pelo WebSocket.
 *
 * @param {WebSocket} ws - A conexão WebSocket.
 * @param {string} message - A mensagem recebida em formato JSON.
 */
function handleIncomingMessage(ws, message) {
  const parsedMessage = JSON.parse(message);

  const action = parsedMessage.action;

  switch(action) {
    case ACTIONS.ADMIN:
      ws.isAdmin = true;
      break;
    case ACTIONS.DRAW:  
      handleDraw(wss, parsedMessage.code);
      break;
    default:
      console.warn(`Unknown action: ${action}`);
      break;
  }

}

//Realiza o sorteio e envia para todos os participantes o resultado
/**
 * Função para realizar o sorteio entre os participantes conectados via WebSocket.
 *
 * @param {WebSocket.Server} wss - O servidor WebSocket.
 * @param {string} code - O código a ser enviado ao vencedor.
 */
function handleDraw(wss, code) {
  //handleDraw code
  let participants = Array.from(wss.clients).filter((client) => !client.isAdmin);
  const winner = participants[Math.floor(Math.random() * participants.length)];

  participants.forEach((client) => {
      let result = JSON.stringify({status: STATUS.LOSE});

      if(client === winner) {
        result = JSON.stringify({status: STATUS.WIN, code: code});
      } 

      client.send(result);
    
  });
}

/**
 * Envia a contagem de clientes conectados para todos os clientes administradores.
 *
 * @param {WebSocket.Server} wss - O servidor WebSocket.
 * @param {number} clientCount - A contagem atual de clientes conectados.
 */
function sendClientCount(wss, clientCount) {
  Array.from(wss.clients).forEach((client) => {
    if (client.isAdmin && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
          action: ACTIONS.CLIENT_COUNT_UPDATE,
          clientCount: clientCount 
      }));
    }
  });
}

module.exports = { updateAdminClientCount, handleIncomingMessage };
