const mineflayer = require('mineflayer')
const { pathfinder, goals } = require('mineflayer-pathfinder')
const fs = require('fs')
const inventoryViewer = require('mineflayer-web-inventory')

class DeliveryBot {
    constructor() {
        this.bot = null
        this.orderDetails = null
        this.itemsData = null
        this.customerIGN = null
    }

    initializeBot() {
        this.bot = mineflayer.createBot({
            host: '2b2t.org',
            username: process.env.MINECRAFT_EMAIL,
            password: process.env.MINECRAFT_PASSWORD,
            version: '1.12.2',
            auth: 'microsoft',
            queue: true,
            hideErrors: false
        })

        this.bot.loadPlugin(pathfinder)
        inventoryViewer(this.bot)

        this.setupBotEvents()
    }

    setupBotEvents() {
        this.bot.on('login', () => {
            console.log('Bot logged in successfully')
        })

        this.bot.on('spawn', () => {
            console.log('Bot spawned')
            this.handleQueueAndSpawn()
        })

        this.bot.on('error', (err) => {
            console.error('Bot error:', err)
        })
    }

    handleQueueAndSpawn() {
        setTimeout(() => {
            this.processNewOrder()
        }, 120000) // Espera 2 minutos para asegurar salida de la cola
    }

    async processNewOrder() {
        try {
            // Cargar datos de ítems
            this.loadItemsData()

            // Cargar detalles de la orden
            this.loadOrderDetails()

            // Navegar a los cofres para recoger ítems
            await this.collectItemsFromChests()

            // Almacenar ítems en Ender Chest
            await this.storeItemsInEnderChest()

            // Moverse al bloque de lava para morir
            await this.moveToLavaAndDie()

            // Esperar en el spawn al cliente
            await this.waitForCustomerAtSpawn()
        } catch (error) {
            console.error('Error during delivery process:', error)
            this.handleDeliveryFailure()
        }
    }

    loadItemsData() {
        const itemsFile = './src/catalog/items.json'
        this.itemsData = JSON.parse(fs.readFileSync(itemsFile, 'utf8'))
    }

    loadOrderDetails() {
        const orderFile = `./src/orders/${this.customerIGN}.json`
        if (fs.existsSync(orderFile)) {
            this.orderDetails = JSON.parse(fs.readFileSync(orderFile, 'utf8'))
        } else {
            throw new Error('Order file not found')
        }
    }

    async collectItemsFromChests() {
        for (const itemId of this.orderDetails.items) {
            const itemInfo = this.itemsData[itemId]
            if (itemInfo && itemInfo.chest_coordinates) {
                // Navegar al cofre
                await this.navigateToCoordinates(itemInfo.chest_coordinates)

                // Abrir cofre y recoger ítems
                const chest = await this.findNearestChest()
                if (chest) {
                    await this.bot.openChest(chest)
                    const itemStack = chest.containerItems().find(item => item.name === itemId)
                    
                    if (itemStack) {
                        await this.bot.withdraw(itemStack.type, null, itemStack.count)
                        console.log(`Collected ${itemStack.count} ${itemStack.name}`)
                    }
                    
                    this.bot.closeChest()
                }
            }
        }
    }

    async storeItemsInEnderChest() {
        // Buscar y abrir Ender Chest más cercano
        const enderChest = this.findNearestEnderChest()
        if (enderChest) {
            await this.bot.openChest(enderChest)

            // Almacenar todos los ítems del inventario en el Ender Chest
            const inventoryItems = this.bot.inventory.items()
            for (const item of inventoryItems) {
                await this.bot.transfer(item, enderChest)
            }

            this.bot.closeChest()
        }
    }

    async moveToLavaAndDie() {
        // Coordenadas de bloque de lava (ajustar según tu servidor)
        const lavaCoords = { x: 0, y: 64, z: 0 }
        await this.navigateToCoordinates(lavaCoords)

        // Esperar a estar en lava para morir
        this.bot.on('health', () => {
            if (this.bot.health <= 0) {
                console.log('Bot has died')
            }
        })
    }

    async waitForCustomerAtSpawn() {
        // Coordenadas de spawn (ajustar según tu servidor)
        const spawnCoords = { x: 0, y: 64, z: 0 }
        await this.navigateToCoordinates(spawnCoords)

        // Esperar al cliente
        this.bot.on('playerJoined', async (player) => {
            if (player.username === this.customerIGN) {
                await this.deliverItemsToCustomer()
            }
        })
    }

    async deliverItemsToCustomer() {
        // Buscar Ender Chest más cercano
        const enderChest = this.findNearestEnderChest()
        if (enderChest) {
            await this.bot.openChest(enderChest)

            // Transferir todos los ítems al cliente
            const chestItems = enderChest.containerItems()
            for (const item of chestItems) {
                await this.bot.toss(item.type, null, item.count)
            }

            this.bot.closeChest()
        }

        // Marcar orden como completada
        this.completeDelivery()
    }

    async navigateToCoordinates(coords) {
        const goal = new goals.GoalBlock(coords.x, coords.y, coords.z)
        await this.bot.pathfinder.goto(goal)
    }

    findNearestChest() {
        const chests = this.bot.findBlocks({
            matching: ['chest', 'trapped_chest'],
            maxDistance: 10
        })
        return chests.length > 0 ? chests[0] : null
    }

    findNearestEnderChest() {
        const enderChests = this.bot.findBlocks({
            matching: 'ender_chest',
            maxDistance: 10
        })
        return enderChests.length > 0 ? enderChests[0] : null
    }

    completeDelivery() {
        this.orderDetails.status = 'completed'
        const orderFile = `./src/orders/${this.customerIGN}.json`
        fs.writeFileSync(orderFile, JSON.stringify(this.orderDetails, null, 2))
        console.log('Delivery completed successfully')
        this.disconnectBot()
    }

    handleDeliveryFailure() {
        this.orderDetails.status = 'failed'
        const orderFile = `./src/orders/${this.customerIGN}.json`
        fs.writeFileSync(orderFile, JSON.stringify(this.orderDetails, null, 2))
        console.error('Delivery failed')
        this.disconnectBot()
    }

    disconnectBot() {
        if (this.bot) {
            this.bot.quit()
        }
    }

    startDelivery(customerIGN) {
        this.customerIGN = customerIGN
        this.initializeBot() }
}

module.exports = DeliveryBot
