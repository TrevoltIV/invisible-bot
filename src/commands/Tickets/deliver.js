const fs = require('fs')
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');


// Start delivery
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deliver')
        .setDescription('Approve an order and start bot delivery')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const customer = interaction.channel.name.slice(7)

        if (fs.existsSync(`./src/orders/${customer}.json`)) {
            const orderFile = fs.readFileSync(`./src/orders/${customer}.json`, 'utf8')
            const orderData = JSON.parse(orderFile)

            if (orderData.ign !== null && orderData.payment_method !== null && orderData.delivery_method !== null) {

                orderData.paid = true
                fs.writeFileSync(`./src/orders/${customer}.json`, JSON.stringify(orderData, null, 2), 'utf8')

                await interaction.channel.send({
                    content: `
                        Delivery bot is collecting your items, I'll notify you when it is ready for pickup!
                        Please be ready to head to its coordinates (3k or less from spawn)
                        ETA: 1-2 minutes
                    `
                })

                await interaction.reply({
                    content: 'Success!',
                    ephemeral: true
                })
            } else {
                await interaction.reply({
                    content: 'Server Error: Order data is not entirely filled.',
                    ephemeral: true
                })
            }
        } else {
            await interaction.reply({
                content: 'Server Error: Order data unavailable.'
            })
        }
    }
}