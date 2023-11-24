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
        .setTitle('Contact Support')
        .setDescription('Create a ticket')
        .setColor('Blue')
        
        const ticketBtn = new ButtonBuilder()
        .setCustomId('ticketBtn')
        .setLabel('Create Ticket')
        .setEmoji('📩')
        .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder()
        .addComponents(ticketBtn)

        await interaction.reply({ embeds: [embed], components: [row]})
    }
}