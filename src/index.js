const { Client, IntentsBitField } = require('discord.js');




const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is ready.`);
});

// Reply to messages
client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    console.log(msg.author.globalName + ': ' + msg.content);

    if (msg.content === 'testing bot') {
        msg.reply('Hello world');
    }
});

client.login(
    "MTE3NTIzMTUyMDQyOTA0Nzg2OA.GS0ZDm.rDjnv9z81HDPhwr2iIms3KahgHtz9CsOl5a1YI"
);