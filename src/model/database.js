const { Sequelize } = require('sequelize')
/**
 * database configuration
 * NOTE: USE ENVIRONMENT SECRETS FOR BEST SECURITY ON DEPLOYMENTS.
 * NO CONFIGURATION WILL LEAVE YOU WITH GENERIC DB ADMIN CREDENTIALS.
 * If you're running locally, the default settings will work fine.
 */
const sqlLoc = process.env.SQL || "DB.sqlite"
const dbUser = process.env.SQLUser || "User"
const dbPass = process.env.SQLPass || "Password"

const sql = new Sequelize("data", dbUser, dbPass, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: (value) => console.info(value),
	storage: sqlLoc
})

module.exports = sql