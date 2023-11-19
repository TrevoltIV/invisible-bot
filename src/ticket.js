const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ButtonInteraction, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Use this command to create a ticket panel'),
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'You must be administrator to create a ticket panel.'});

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('ticketPanel')
            .setEmoji('📩')
            .setLabel('Create Order Ticket')
            .setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("Tickets & Support")
        .setDescription("To create an order ticket, click the button below")

        await interaction.reply({ embeds: [embed], components: [button]});

        const collector = await interaction.channel.createMessageComponentCollector();
        collector.on('collect', async i => {
            await i.update({ embeds: [embed], components: [button]});

            const channel = await interaction.guild.channels.create({
                name: `ticket ${i.user.tag}`,
                type: ChannelType.GuildText,
                parent: `1175574875369386064`
            });

            channel.permissionOverwrites.create(i.user.id, { viewChannel: true, SendMessages: true});
            channel.permissionOverwrites.create(channel.guild.roles.everyone, {viewChannel: false, SendMessages: false});

            channel.send({ content: `Ticket created for customer ${i.user}`});
            i.user.send(`Your ticket within ${i.guild.name} has been created. You can view it in ${channel}.`)
            .catch(err => {
                return;
            });
        })
    }
}