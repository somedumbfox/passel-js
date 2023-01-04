const { Sequelize, DataTypes } = require('sequelize')
const sql = require('./database')

module.exports = sql.define('guildSettings', {
	guildId: {
		type: DataTypes.STRING,
		unique: true,
	},
  blackListChannels:{
    type: DataTypes.STRING(950),
    unique: false
  },
  archiveChannel:{
    type: DataTypes.STRING,
    unique: false
  },
  sendAll:{
    type: DataTypes.BOOLEAN,
    unique: false
  },
  lastPinArchive:{
    type: DataTypes.BOOLEAN,
    unique: false
  }
})