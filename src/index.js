const fs = require('fs');
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection, Events, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType } = require(`discord.js`);
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
    client.login(process.env.token);
})();

var tickets = []

// Create checkout ticket
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton() && interaction.customId === 'ticketBtn') {
        const customer = interaction.user.username

        // Path to customer's cart file
        const filePath = `./src/customer-carts/${customer}.json`

        // Read customer cart file
        fs.readFile(filePath, 'utf8', async (err, data) => {

            if (err) {
                const reply = await interaction.reply({
                    content: `You have no items in your cart! Please add some items before proceeding to checkout.`,
                    ephemeral: true
                })

                setTimeout(() => {
                    reply.delete()
                }, 5000)
            } else {

                const itemListFileContent = fs.readFileSync('./src/catalog/items.json', 'utf8')
                const itemList = JSON.parse(itemListFileContent)

                const cartData = JSON.parse(data)

                const isMinimumPrice = () => {
                    let total = 0

                    cartData.item_ids.map(item => {
                        total += itemList[item].price
                    })
                    console.log(total)

                    if (total >= 5) {
                        return true
                    } else {
                        return false
                    }
                }

                if (isMinimumPrice()) {
                    try {

                        // Create new channel for the ticket
                        const channel = await interaction.guild.channels.create({
                            name: `ticket-${interaction.user.username}`,
                            type: ChannelType.GuildText,
                            parent: '1175554226097750096',
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
    
                        const cartItems = cartData.item_ids.map(itemId => {
                            const itemName = itemList[itemId].name
    
                            if (itemName) {
                                return itemName
                            } else {
                                return `Item with ID ${itemId} not found in catalog`
                            }
                        })
    
                        // Message to confirm contents of the cart
                        const embed = new EmbedBuilder()
                            .setTitle('Order Started')
                            .setDescription('Please double-check that the order is correct.')
                            .setTimestamp()
                            .setFooter({ text: 'Ticket created' })
                            .addFields(
                                { name: 'User', value: `\`\`\`${customer}\`\`\`` },
                                { name: 'Cart', value: `\`\`\`${getFormattedCartItems(cartItems)}\`\`\`` }
                            )
    
                        // Format items in the cart to have quantity beside it
                        function getFormattedCartItems(cartItems) {
                            const cartFrequency = {}
                            let formattedCartItems = ""
                            
                            for (let i = 0; i < cartItems.length; i++) {
                                const item = cartItems[i]
                                cartFrequency[item] = cartFrequency[item] ? cartFrequency[item] + 1 : 1
                            }
                            
                            for (const [item, frequency] of Object.entries(cartFrequency)) {
                                if (frequency > 1) {
                                    formattedCartItems += `${item} x${frequency}\n`
                                } else {
                                    formattedCartItems += `${item}\n`
                                }
                            }
                            
                            return formattedCartItems.trim()
                        }
    
                        // Cancel order button (closes ticket and clears customer's cart)
                        const closeBtn = new ButtonBuilder()
                            .setLabel('Cancel Order')
                            .setCustomId('closeTicket')
                            .setStyle(ButtonStyle.Danger)
    
                        // Confirm cart contents button
                        const confirmBtn = new ButtonBuilder()
                            .setLabel('Confirm')
                            .setCustomId('confirmBtn')
                            .setStyle(ButtonStyle.Primary)
    
                        const row = new ActionRowBuilder().addComponents(closeBtn, confirmBtn)
    
                        await channel.send({ embeds: [embed], components: [row] })
    
                        const reply = await interaction.reply({
                            content: `${interaction.user.tag}, your order has been successfully started! You can view it here ${channel}`,
                            ephemeral: true
                        })
    
                        setTimeout(() => {
                            reply.delete()
                        }, 5000)
                    } catch (parseError) {
                        console.error('Error parsing JSON data:', parseError)
                    }
                } else {
                    const reply = await interaction.reply({
                        content: 'Your cart is too small! Minimum purchase amount is $5.00 USD',
                        ephemeral: true
                    })

                    setTimeout(() => {
                        reply.delete()
                    }, 5000)
                }
            }
        });
    }
});

// Cancel order ticket
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton() && interaction.customId === 'closeTicket') {
        delete tickets[interaction.user.id]
        interaction.channel.delete()

        const dmEmbed = new EmbedBuilder()
        .setTitle('Order Cancelled')
        .setDescription('Your order has been cancelled and your cart has been cleared.')
        .setColor('Red')
        .setTimestamp()
        .setFooter({ text: `Sent from ${interaction.guild.name}` })

        const dmButton = new ButtonBuilder()
        .setLabel('Return')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/channels/1175574762949464124/1175583109199183933')

        const dmRow = new ActionRowBuilder()
        .addComponents(dmButton)

        const customer = interaction.user.username

        fs.unlinkSync(`./src/customer-carts/${customer}.json`)
        if (fs.existsSync(`./src/orders/${customer}.json`)) {
            fs.unlinkSync(`./src/orders/${customer}.json`)
        }

        interaction.user.send({ embeds: [dmEmbed], components: [dmRow] })
        return
    }
})

