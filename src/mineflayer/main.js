const mineflayer = require('mineflayer')
const inventoryViewer = require('mineflayer-web-inventory')

const bot = mineflayer.createBot({
  host: 'localhost',
  username: 'Bot', 
  //auth: 'microsoft',
  port: 62290,
  version: false,             
  //password: '12345678',
})

inventoryViewer(bot)

bot.on('spawn', () => {
  bot.inventory.start()
});


function deliver(items, customer) {
  // This will be the function that gets called when an order is approved.
}