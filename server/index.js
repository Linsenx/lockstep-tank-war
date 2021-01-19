const WebSocket = require('ws');

let frames = [];
let frameId = 0;
const FRAME_RATE = 20;

const wss = new WebSocket.Server({ port: 8888 });

wss.on('connection', (ws) => {
  // 新玩家加入，将历史数据发送给他
  ws.send(JSON.stringify(frames));

  ws.on('message', (message) => {
    if (!frames[frameId]) {
      frames[frameId] = [frameId, []];
    }
     frames[frameId][1].push(message);
  });
});

function mainLoop() {
  if (wss.clients.length === 0) {
    return;
  }

  if (!frames[frameId]) {
    frames[frameId] = [frameId, []];
  }

  const frameStr = JSON.stringify(frames[frameId]);
  wss.clients.forEach((c) => c.send(frameStr));
  frameId ++;
}
setInterval(mainLoop, 1000 / FRAME_RATE);
