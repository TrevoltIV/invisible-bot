const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').headless

const bot = mineflayer.createBot({
  host: '15.235.53.208',
  port: '2234',
  username: 'popbob'
})

const streamServer = 'bog01.contribute.live-video.net' // see https://help.twitch.tv/s/twitch-ingest-recommendation for list, choose the closest to you
const streamKey = 'live_882504473_gVQQyINIgEgdX3RLOSMuJ0a1qadK4f' // your streaming key

bot.once('spawn', () => {
  mineflayerViewer(bot, { output: `rtmp://${streamServer}/app/${streamKey}`, width: 1280, height: 720, logFFMPEG: true })
  bot.setControlState('jump', true)
})