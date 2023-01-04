const { SlashCommandBuilder, PermissionFlagsBits, Interaction } = require('discord.js');
const { where } = require('sequelize');
const guildSettings = require("../model/guildSetting")

const SHOW = 'show'
const BLACKLIST = 'ignorelist'
const ARCHIVECHANNEL = 'archivechannel'
const SENDALL = 'sendall'
const LASTPIN = 'lastpin'

module.exports = {
	data: new SlashCommandBuilder()
		.setName("settings")
		.setDescription('The configured settings for this bot')
		.addSubcommand(subCommand =>
			subCommand
				.setName(SHOW)
				.setDescription("Show The Settings")
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName(BLACKLIST)
				.setDescription("Add/Remove Blacklisted Channels to this server")
				.addChannelOption(option =>
					option
						.setName("channel")
						.setDescription("The channel to add/remove")
				)
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName(ARCHIVECHANNEL)
				.setDescription("Set up the pin archive channel for this server")
				.addChannelOption(option =>
					option
						.setName("channel")
						.setDescription("The channel to add/remove")
				)
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName(SENDALL)
				.setDescription("Toggle wether all pins are archived, or just one.")
				.addBooleanOption(option =>
					option
						.setName("set")
						.setDescription("True: All pinned messages are archived. False: One pin is archived.")
				)
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName(LASTPIN)
				.setDescription("Used when send all is false. Toggles wether first or last pinned message is sent")
				.addBooleanOption(option =>
					option
						.setName("set")
						.setDescription("True: oldest pinned message is archived. False: newest pinned message is archived.")
				)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild + PermissionFlagsBits.UseApplicationCommands),
	async execute(interaction, client) {
		var subCommand = interaction.options._subcommand
		var options = interaction.options._hoistedOptions
		var guildSetting = await guildSettings.findOne({ where: { guildId: interaction.guildId } })

		switch (subCommand) {
			//Show the currently configured settings to the user
			case SHOW:
				if (!guildSetting) {
					await interaction.reply(
						{
							content: `There are no settings for this server configured, use \`/settings ${ARCHIVECHANNEL}\` to get started.`,
							ephemeral: true
						}
					)
					return
				}
				var channelMentions = []
				if (guildSetting.blackListChannels)
					for (channelID of guildSetting.blackListChannels.split(","))
						channelMentions.push(`<#${channelID}>`)
				await interaction
					.reply({
						content: `**Archive Channel**: <#${guildSetting.archiveChannel}>\n` +
							`**Blacklisted Channels**: ${(channelMentions.length) ? `${channelMentions.join(', ')}` : "None"}\n` +
							`${(!guildSetting.sendAll) ?
								`**Archive Mode**: ${(guildSetting.lastPinArchive) ? "Oldest Pin unpinned\n" : "Newest Pin unpinned\n"}` :
								"**Archive All Pins**: Enabled"}`,
						ephemeral: true
					});
				break;

			//update the ingorelist for the user
			case BLACKLIST:
				var ignoredChannels = []
				var channelUpdate = options[0].value
				if (guildSetting) {
					//update the guild settings
					if (guildSetting.blackListChannels)
						for (channelID of guildSetting.blackListChannels.split(","))
							ignoredChannels.push(channelID)
					if (ignoredChannels.includes(channelUpdate))
						ignoredChannels.splice(ignoredChannels.indexOf(channelUpdate), 1)
					else
						ignoredChannels.push(options[0].value)

					guildSetting.update({ blackListChannels: ignoredChannels.join(",") })
					await makeReply(interaction, "Ignore list updated.")
				} else {
					await makeReply(interaction, `There are no settings for this server configured, use \`/settings ${ARCHIVECHANNEL}\` to get started.`)
				}
				break;

			//update the channel used for pin archives
			case ARCHIVECHANNEL:
				var archiveChannelUpdate = options[0].value
				if (!guildSetting) {
					//create guild setting with defaults
					guildSettings.create(
						{
							guildId: interaction.guildId,
							archiveChannel: archiveChannelUpdate,
							blackListChannels: "", //No channels
							lastPinArchive: true,
							sendAll: false
						})
					await makeReply(interaction, "Default server settings created with pin channel")
				} else {
					guildSetting.update({ archiveChannel: archiveChannelUpdate })
					await makeReply(interaction, "Pin channel updated")
				}
				break;
			case SENDALL:
				var sendAllUpdate = options[0].value
				if (guildSetting) {
					guildSetting.update({ archiveChannel: sendAllUpdate })
				}
				else {
					await makeReply(interaction, `There are no settings for this server configured, use \`/settings ${ARCHIVECHANNEL}\` to get started.`)
				}
				break;
			case LASTPIN:
				var lastPinUpdate = options[0].value
				if (guildSetting) {
					guildSetting.update({ lastPinArchive: lastPinUpdate })
				}
				else {
					await makeReply(interaction, `There are no settings for this server configured, use \`/settings ${ARCHIVECHANNEL}\` to get started.`)
				}
				break;
		}

		// await interaction
		// 	.reply({content:`**Archive Channel**: <#${guildSetting.archiveChannel}>\n`+
		// 	       `**Blacklisted Channels**: ${ (channelMentions.length)? `${channelMentions.join(', ')}`: "None"}\n`+
		// 				 `${(!guildSetting.sendAll) ? 
		// 						`**Archive Mode**: ${(guildSetting.lastPinArchive) ? "Oldest Pin unpinned\n" : "Newest Pin unpinned\n"}` : 
		// 						"**Archive All Pins**: Enabled"}`,
		// 						ephemeral: true
		// 				 });
	}
};

async function makeReply(interaction, message) {
	await interaction.reply({
		content: message,
		ephemeral: true
	})
}