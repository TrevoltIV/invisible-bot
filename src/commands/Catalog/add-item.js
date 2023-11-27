const fs = require('fs');
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');


// Create a new ticket panel (staff only)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-item')
        .setDescription('Add an item to the channel you are in.')
        .setDMPermission(false)
        .addStringOption(option => 
            option.setName('item_id')
                .setDescription('Pull an item from items.json and post in catalog.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {

        fs.readFile('./src/catalog/items.json', 'utf8', async (err, data) => {
            if (err) {
                console.error(err)
            }

            const item_id = interaction.options.getString('item_id')
            const items = JSON.parse(data)

            for (let [key, value] of Object.entries(items)) {
                if (key !== item_id) continue

                const embed = new EmbedBuilder()
                    .setTitle(value.name)
                    .setDescription(`Price: $${value.price}0`)
                    .setImage(value.image)
                    .setColor('Blue')
                
                const addToCartBtn = new ButtonBuilder()
                    .setCustomId(`addToCartBtn-${key}`)
                    .setLabel('Add to Cart')
                    .setEmoji('🛒')
                    .setStyle(ButtonStyle.Secondary)

                const row = new ActionRowBuilder()
                    .addComponents(addToCartBtn)

                await interaction.reply({ embeds: [embed], components: [row]})
            }
        })
    }
}