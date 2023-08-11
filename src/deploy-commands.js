const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

/**---------------------------------------Start Configuration------------------------------------------------------------**/
//Paste your bot client id
const clientId = process.env.clientId || 'paste_client_id'
//Paste your discord bot token
const token = process.env.TOKEN || 'paste_token'
/**----------------------------------------End Configuration-------------------------------------------------------------**/

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

//Comment the following lines out to delete commands
rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);

//Uncomment to delete specific commands
// rest.delete(Routes.applicationCommands(clientId, 'commandId'))
// 	.then(() => console.log('Successfully deleted application command'))
// 	.catch(console.error);