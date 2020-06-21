const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

io.on('connection', socket => {
    if (!users[socket.id]) {
        users[socket.id] = socket.id;
    }
    socket.emit("yourID", socket.id);
    console.log("RegID", socket.id)
    io.sockets.emit("allUsers", users);
    socket.on('disconnect', () => {
        console.log("disconnect", users[socket.id])
        delete users[socket.id];
    })

    socket.on("callUser", (data) => {
        console.log("callUser")
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
    })

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
        console.log("acceptCall")
    })
});

server.listen(8080, () => console.log('server is running on port 8080'));