// Prompt user for necessary delivery information after confirming cart contents
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton() && interaction.customId === 'confirmBtn') {
        const userCartFile = fs.readFileSync(`./src/customer-carts/${interaction.user.username}.json`)
        const userCart = JSON.parse(userCartFile)

        if (userCart.item_ids.length >= 27) {
            // This code will create a different prompt because the order is too big for bot delivery
            await interaction.reply({
                content: `Your order is too big for instant bot delivery. I can only carry one ender chest (27 shulkers) at a time! I'll ping my boss so he can handle it. <@928898174721065000>`
            })
        } else {
            // Create prompt for orders that are eligible for bot delivery (27 items or less)
            const paymentMethodInput = new StringSelectMenuBuilder()
                .setPlaceholder('Payment method (make a selection)')
                .setCustomId('paymentMethodInput')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('PayPal')
                        .setValue('paypal'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Cashapp')
                        .setValue('cashapp'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Zelle')
                        .setValue('zelle'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Crypto')
                        .setValue('crypto'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Visa/Amazon gift card')
                        .setValue('gift-card'),
                )
            
            const deliveryMethodInput = new StringSelectMenuBuilder()
                .setPlaceholder('Delivery method (make a selection)')
                .setCustomId('deliveryMethodInput')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Instant bot pickup at spawn (you must arrive within 20 mins)')
                        .setValue('bot'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Manual dungeon chest delivery (may take up to 24 hours)')
                        .setValue('manual'),
                )
            
            const row1 = new ActionRowBuilder().addComponents(paymentMethodInput)
            const row2 = new ActionRowBuilder().addComponents(deliveryMethodInput)

            await interaction.reply({
                content: 'Please fill out the below fields (NOTE: Bot delivery is currently in development and not available yet)',
                components: [row1, row2],
                ephemeral: true
            })
        }
    }
})

// Add to cart
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return

    const customId = interaction.customId
    const customer = interaction.user.username
    const item = interaction.customId.slice(13)

    if (customId.startsWith('addToCartBtn')) {
        const filePath = `./src/customer-carts/${customer}.json`

        if (fs.existsSync(filePath)) {
            // User has an existing cart file
            const fileContent = fs.readFileSync(filePath, 'utf8')
            let data = JSON.parse(fileContent)

            data.item_ids.push(item)

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
        } else {
            // User does not have a cart file yet, create a new one
            const data = { item_ids: [item] }

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
        }

        const itemListFileContent = fs.readFileSync(`./src/catalog/items.json`, 'utf8')
        const itemData = JSON.parse(itemListFileContent)
        const itemName = itemData[item].name
        const reply = await interaction.reply({
            content: `Added ${itemName} to your cart.`,
            ephemeral: true
        })

        setTimeout(() => {
            reply.delete()
        }, 5000)
    }
});

// Handle prompt payment method input
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return

    const customId = interaction.customId
    const customer = interaction.user.username
    
    if (customId === 'paymentMethodInput') {
        if (fs.existsSync(`./src/orders/${customer}.json`)) {
            // If order file already exists, edit it
            const orderFile = fs.readFileSync(`./src/orders/${customer}.json`, 'utf8')
            let orderData = JSON.parse(orderFile)

            orderData.payment_method = interaction.values[0]
            fs.writeFileSync(`./src/orders/${customer}.json`, JSON.stringify(orderData, null, 2), 'utf8')

            if (orderData.delivery_method) {

                await interaction.channel.send({
                    content: `Payment method: ${orderData.payment_method}`
                })

                // Trigger next prompt (modal) if both inputs are filled
                const modal = new ModalBuilder()
                    .setCustomId('ignModal')
                    .setTitle('Minecraft Username')
                
                const ignInput = new TextInputBuilder()
                    .setCustomId('ignInput')
                    .setLabel('Your Minecraft username:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                
                const row = new ActionRowBuilder().addComponents(ignInput)
                modal.addComponents(row)

                await interaction.showModal(modal)
            } else {
                // Send notification that input selection was successful
                await interaction.reply({
                    content: `Payment method: ${interaction.values[0]}`
                })
            }
        } else {
            // If order file doesnt already exist, create it and set payment method property
            const orderData = {
                ign: null,
                total: 0,
                payment_method: interaction.values[0],
                delivery_method: null,
                paid: false,
                items: []
            }

            fs.writeFileSync(`./src/orders/${customer}.json`, JSON.stringify(orderData, null, 2), 'utf8')

            await interaction.reply({
                content: `Payment method: ${interaction.values[0]}`
            })
        }
    }
})

