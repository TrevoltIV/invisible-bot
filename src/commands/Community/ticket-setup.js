const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Creates a ticket panel.'),
    async execute(interaction, client) {
        await interaction.reply({ content: 'This command has not been coded yet.' });
    }
}