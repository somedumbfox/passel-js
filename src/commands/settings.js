const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('The configured settings for this bot'),
	async execute(interaction, client) {

		await interaction
			.reply(`**Archive Channel**: <#${client.pinsChannel}>/n`+
			       `**Blacklisted Channels**: ${client.blacklistedChannels.join(', ')}\n`+
						 `**${(!client.sendAll) ? 
								`Archive Mode**: ${(client.lastPinArchive) ? "Oldest Pin unpinned\n" : "Newest Pin unpinned\n"}` : 
								"**Archive All Pins**: Enabled"}`
						 );
	},
};