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

        const customer = interaction.user.username

        // Path to customer's cart file
        const filePath = `./src/customer-carts/${customer}.json`

        // Read customer cart file
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading the file:', err)
            } else {
                try {
                    const cartData = JSON.parse(data)

                    // Create new channel for the ticket
                    const channel = await interaction.guild.channels.create({
                        name: `ticket-${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: '1175574875369386064',
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel] // Deny access to other users that are not the customer
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel] // Allow access to the customer
                            }
                        ]
                    })

                    // Message to confirm contents of the cart
                    const embed = new EmbedBuilder()
                        .setTitle('Order Started')
                        .setDescription('Please double-check that the order is correct.')
                        .setTimestamp()
                        .setFooter({ text: 'Ticket created' })
                        .addFields(
                            { name: 'User', value: `\`\`\`${customer}\`\`\`` },
                            { name: 'Cart', value: `\`\`\`${cartData.item_ids.map(itemId => {
                                return itemId // Display cart items in new channel
                            })}\`\`\`` }
                        )

                    // Close ticket button
                    const closeBtn = new ButtonBuilder()
                        .setEmoji('❌')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('closeTicket')

                    // Ping staff button
                    const pingBtn = new ButtonBuilder()
                        .setLabel('Ping Staff')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId('pingStaff')

                    const row = new ActionRowBuilder().addComponents(closeBtn, pingBtn)

                    await channel.send({ embeds: [embed], components: [row] })

                    await interaction.reply({
                        content: `${interaction.user.tag}, your order has been successfully started! You can view it here ${channel}`,
                        ephemeral: true
                    });
                } catch (parseError) {
                    console.error('Error parsing JSON data:', parseError);
                }
            }
        });
    }
});

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