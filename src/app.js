const path = require('node:path');
const fs = require('node:fs');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, Colors } = require('discord.js');

// Author: SomeDumbFox#1234
// Creator: hyppytyynytyydytys#1010
// Created: 26 MAY 2020
// Last updated: 17 JULY 2022
// About: This is a 1:1 port of PasselBot, originally written in discordpy, to use the 
//        discordjs event handlers. This implementation is meant for private use only
//        and can only be run on 1 server.

//        Passel Bot is a solution to the number of limited number of pins in a discord server.
//        It manages pins in 2 lastPinArchives, lastPinArchive 1 and lastPinArchive 2. 

//        More information can be found on https://passelbot.wixsite.com/home
//        Passel Support Server: https://discord.gg/wmSsKCX

//        lastPinArchive - false: The most recent pinned message gets sent to a pins archive
//        channel of your choice. This means that the most recent pin wont be viewable in
//        the pins tab, but will be visible in the pins archive channel that you chose during setup

//        lastPinArchive - true: The oldest pinned message gets sent to a pins archive channel of
//        your choice. This means that the most recent pin will be viewable in the pins tab, and
//        the oldest pin will be unpinned and put into the pins archive channel

//        Furthermore: the p.sendAll feature described later in the code allows the user to set
//        Passel so that all pinned messages get sent to the pins archive channel.


/**---------------------------------------Start Configuration------------------------------------------------------------**/
//Paste you discord bot token here
const token = process.env.TOKEN || 'paste_token'
//Paste your pins channel as a string
//discordjs uses "Snowflakes" which are 64 bit signed Integers represented as strings.
//Pasting as an integer will cause integer collisions
const pinsChannel = '0'
//Enter as comma seperated strings IE ['001', '002']
var blacklistedChannels = []
//Archival Behavior
var lastPinArchive = true // set false if first pin gets archived.
var sendAll = false
/**----------------------------------------End Configuration-------------------------------------------------------------**/



const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
//copy current settings to client
client.commands = new Collection();
client.pinsChannel = pinsChannel
client.blacklistedChannels = blacklistedChannels
client.lastPinArchive = lastPinArchive
client.sendAll = sendAll

//client commands setup !!REQUIRES SLASH COMMAND REGISTRATION!!
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

//client interaction logic
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

//Logic to process on Pin Event
client.on('channelPinsUpdate', async (channel, time) => {
	console.log('pin event detected')
	//check if update happened in blacklisted channel. This uses the guild cache as a dirty means to find the channel.
	for (channelId in blacklistedChannels) {
		if (channel.id === channelId)
			console.log("encountered pin update in blacklisted channel")
		return
	}

	//Make sure the pins channel is still available.
	var isPinsChannelPresent = false
	var channelList = channel.guild.channels.cache.values()
	for (item of channelList) {
		if (item.id === pinsChannel)
			isPinsChannelPresent = true
	}
	if (!isPinsChannelPresent) {
		channel.send("Check to see if the pins archive channel during setup has been deleted")
		return
	}


	try {
		//Get all pinned messages in the channel
		channel.messages.fetchPinned().then((messages) => {

			//when sendAll is on, clear pins and archive all
			if (sendAll && messages.size > 49) {
				var pinEmbeds = []
				console.log("unpinning all messages")
				for (message of messages) {
					pinEmbeds.push(buildEmbed(message[1]))
					channel.messages.unpin(message[1])
				}

				//send embeds in bulk
				channel.guild.channels.fetch(pinsChannel).then(archiveChannel => {
					//can only send 10 embeds at a time. splice out pinEmbeds and send deleted contents
					//repeat until array is empty
					do {
						bulkSend(archiveChannel, pinEmbeds.splice(0, 10))
					} while (pinEmbeds.length > 0)
				})
				return
			} else {
				console.log("sendAll not enabled or pin max not reached")
			}

			//sendAll not enabled, archive and post single pin when full
			if (messages.size > 49 && !sendAll) {
				console.log('Removing Last Pinned Message!')
				var unpinnedMessage = (lastPinArchive) ? messages.last() : messages.first()
				var embed = []
				embed.push(buildEmbed(unpinnedMessage))
				channel.guild.channels.fetch(pinsChannel).then(archiveChannel => {
					bulkSend(archiveChannel, embed)
				})
				channel.send(`Removing ${(lastPinArchive) ? "last" : "first"} saved pin. See archived pin in: <#${pinsChannel}>`)
				channel.messages.unpin(unpinnedMessage)
			} else {
				console.log("Pin Max Not reached")
			}
		}).catch(error => {
			console.log(error)
		})
	} catch (error) {
		console.log(error)
	}
})

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on("error", (error) =>{
	console.log(error)
})

// Login to Discord with your client's token
client.login(token);


//Functions
/**
 * Creates and returns an embed based on the message contents
 * @param {*} messageToEmbed 
 * @returns 
 */
function buildEmbed(messageToEmbed) {
	var e = new EmbedBuilder()
		.setFooter({ text: `sent in ${messageToEmbed.channel.name} at: ${messageToEmbed.createdAt}` })
		.setTitle(`message by ${messageToEmbed.author.username}`)
		.setColor(Colors[Object.keys(Colors)[Math.floor(Math.random() * Object.keys(Colors).length)]])
		.addFields(
			{ name: "Jump", value: messageToEmbed.url, inline: false }
		)
	
	if(messageToEmbed.content)
		e.setDescription(`${messageToEmbed.content}`)
	if (messageToEmbed.attachments.size > 0) {
		if (messageToEmbed.attachments.first().contentType.includes("image"))
			e.setImage(messageToEmbed.attachments.first().attachment)
	}
	return e

}

/**
 * Bulk sends embeds with a given channel
 * @param {*} channel 
 * @param {*} whatToSend 
 */
function bulkSend(channel, whatToSend){
		channel.send({embeds: whatToSend})
}
