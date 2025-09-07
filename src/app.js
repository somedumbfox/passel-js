const path = require('node:path');
const fs = require('node:fs');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, Colors } = require('discord.js');
const sql = require("./model/database");
const rssFeed = require("./model/rssFeed")
const guildSettings = require("./model/guildSetting")
const { read } = require('@extractus/feed-extractor')
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const { where } = require('sequelize');


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

rssFeed.sync()
guildSettings.sync()
/**---------------------------------------Start Configuration------------------------------------------------------------**/
//Paste you discord bot token here
const token = process.env.TOKEN || 'paste_token'
var secondsTaskInterval = process.env.TASKINTERVAL || 60
var defaultPinLimit = process.env.PINLIMIT || 249
/**----------------------------------------End Configuration-------------------------------------------------------------**/

//Scheduled Tasks
const task = new Task('simple task', () => { checkFeeds() })
const job = new SimpleIntervalJob({ seconds: secondsTaskInterval, runImmediately: true }, task)

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
//copy current settings to client
client.commands = new Collection();
// client.pinsChannel = pinsChannel
// client.blacklistedChannels = blacklistedChannels
// client.lastPinArchive = lastPinArchive
// client.sendAll = sendAll

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
	//get the pin settings based on the guild.
	var guildSetting = await guildSettings.findOne({ where: { guildID: channel.guildId } })
	if (!guildSetting) {
		console.log(`Settings not configured for guild: ${channel.guildId}`)
		channel.send("There are no settings configured for this server. use `/settings archivechannel` to start!")
		return
	}

	var blacklistedChannels = guildSetting.blackListChannels.split(",")
	var pinsChannel = guildSetting.archiveChannel
	var lastPinArchive = guildSetting.lastPinArchive
	var sendAll = guildSetting.sendAll
	var pinLimit = guildSetting.pinLimit || defaultPinLimit
	console.log(`Entering pin event for guild: ${channel.guildId}`)
	//check if update happened in blacklisted channel.
	for (var channelId in blacklistedChannels) {
		if (channel.id === channelId) {
			console.log("Encountered pin update in blacklisted channel")
			return
		}
	}

	//Make sure the pins channel is still available. This uses the guild cache as a dirty means to find the channel.
	//If the pin channel was recently deleted, this can cause an error
	var isPinsChannelPresent = false
	var channelList = channel.guild.channels.cache.values()
	for (var item of channelList) {
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
			if (sendAll && messages.size > defaultPinLimit) {
				var pinEmbeds = []
				console.log("Unpinning all messages")
				//build embeds
				for (message of messages) {
					var embeds = buildEmbed(message[1])
					pinEmbeds = pinEmbeds.concat(embeds)
				}

				if (pinEmbeds.length == 0) {
					channel.send(
						`Tried to build embeds but failed to build any. Can not archive messages.`)
					return
				}

				//unpin them all
				for (message of messages) {
					channel.messages.unpin(message[1], "Send All Pin Archive")
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
				console.log("Send all requirements not met.")
			}

			//sendAll not enabled, archive and post single pin when full
			if (messages.size > defaultPinLimit && !sendAll) {
				console.log('Removing Last Pinned Message!')
				var unpinnedMessage = (lastPinArchive) ? messages.last() : messages.first()
				var embed = buildEmbed(unpinnedMessage)
				var videoURL = (unpinnedMessage.attachments.first() &&
					unpinnedMessage.attachments.first().contentType &&
					unpinnedMessage.attachments.first().contentType.includes("video")) ?
					unpinnedMessage.attachments.first().attachment || null : null
				channel.guild.channels.fetch(pinsChannel).then(archiveChannel => {
					do {
						bulkSend(archiveChannel, embed.splice(0, 10))
					} while (embed.length > 0)
					if (videoURL)
						archiveChannel.send(`Video: ${videoURL}`)
				})
				channel.send(`Removing ${(lastPinArchive) ? "last" : "first"} saved pin. See archived pin in: <#${pinsChannel}>`)
				channel.messages.unpin(unpinnedMessage, "Archive Pin")
			} else {
				console.log("Pin archive requirements not met")
			}

			console.log(`Exiting pin event for guild: ${channel.guildId}`)
		}).catch(error => {
			console.log(error)
		})
	} catch (error) {
		console.log(error)
	}
})

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready! Starting Scheduler.');
	job.start();
});

