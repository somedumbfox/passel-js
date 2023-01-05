const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { where } = require('sequelize');
const rssFeed = require('../model/rssFeed')

const ADD = 'add'
const REMOVE = 'delete'
const SHOW = 'show'

module.exports = {
  data: new SlashCommandBuilder()
    .setName("feed")
    .setDescription("Add an RSS feed to periodically check and display on this text channel.")
    .addSubcommand(subCommand =>
      subCommand
        .setName(ADD)
        .setDescription("Add a feed to check")
        .addStringOption(option =>
          option
            .setName("name")
            .setDescription("The name of the Feed")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("url")
            .setDescription("The url of the Feed")
            .setRequired(true)
        )
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription("The channel to display the update in.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("message")
            .setDescription("Message to include on updates")
            .setRequired(false)
        )
    )
    .addSubcommand(subCommand =>
      subCommand
        .setName(REMOVE)
        .setDescription("Remove RSS Feed")
        .addStringOption(option =>
          option
            .setName("name")
            .setDescription("The name of the feed to remove, or `all` to remove RSS feeds.")
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand =>
      subCommand
        .setName(SHOW)
        .setDescription("Show server feeds. Can only display 25.")
    ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild + PermissionFlagsBits.UseApplicationCommands),
  async execute(interaction, client) {
    var subCommand = interaction.options._subcommand
    var options = interaction.options._hoistedOptions
    try {
      switch (subCommand) {
        case ADD:
          var name = options[0].value
          var url = options[1].value
          var channel = options[2].value
          var message = (options.length > 3) ? options[3].value : null
          rssFeed.create({
            feedName: name,
            guildId: interaction.guildId,
            channelId: channel,
            feedURL: url,
            lastItemGUID: "",
            customMessage: message
          })
          await makeReply(interaction, "Feed added.")
          break;
        case REMOVE:
          var feedName = options[0].value
          var recordsRemoved = 0
          if (feedName.toLowerCase() === 'all') {
            recordsRemoved = await rssFeed.destroy({
              where: {
                guildId: interaction.guildId
              }
            })
          } else {
            recordsRemoved = await rssFeed.destroy({
              where: {
                feedName: feedName,
                guildId: interaction.guildId
              }
            })
          }
          await makeReply(interaction, `Removed ${recordsRemoved} settings.`)
          break;
        case SHOW:
          var embed = new EmbedBuilder();
          embed.setTitle("Current Feeds")
          var feeds = await rssFeed.findAll({
            where: {
              guildId: interaction.guildId
            }
          })
          var fields = []
          feeds.forEach(feed => {
            fields.push({ name: feed.feedName, value: feed.feedURL, inline: false })
          })
          if (fields.length > 25)
            fields.splice(24)
          embed.addFields(fields)
          await interaction.reply({ embeds: [embed], ephemeral: true })
          break;
      }
    } catch (error) {
      await makeReply(interaction, "There was a problem when attempting to use this command")
    }
  },
};

async function makeReply(interaction, message) {
  await interaction.reply({
    content: message,
    ephemeral: true
  })
}