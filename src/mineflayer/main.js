const mineflayer = require('mineflayer')
const inventoryViewer = require('mineflayer-web-inventory')

const bot = mineflayer.createBot({
  host: 'localhost',
  username: 'Bot', 
  auth: 'microsoft',
  port: 25565,                
  version: false,             
  password: '12345678',
})

inventoryViewer(bot)

bot.on('spawn', () => {
  bot.inventory.start()
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: false }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
})

let target = null

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  target = bot.players[username].entity
  let entity
  switch (message) {
    case 'forward':
      bot.setControlState('forward', true)
      break
    case 'back':
      bot.setControlState('back', true)
      break
    case 'left':
      bot.setControlState('left', true)
      break
    case 'right':
      bot.setControlState('right', true)
      break
    case 'sprint':
      bot.setControlState('sprint', true)
      break
    case 'stop':
      bot.clearControlStates()
      break
    case 'jump':
      bot.setControlState('jump', true)
      bot.setControlState('jump', false)
      break
    case 'jump a lot':
      bot.setControlState('jump', true)
      break
    case 'stop jumping':
      bot.setControlState('jump', false)
      break
    case 'attack':
      entity = bot.nearestEntity()
      if (entity) {
        bot.attack(entity, true)
      } else {
        bot.chat('no nearby entities')
      }
      break
    case 'mount':
      entity = bot.nearestEntity((entity) => { return entity.name === 'minecart' })
      if (entity) {
        bot.mount(entity)
      } else {
        bot.chat('no nearby objects')
      }
      break
    case 'dismount':
      bot.dismount()
      break
    case 'move vehicle forward':
      bot.moveVehicle(0.0, 1.0)
      break
    case 'move vehicle backward':
      bot.moveVehicle(0.0, -1.0)
      break
    case 'move vehicle left':
      bot.moveVehicle(1.0, 0.0)
      break
    case 'move vehicle right':
      bot.moveVehicle(-1.0, 0.0)
      break
    case 'tp':
      bot.entity.position.y += 10
      break
    case 'pos':
      bot.chat(bot.entity.position.toString())
      break
    case 'yp':
      bot.chat(`Yaw ${bot.entity.yaw}, pitch: ${bot.entity.pitch}`)
      break
  }
})

bot.once('spawn', () => {
  // keep your eyes on the target, so creepy!
  setInterval(watchTarget, 50)

  function watchTarget () {
    if (!target) return
    bot.lookAt(target.position.offset(0, target.height, 0))
  }
})

bot.on('mount', () => {
  bot.chat(`mounted ${bot.vehicle.displayName}`)
})

bot.on('dismount', (vehicle) => {
  bot.chat(`dismounted ${vehicle.displayName}`)
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)