client.on("error", (error) => {
	console.log(error)
})

//when joining a new guid. notify the server that I need to be set up if a general channel exists.
client.on("guildCreate", (guild) => {
	//look for a general channel
	var general = guild.channels.cache.find(channel => channel.name === "general")
	if (general) {
		general.send("Thank you for adding me! Use `/settings archivechannel` to start!")
	}
})

//remove guild settings when removed
client.on("guildDelete", async (guild) => {
	var deletedRowsRSS = await rssFeed.destroy({
		where: {
			guildId: guild.id
		}
	})

	var deletedRowsSettings = await guildSettings.destroy({
		where: {
			guildId: guild.id
		}
	})

	console.log(`Deleted ${deletedRowsRSS} RSS settings and ${deletedRowsSettings} pin bot settings for ${guild.id}`)
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
	var embeds = []
	var e = null
	try {
		e = new EmbedBuilder()
			.setFooter({ text: `sent in ${messageToEmbed.channel.name}` })
			.setTitle(`message by ${messageToEmbed.author.username}`)
			.setColor(Colors[Object.keys(Colors)[Math.floor(Math.random() * Object.keys(Colors).length)]])
			.addFields(
				{ name: "Jump", value: messageToEmbed.url, inline: false }
			).setTimestamp(messageToEmbed.createdAt)

		if (messageToEmbed.content)
			e.setDescription(`${messageToEmbed.content}`)
		if (messageToEmbed.attachments.size > 0) {
			if (messageToEmbed.attachments.first().contentType.includes("image"))
				e.setImage(messageToEmbed.attachments.first().attachment)
		}
	} catch (error) {
		console.log(error)
	}
	if (e)
		embeds.push(e)
	if (messageToEmbed.embeds.length > 0)
		messageToEmbed.embeds.forEach(embed => embeds.push(embed))
	return embeds

}

/**
 * Bulk sends embeds with a given channel
 * @param {*} channel 
 * @param {*} whatToSend 
 */
function bulkSend(channel, whatToSend) {
	channel.send({ embeds: whatToSend })
}

/**
 * query the DB for all feeds and check for updates.
 * send a message when an update is found in the 
 * appropriate guild server.
 */
async function checkFeeds() {
	console.log("Entering RSS Feed Update")
	var feeds = await rssFeed.findAll()

	if (feeds.length) {
		feeds.forEach(async feed => {
			var feedName = feed.feedName
			var guildId = feed.guildId
			var channelId = feed.channelId
			var feedURL = feed.feedURL
			var lastItemGUID = feed.lastItemGUID
			var customMessage = feed.customMessage
			var rss = null
			console.log(`Checking the ${feedName} feed for guild: ${guildId}`)

			//grab the feed, Supports RSS, atom, json
			try {
				rss = await read(feedURL)
			} catch (error) {
				console.log(error)
			}

			//when there are entries present, get the first entry and compare it to the last saved
			//guid for the feed. If it's different, post the update.
			if (rss && rss.entries.length > 0) {
				if (rss.entries[0].id != lastItemGUID) {
					console.log(`Entry update found for ${guildId}:${feedURL}`)
					var startIndex = rss.entries.findIndex(x => x.id === lastItemGUID)
					var guild = await client.guilds.fetch(guildId)
					var channel = await guild.channels.fetch(channelId)

					if (startIndex == -1 || lastItemGUID == null || lastItemGUID === "") {
						//send only the first entry
						channel.send({ content: `${(customMessage) ? customMessage + "\n" : ""}${rss.entries[0].title}\n${rss.entries[0].link}` })
					} else {
						//get the oldest new entry, and post from the oldest one forward.
						for (var i = startIndex - 1; i >= 0; i--) {
							channel.send({ content: `${(customMessage) ? customMessage + "\n" : ""}${rss.entries[i].title}\n${rss.entries[i].link}` })
						}
					}

					await feed.update({
						lastItemGUID: rss.entries[0].id
					})
				} else {
					console.log(`No new entries for ${guildId}:${feedURL}`)
				}
			} else {
				console.log(`No entries for ${guildId}:${feedURL}`)
			}
		})
	} else {
		console.log("No feeds to check for ")
	}
}