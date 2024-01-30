const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { env } = require('process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
const groups = {
    'Luisao': {
            'administrativos': ['channel1', 'channel2'],
            // 'project2': ['channel3', 'channel4']
        }
   
};

wss.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('message', (message) => {
     try {
        const data = JSON.parse(message);
        const group = data.group;
        const project = data.project;
         const client = data.client;
         if (!data.type || !data.group || !data.project || !data.client) {
            throw new Error('Datos incompletos en el mensaje recibido.');
        }
         if (data.type === 'join') {
            socket.channelName = data.client;
            groups[group][project].push(socket);
            

        } else if (data.type === 'message') {
            
            if (!data.message) {
                throw new Error('Datos incompletos en el mensaje recibido.');
            }
            socket.send(JSON.stringify({ type: 'confirmation', status: 'message_received' }));
            groups[group][project].forEach((client) => {
                if (client.channelName && client.channelName === data.client && client !== socket) {
                        console.log("mensaje", data.message);
                        client.send(`${data.message}`);
                    
                }
            });

            
            
        }
     } catch (error) {
        console.error('Error al procesar el mensaje:', error.message);

     }
    });
    
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Servidor WebSocket está escuchando en ws://localhost:${port}`);
});