const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost',
  username: 'Bot', 
  auth: 'microsoft' 
  port: 25565,                
  version: false,             
  password: '12345678'        
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)
