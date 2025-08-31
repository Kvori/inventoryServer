import { Server } from 'socket.io'
import registerInventoryHandlers from './handlers/inventoryHandler.js'

export default function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    })

    io.on('connection', (socket) => {
        console.log('Socket.IO подключён:', socket.id)

        registerInventoryHandlers(socket, io)

        socket.on('disconnect', (reason) => {
            console.log(`Socket.IO отключён: ${socket.id}. Причина: ${reason}`)
        })
    })
}
