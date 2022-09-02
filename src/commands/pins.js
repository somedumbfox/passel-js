const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pins')
		.setDescription('Tells you the total number of pins on the channel'),
	async execute(interaction, client) {
		var fetchedPins = await interaction.channel.messages.fetchPins()
		await interaction.reply(`There is ${fetchedPins.size} pin${(fetchedPins.size > 1) ? 's' : ''} on <#${interaction.channelId}>`);
	},
};