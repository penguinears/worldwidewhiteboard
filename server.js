const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  fs.readFile("index.html", (err, data) => {
    res.writeHead(200);
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

const rooms = {};

function broadcast(room, msg) {
  rooms[room].forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  });
}

wss.on("connection", ws => {
  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    const room = msg.room || "main";

    if (!rooms[room]) rooms[room] = [];

    if (!rooms[room].includes(ws)) {
      ws.room = room;
      rooms[room].push(ws);
    }

    broadcast(room, msg);
  });

  ws.on("close", () => {
    if (ws.room) {
      rooms[ws.room] = rooms[ws.room].filter(u => u !== ws);
    }
  });
});

server.listen(3000, () =>
  console.log("Running on http://localhost:3000")
);
