const roomStates = new Map()

export default function registerInventoryHandlers(socket) {
    socket.on('joinInventory', (inventoryId) => {
        const room = `inventory_${inventoryId}`

        if (!roomStates.has(room)) {
            roomStates.set(room, {
                addItemLock: false,
                lockedBy: null
            })
        }


    })

    socket.on('blockAddItem', ({inventoryId}) => {
        const room = `inventory_${inventoryId}`
        const state = roomStates.get(room)
        
        if (!roomStates.has(room)) {
            socket.emit()
        }
    })
}