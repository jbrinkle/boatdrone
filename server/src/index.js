const config = require('./config');
const express = require('express');
const ws = require('ws');

const app = express();
const wss = new ws.Server({ noServer: true });

app.get('/status', (req, res) => {
    res.send('OK');
});

let periodicHello = null;
wss.on('connection', socket => {
    periodicHello = setInterval(() => {
        socket.send('Hi!');
    }, 2500);
    socket.on('close', (code, reason) => {
        console.log(`    ${code} - ${reason}`);
    });
    socket.on('message', message => {
        console.log(`Received from browser: ${message}`);
        if (message === 'STOP') {
            clearInterval(periodicHello);
            socket.send('K. I\'ll stop saying hi')
        }
        else socket.send('ACK');
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
