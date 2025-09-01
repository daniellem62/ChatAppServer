const https = require("https");
const socketIo = require("socket.io");
const fs = require("fs");

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/chathive.me/privkey.pem"), // Path to the private key
  cert: fs.readFileSync("/etc/letsencrypt/live/chathive.me/fullchain.pem"), // Path to the certificate
  minVersion: "TLSv1.2",
};

// Pass the options to createServer
const server = https.createServer(options);

const io = socketIo(server, {
  cors: {
    origin: ["https://www.chathive.me:3000/", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-customer-header"],
    credentials: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("set username", (username) => {
    users[socket.id] = username;
    console.log(`${username} connected`);
    io.emit("user list", Object.values(users));
    io.emit("user joined", username);
  });

  socket.on("chat message", (msg) => {
    console.log("Message received from client:", msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    console.log(`${username} disconnected`);
    delete users[socket.id];

    io.emit("user list", Object.values(users));
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});
