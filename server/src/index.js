const config = require('./config');
const express = require('express');
const ws = require('ws');

const app = express();
const wss = new ws.Server({ noServer: true });

app.get('/status', (req, res) => {
    res.send('OK');
});

wss.on('connection', socket => {
    socket.on('message', message => {
        console.log(`Received from browser: ${message}`);
        socket.send('ACK');
    });
});

const httpServer = app.listen(config.port);
httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(
        request,
        socket,
        head,
        (socket) => wss.emit('connection', socket, request)); 
});
