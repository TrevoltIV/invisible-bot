const mineflayer = require('mineflayer');
const radarPlugin = require('mineflayer-radar')(mineflayer);
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection } = require(`discord.js`);

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const bot = mineflayer.createBot({
  host: 'anarchy.6b6t.org',
  username: 'p5bub',
  auth: 'offline' // o 'microsoft'
});


radarPlugin(bot);

const discordChannelId = '1176376210410971246';
const commandChannelID = '1175574762949464127';

// Suponiendo que 'client' representa tu cliente de Discord

discordClient.on("messageCreate", async (message) => {
  if (message.channel.id !== commandChannelID || message.author.bot) {
    return;
  }

  // Añadir un prefijo ! para los comandos
  if (message.content.startsWith("!")) {
    const command = message.content.slice(1); // Eliminar el prefijo !

    if (command === "radar") {
      const embed5 = {
        embeds: [{
          title: 'Radar Link',
          description: 'Link to radar',
          thumbnail: {
      url: 'https://cdn.discordapp.com/attachments/1175574762949464127/1176376958486061117/SmartSelect_20231120_232149_Chrome.jpg?ex=656ea56a&is=655c306a&hm=e4541d929e47814ad26483be66770ef1faddaea0986f4e24154833eef44e86ff&'
                   },
          fields: [
            {
              name: 'Link:',
              value: 'https://2bdvl.underwl.repl.co/'
            }
          ]
        }]
      };
      
      message.channel.send(embed5);

    } else 
    if (command === "on") {
      message.channel.send('on')
      bot.chat('on')
      
    }
  }
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;

  const embed = {
    embeds: [{
      title: '2b2t Chat',
      description: `**${username}**: ${message}`,
      thumbnail: { 
        url: 'https://mc-heads.net/body/' + username
      }, 
    }]
  };
  discordClient.channels.cache.get(discordChannelId).send(embed);
});

discordClient.on('messageCreate', (message) => {
  // Manejar los mensajes de Discord aquí si es necesario
});

discordClient.login('MTE3NTY1NDAyMzQ3MTMwMDYwOA.Gq4FAM.2SJhOgu0oth8DlddQdIiKRtWBPd2242qDf__68');

                
