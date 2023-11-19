const { Client, IntentsBitField } = require('discord.js');
require('./ticket.js');




const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', () => {
    console.log('Bot is ready');
});

client.on('messageCreate', (msg) => {
    if (msg.content === '!test') {
        const channel01 = client.channels.cache.find(channel => channel.id === '1175575114973184060');
        channel01.send('It works!');
        console.log(client.channels.cache);
    }
});


client.login(
    "MTE3NTU4MjQwMzM2NDkyOTU5Ng.GKQ6W6.rkiiV6mTWDRWrDCBLZHisZT86AvdmjJ9aOgFok"
);