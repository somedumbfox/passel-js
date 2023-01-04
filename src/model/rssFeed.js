const { Sequelize, DataTypes } = require('sequelize')
const sql = require('./database')

module.exports = sql.define('rssFeed', {
	feedName:{
		type: DataTypes.STRING,
		unique: true,
  },
  feedURL: {
		type: DataTypes.STRING,
		unique: false,
	},
  guildId:{
    type: DataTypes.STRING,
    unique: false
  },
  channelId: {
    type: DataTypes.STRING,
    unique: false
  },
  lastItemGUID:{
    type: DataTypes.STRING(500),
    unique: false
  },
  customMessage:{
    type:DataTypes.STRING(500),
    unique: false
  }
})