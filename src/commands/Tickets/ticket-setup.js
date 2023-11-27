const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');


// Create a new ticket panel (staff only)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Open a ticket panel')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('Checkout')
            .setDescription('Open a checkout ticket to place order')
            .setColor('Blue')
        
        const ticketBtn = new ButtonBuilder()
            .setCustomId('ticketBtn')
            .setLabel('Checkout')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder()
            .addComponents(ticketBtn)

        await interaction.reply({ embeds: [embed], components: [row]})
    }
}