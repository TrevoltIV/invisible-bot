const fs = require('fs')
const path = require('path')
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const DeliveryBot = require('../bots/DeliveryBot'); // Ajusta la ruta según tu estructura

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deliver')
        .setDescription('Approve an order and start bot delivery')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const customer = interaction.channel.name.slice(7)
        const orderPath = path.join(__dirname, '..', 'orders', `${customer}.json`)

        try {
            // Verificar si el archivo de orden existe
            if (!fs.existsSync(orderPath)) {
                return await interaction.reply({
                    content: 'Server Error: Order data unavailable.',
                    ephemeral: true
                });
            }

            // Leer datos de la orden
            const orderFile = fs.readFileSync(orderPath, 'utf8')
            const orderData = JSON.parse(orderFile)

            // Validar que todos los campos necesarios estén completos
            const requiredFields = ['ign', 'payment_method', 'delivery_method', 'items'];
            const missingFields = requiredFields.filter(field => 
                orderData[field] === null || orderData[field] === undefined
            );

            if (missingFields.length > 0) {
                return await interaction.reply({
                    content: `Server Error: Missing order fields - ${missingFields.join(', ')}`,
                    ephemeral: true
                });
            }

            // Marcar orden como pagada
            orderData.paid = true
            orderData.status = 'processing'
            fs.writeFileSync(orderPath, JSON.stringify(orderData, null, 2), 'utf8')

            // Enviar mensaje al canal
            await interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Delivery en Progreso')
                        .setDescription(`Delivery bot está recolectando tus items. ¡Te notificaré cuando esté listo para recoger!`)
                        .addFields(
                            { name: 'Cliente', value: customer },
                            { name: 'Items', value: orderData.items.join(', ') },
                            { name: 'ETA', value: '1-2 minutos' }
                        )
                        .setColor('#00FF00')
                        .setTimestamp()
                ]
            })

            // Iniciar bot de delivery
            const deliveryBot = new DeliveryBot()
            deliveryBot.startDelivery(customer)

            // Respuesta de confirmación
            await interaction.reply({
                content: 'Delivery iniciado con éxito!',
                ephemeral: true
            })

        } catch (error) {
            console.error('Error en comando deliver:', error)
            await interaction.reply({
                content: 'Ocurrió un error al iniciar el delivery.',
                ephemeral: true
            })
        }
    }
}
