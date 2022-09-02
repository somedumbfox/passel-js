const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pins')
		.setDescription('Tells you the total number of pins on the channel'),
	async execute(interaction, client) {
		var channel = client.channels.cache.get(interaction.channelId)
		channel.messages.fetchPinned().then(async pins => {
			await interaction.reply(`There is ${pins.size} pin${(pins.size > 1) ? 's' : ''} on <#${interaction.channelId}>`);
		})
		
	},
};

function getPins(channel){
	return channel.messages.fetchPinned()
}