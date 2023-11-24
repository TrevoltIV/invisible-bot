const fs = require('fs');
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection, Events, ModalBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType } = require(`discord.js`);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] }); 

client.commands = new Collection();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();

var tickets = []

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton() && interaction.customId === 'ticketBtn') {
        const modal = new ModalBuilder()
        .setCustomId('ticketModal')
        .setTitle('Support Ticket')

        const topicInput = new TextInputBuilder()
        .setCustomId('topic')
        .setLabel('Topic')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('What is the topic of your issue?')
        .setMinLength(3)
        .setMaxLength(25)
        .setRequired(true)

        const issueInput = new TextInputBuilder()
        .setCustomId('issue')
        .setLabel('Issue')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('What is the issue?')
        .setMinLength(15)
        .setMaxLength(250)
        .setRequired(true)

        const firstActionRow = new ActionRowBuilder().addComponents(topicInput)
        const secondActionRow = new ActionRowBuilder().addComponents(issueInput)

        modal.addComponents(firstActionRow, secondActionRow)
        await interaction.showModal(modal)
    } else if (interaction.isModalSubmit()) {
        
        const topic = interaction.fields.getTextInputValue('topic')
        const issue = interaction.fields.getTextInputValue('issue')

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: '1175574875369386064',
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    id: '1175575202151809105',
                    allow: [PermissionsBitField.Flags.ViewChannel]
                }
            ]
        })

        const embed = new EmbedBuilder()
        .setTitle('Ticket Opened')
        .setDescription('Ticket created, please wait for a staff member to respond')
        .setTimestamp()
        .setFooter({ text: 'Ticket Created At' })
        .addFields(
            { name: 'User', value: `\`\`\`${interaction.user.username}\`\`\`` },
            { name: 'Topic', value: `\`\`\`${topic}\`\`\`` },
            { name: 'Issue', value: `\`\`\`${issue}\`\`\`` }
        )

        const closeBtn = new ButtonBuilder()
        .setEmoji('❌')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('closeTicket')

        const pingBtn = new ButtonBuilder()
        .setLabel('Ping Staff')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('pingStaff')

        const row = new ActionRowBuilder().addComponents(closeBtn, pingBtn)

        await channel.send({ embeds: [embed], components: [row] })

        await interaction.reply({
            content: `${interaction.user.tag}, your ticket has been successfully created! You can view it here ${channel}`,
            ephemeral: true
        })
    }
})

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton() && interaction.customId === 'closeTicket') {
        delete tickets[interaction.user.id]
        interaction.channel.delete()

        const dmEmbed = new EmbedBuilder()
        .setTitle('Ticket Closed')
        .setDescription('Thank you for contacting support. Your ticket has been closed.')
        .setColor('Blue')
        .setTimestamp()
        .setFooter({ text: `Sent from ${interaction.guild.name}` })

        const dmButton = new ButtonBuilder()
        .setLabel('Return')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/channels/1175574762949464124/1175583109199183933')

        const dmRow = new ActionRowBuilder()
        .addComponents(dmButton)

        interaction.user.send({ embeds: [dmEmbed], components: [dmRow] })
        return
    }
})

// Ping Staff
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton() && interaction.customId === 'pingStaff') {

        const staffId = [
            '1175575202151809105'
        ]

        const roleMention = staffId.map(id => `<@${id}>`).join(' ')
        const msgContent = `${roleMention}`

        const embed = new EmbedBuilder()
        .setTitle('Staff Pinged')
        .setDescription('The staff have been pinged please wait 2-4 hours')
        .setColor('Blue')
        .setTimestamp()
        .setFooter({ text: 'Staff Pinged At' })

        await interaction.channel.send({
            content: msgContent,
            embeds: [embed]
        })

        await interaction.reply({
            content: 'You have successfully pinged staff.',
            ephemeral: true
        })
    }
})