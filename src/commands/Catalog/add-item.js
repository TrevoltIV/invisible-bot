const fs = require('fs');
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');


// Post an item from the items.json file to the catalog channels

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

            const formattedPrice = () => {
                const num = Number(items[item_id].price.toString().match(/^\d+\.\d{0,2}/))
                const str = num.toString()
    
                if (str.length < 2) {
                    return items[item_id].price.toString() + '.00'
                } else if (str.length < 4) {
                    return str + '0'
                } else {
                    return str
                }
            }

            for (let [key, value] of Object.entries(items)) {
                if (key !== item_id) continue

                const embed = new EmbedBuilder()
                    .setTitle(value.name)
                    .setDescription(`Price: $${formattedPrice()}`)
                    .setImage(value.image)
                    .setColor('Blue')
                
                const addToCartBtn = new ButtonBuilder()
                    .setCustomId(`addToCartBtn-${key}`)
                    .setLabel('Add to Cart')
                    .setEmoji('🛒')
                    .setStyle(ButtonStyle.Secondary)

                const row = new ActionRowBuilder()
                    .addComponents(addToCartBtn)

                await interaction.channel.send({ embeds: [embed], components: [row]})
                const reply = await interaction.reply({
                    content: 'Success',
                    ephemeral: true
                })

                setTimeout(() => {
                    reply.delete()
                }, 50)
                break
            }
        })
    }
}