// Handle delivery method input
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return

    const customId = interaction.customId
    const customer = interaction.user.username
    
    if (customId === 'deliveryMethodInput') {
        if (fs.existsSync(`./src/orders/${customer}.json`)) {
            // If order file already exists, edit it
            const orderFile = fs.readFileSync(`./src/orders/${customer}.json`, 'utf8')
            let orderData = JSON.parse(orderFile)

            orderData.delivery_method = interaction.values[0]
            fs.writeFileSync(`./src/orders/${customer}.json`, JSON.stringify(orderData, null, 2), 'utf8')

            if (orderData.payment_method) {

                await interaction.channel.send({
                    content: `Delivery method: ${interaction.values[0]}`
                })

                // Trigger next prompt (modal) if both inputs are filled
                const modal = new ModalBuilder()
                    .setCustomId('ignModal')
                    .setTitle('Minecraft Username')
                
                const ignInput = new TextInputBuilder()
                    .setCustomId('ignInput')
                    .setLabel('Your Minecraft username:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                
                const row = new ActionRowBuilder().addComponents(ignInput)
                modal.addComponents(row)

                await interaction.showModal(modal)
            } else {
                // Send notification that input selection was successful
                await interaction.reply({
                    content: `Delivery method: ${interaction.values[0]}`
                })
            }
        } else {
            // If order file doesn't already exist, create it and set payment method property
            const orderData = {
                ign: null,
                total: 0,
                payment_method: null,
                delivery_method: interaction.values[0],
                paid: false,
                items: []
            }

            fs.writeFileSync(`./src/orders/${customer}.json`, JSON.stringify(orderData, null, 2), 'utf8')

            await interaction.reply({
                content: `Delivery method: ${interaction.values[0]}`
            })
        }
    }
})

// Handle IGN input
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return

    const customId = interaction.customId
    const customer = interaction.user.username

    if (customId === 'ignModal') {
        const orderFile = fs.readFileSync(`./src/orders/${customer}.json`)
        const cartFile = fs.readFileSync(`./src/customer-carts/${customer}.json`)
        const itemsFile = fs.readFileSync(`./src/catalog/items.json`)
        let orderData = JSON.parse(orderFile)
        let cartData = JSON.parse(cartFile)
        let itemsData = JSON.parse(itemsFile)

        let total = 0

        cartData.item_ids.forEach((item) => {
            total += itemsData[item].price
        })

        const formattedTotal = () => {
            const num = Number(total.toString().match(/^\d+\.\d{0,2}/))
            const str = num.toString()

            if (str.length < 2) {
                return total.toString() + '.00'
            } else if (str.length < 4) {
                return str + '0'
            } else {
                return str
            }
        }

        orderData.ign = interaction.fields.getTextInputValue('ignInput')
        orderData.items = cartData.item_ids
        orderData.total = formattedTotal()
        fs.writeFileSync(`./src/orders/${customer}.json`, JSON.stringify(orderData, null, 2), 'utf8')

        await interaction.channel.send({
            content: `IGN: ${interaction.fields.getTextInputValue('ignInput')}`
        })

        // Trigger next prompt

        switch (orderData.payment_method) {
            case "paypal":
                await interaction.reply({
                    content: `Send $${formattedTotal()} using this PayPal link: https://www.paypal.me/Trevolt1, then type "done"`,
                    ephemeral: true
                })
                break
            case "cashapp":
                await interaction.reply({
                    content: `Send $${formattedTotal()} to: $karstenkoer on Cashapp, then type "done"`,
                    ephemeral: true
                })
                break
            case "zelle":
                await interaction.reply({
                    content: `Send $${formattedTotal()} to (404) 695-6774 on Zelle, then type "done"`,
                    ephemeral: true
                })
                break
            case "crypto":
                await interaction.reply({
                    content: `
                        Send $${formattedTotal()} to one of the following crypto addresses, then type "done":\n
                        Bitcoin: CURRENTLY DISABLED\n
                        Ethereum: CURRENTLY DISABLED\n
                        BTC Cash: CURRENTLY DISABLED\n
                    `,
                    ephemeral: true
                })
                break
            case "gift-card":
                await interaction.reply({
                    content: `Send a gift card worth ${formattedTotal()}, then type "done". (Note that only Visa and Amazon cards are accepted)`,
                    ephemeral: true
                })
                break
            default:
                await interaction.reply({
                    content: 'Server error: Payment method unknown.'
                })
                break
        }
    }
})

// Handle payment verification ping
client.on('messageCreate', async msg => {
    if (msg.channel.name !== `ticket-${msg.author.username}`) return

    const content = msg.content.toLowerCase()

    if (content === 'done') {
        if (fs.existsSync(`./src/orders/${msg.author.username}.json`)) {
            const orderFile = fs.readFileSync(`./src/orders/${msg.author.username}.json`)
            const orderData = JSON.parse(orderFile)

            if (orderData.ign !== null && orderData.payment_method !== null && orderData.delivery_method !== null) {
                msg.channel.send('<@928898174721065000> READY FOR PAYMENT VERIFICATION')
            } else {
                msg.channel.send('You must fill out all fields before typing done. If this is an error, please ping Trevolt.')
            }
        } else {
            msg.channel.send('You must fill out all fields before typing done. If this is an error, please ping Trevolt.')
        }
    }
})