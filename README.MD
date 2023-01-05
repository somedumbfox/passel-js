# About
This is a bot port of [Passel Public](https://github.com/stoir/passel_public) to use discords official bot api ([discord.js](https://discord.js.org/)). I did this mainly because I was bored and some users that wanted to host passel public wanted a discord js version. Running a personal instance of this bot can server multiple servers (up to 100 before verification requirements come into play).

## Contents
- [Requirements](#requirements)
- [Enable developer mode on discord](#enable-developer-mode-on-discord)
- [Create your discord bot](#create-your-discord-bot)
- [Download this repo and configure your bot](#download-this-repo-and-configure-your-bot)
- [Run your bot locally](#run-your-bot-locally)
- [Deployment](#deployment)
- [Available Commands](#available-commands)
- [FAQ](#faq)

## Requirements
Nodejs is required to be installed on your machine before running this bot locally. Also, your choice of text editor. You will be editing files in this repo. I recommend [VSCode](https://code.visualstudio.com/) if you're just starting out.

### nodeJs For Windows/Mac:
Download and install [nodejs](https://nodejs.org/en/download/) (version >= 16.0.0)

Alternatively for Mac, you may install nodeJs via homebrew if you have it.

### nodeJs For Linux:
Follow [these instructions](https://nodejs.org/en/download/package-manager/) for your machine

## Enable developer mode on discord
Open your discord client and open your user settings.

Open the Advanced tab. On this page check Developer Mode so it's enabled. That's it you're done here.

## Create your discord bot

### Create your application
Go to the [discord dev portal](https://discord.com/developers) and sign up to become a discord developer.
In the Applications page select "New Application" on the top right.

![new app](images/newapplication.png)

Give your application a name. It can be anything you want, this will be the default bots name.

![name it](images/applicationname.png)

You will be taken to your bots page when you agree to the terms and save. Here you'll land on the General Information tab. On this
page you will want to take note of your appliaction id. Note: This page holds public Information about your bot, however this bot 
will be configured to not be public. So it is best to keep this information to yourself and not share it.

![Application ID](images/generalinfo.png)

### Create and configure your bot
Select Bot on the left. On this page you'll see the Build-A-Bot page. Go ahead the select "Add Bot" and select "Yes, dot it".
You will see the option "Reset Token" below your bots name. Select that option then select "Yes, do it!". 
Enter your 2fa token if prompted.

You'll now see a string of characters (IE: `MTAxNTEwNjcwMDg0MTMyNDU5NQ.G3QeDO.i2aHpO1buLSh_RSxRkKxPFwMTvghYoKW7IjwBM`). 
Take note of this token and save it somewhere save. If you lose this token, you will need reset the token again to view 
a new token.

On the same page. Uncheck "PUBLIC BOT", Keep "REQUIRES OAUTH2 CODE GRANT" unchecked, 
and check "PRESENCE INTENT", "SERVER MEMBERS INTENT", and "MESSAGE CONTENT INTENT". Select save changes.

### Generate your bot invite
Go to OAuth2->URL Generator

![URL Generator](images/generate.png)

On this page select scopes `bot` and `appliactions.commands`

![Scopes selected](images/scopes.png)

Now select `Administrator` for Bot permissions

![permissions selected](images/perms.png)

Copy and paste the genereated URL at the bottom in your web browser to invite your bot to your server.

This page occasionally doesn't work for some people. The link that is generated is:

`https://discord.com/api/oauth2/authorize?client_id=0&permissions=8&scope=bot%20applications.commands`

Replace the 0 after `client_id` with the Application Id on your General Information page.

## Download this repo and configure your bot
Use [this link](https://github.com/somedumbfox/passel-js/archive/refs/tags/v2.0.2.zip) to download this repo as a zip file.
Uzip the contents of the file into a folder of your choice. Keep note of the file path to your bot.

The files you will need to edit are:
- `./src/app.js`
- `./src/deploy-commands.js`
- `./fly.toml` - optional
- `./package.json` - optional

### app.js Configuration
Find the line:
`/**---------------------------------------Start Configuration------------------------------------------------------------**/`

For each item, you'll need to set it accordingly.

- `token`: Set this variable as your discord bot token. If you're not sure, it is the alpha numeric token that looks a bit like this: `MTAxNTEwNjcwMDg0MTMyNDU5NQ.G3QeDO.i2aHpO1buLSh_RSxRkKxPFwMTvghYoKW7IjwBM`. Leave this setting as `"paste_token"` if you plan on using fly.io with secrets configured.
- `secondsTaskInterval`: Set the number (in seconds) to change the interval

### deploy-commands.js Configuration
Find the line:
`/**---------------------------------------Start Configuration------------------------------------------------------------**/`

For each item, you'll need to set it according.
- `clientId`: This is your appliactionId. Paste that ID within the quotes.
- `token`: This is your bot token. Paste that token within the quotes. This token can be removed from the file once the commands have been registered.

### fly.toml and package.json configuration
This is not a required step. If you wish to keep things consistent, and want to use a different name that appears on your fly.io (see [deployment](#deployment)) account. Adjust the `name` (`package.json`) and `app` (`fly.toml`) variables in both files to the name of your choosing. Ensure both are all lowercase with no space (IE:`my-bot-name`).

`fly.toml`:

![](images/flyname.png)

`package.json`

![](images/packagename.png)

# Run your bot locally
It is best to run you bot on your personal machine first to ensure it is working properly after your configuration. To do so, you will want to open a terminal window (Command Prompt, Powershell, Bash, etc...) and change directory to the folder you set up earlier.

## Installation
With your terminal open change to the directory to the your the root folder of your bot IE: `cd C:\repos\passel-js` where `C:\repos\passel-js` is the folder you extracted the contents of the repo .zip file that was downloaded. You are at the root of the folder if you see the `package.json` and `package-lock.json` files.

Now type:

`npm install`

## Register your bot slash commands
With the terminal still open on your root folder. Type:

`npm run register`

This command only needs to be run once after configuration. If you add more commands, or make any 
changes to the command names, you'll need to run this script again.

If you no longer need to run slash command registrations. You can delete the bot token from the `deploy-commands.js` file.

## Running locally
While in the root folder on your terminal. Type.

`npm start`

While the bot is running, test to see if you have configured your bot correctly with the following slash command in discord `/settings`
If you see the message that the bot is not configured, that means the bot is running successfully.

Configure you server using `/settings archivechannel #channel`. By default, only one pin will be archived at a time, with the oldest pin being archived.

Test the bot by pinning and unpinning content. If you come across an issue please let the repo owner know (@SomeDumbFox#1234). Once you finished testing locally, you may either:

- Let it continue to run. Running this bot on your machine is probably the best way to ensure it remains running at no additional cost. As long as your PC is on and connected to the internet, the bot stays online. If the bot crashes, you can restart using the `npm start` command. 
- Use a free (or paid) deployment service to keep your bot up. Keep in mind, free deployments are not reliable as there is no way of knowing how long a free service will remain free.

## Common errors
```
Error [TokenInvalid]: An invalid token was provided.
    at WebSocketManager.connect ...
    ...
  code: 'TokenInvalid'
}
```
This means the bot token you provided is invalid. If you're not sure if you copied the right value, go back the discord dev portal and reset your bot token. Also, make sure you saved your `app.js` in your text editor.

# Deployment
[Fly.io](https://fly.io) offers 2 free app deployments on a shared virtual machine. If you are planning to only use this bot for pin management and nothing more, this proves to be a decent service to test out the bot. Otherwise, if you wish to add more commands and interactions with this bot, a paid service of your liking will be the best option. Also keep in mind there are risks associated in free hosting, and that free hosting is often never guaranteed.

Go to fly.io and click Get Started. On this page, follow the instructions on installing Fly.io to your machine, and sign up for free. Note: Fly.io has the right to restrict free apps whenever they want.

Secondly, if you previously run your app locally, you may want to delete the `node_modules` folder and delete any saved bot tokens in `app.js` and `deploy-commands.js`

## Create your app with fly.io
On windows, you must be in PowerShell. Other systems, open your terminal and change directory to the root folder of you bot.

While in your bots root directory. Type:

`flyctl auth login` - This will open a web browser to sign in to fly.io. you may close the window when your terminal says you have successfully logged in.

Create your app:

`flyctl create app-name`

> Replace `app-name` with your preferred app name. (If you edited fly.toml, use the app name you chose to save some time). The app name must be all lowercase, letters and numbers only.

Create your Volume:

`flyctl vol create data --size 1`

> This will attach a volume to the app you just created. Select the region you want to host your app.

Set your secrets:

`flyctl secrets set TOKEN=bot-token`
> Replace `bot-token` with your discord bot token

`flyctl secrets set SQL=/data/DB.sqlite`

> Can be copied a pasted. No need to change this value. You can rename `DB.sqlite` if you want to.

`flyctl secrets set SQLUser=user-name`
> Replace `user-name` with a made up name of your choice. This will be the DB admin username.

`flyctl secrets set SQLPass=password`
> Replace `password` with a secure password of your own. This is the DB Admin password.

`flyctl secrets set TASKINTERVAL=600`
> Optional for RSS feed checks. If you plan on using this feature set this number in seconds to how often you want the bot to check for new content. IE: Every 600 seconds (10 minutes)

Deploy your app for the first time:

`flyctl launch`
> The apps will automatically launch using the fly.toml file you edited. The region entered earlier will be used for the application.

If you see any prompts:

`? Would you like to copy its configuration to the new app? (y/N)`
> Type `y`

`? App Name (leave blank to use an auto-generated name):`
> Choose a name (numbers/letters only, all lowercase). IE: `my-passel-bot`. You will be given a random name if left blank.

`? Select region:  [Use arrows to move, type to filter]`
> Select the region closest to you by using the up and down arrow keys. Press Enter on the region you want.

`? Would you like to set up a Postgresql database now? (y/N)`
> Type `n`.

`? Would you like to deploy now? (y/N)`
> Type `y`

After that watch your terminal launch your first bot. Once it's launched, check your fly.io dashboard and see if it's running.

## Deploying changes
If you needed to update your bot with new configurations, once you have saved your files. Go ahead and open your terminal (PowerShell on Windows) and change directory to your bots root folder.

In the terminal, while in your bots root folder. Type:

`flyctl auth login` - Follow directions to login. Close browser when done.

`flyctl deploy`

Watch the app build and deploy, and check your fly.io dashboard to ensure you bot successfully restarted.

## Deleting your app
If fly.io is not to your liking. You have 2 ways to delete your app.

The first way, and easiest, is to log in your fly.io dashbaord and select the app you want to remove. Go to the settings of the app, and select "Delete app". Follow the prompt and your done.

In your terminal (PowerShell on windows), change directory to your bots root folder. Type:

`flyctl auth login` - Follow directions to login. Close browser when done.

`flyctl delete app-name --yes` - Replace `app-name` with the name of your app in the `fly.toml` file. 

## Available Commands
`/settings archivechannel #channel` - Sets the channel used to archive pins.

`/settings ignorelist #channel` - Add/Removes a channel to the ignore list. Channels in the list will not have pins archived.

`/settings sendall true/flase` - Change the send all behavior. True will remove all pins from the pins list in a channel. False will remove one pin.

`/settings lastpin true/false` - Change the single pin arvhive behavior. True will remove the oldest pin. False will remove the newest pin.

`/settings show` - Shows the current configuration of the pin bot for your server.

`/feed add name url #channel | message` - Adds an RSS feed to listen to for changes. Will announce the newest entry in the specified channel. A custom message can be added to be sent with the new entry. 

`/feed delete name` - Removes a feed that was configured. If the feed was not found, then 0 feeds would be removed. Name is case senstive.

## FAQ
> Can I create my own repo without forking this repo so it can be private?

Absolutely. You're also more than welcome to fork the repo if keeping it public is not an issue.

> Can I save my bot token on the repo I made?

Only if your repo is private. Even then it's not recommended to do so. Look into loading your bot token 
as a configuration file, or as an environment variable instead.

> My bot doesn't seem to work, I made a pin but discord tells me I reached my max.

You'll need to unpin your most recent pin, and repin it for it to take affect.
This bot only works when the pins list has not reached it's max yet.

> I know my last pin reached my max pins but the bot did nothing?

Ensure your bot is online. If so, check your pin settings `/settings show`. If any channels show up as `#deleted-channel` you may have accidentally removed them by mistake, or removed the bot from vieweing the channel.

> I can see all the bot commands, but others only see `/pins`?

By defualt server owners can veiw all commands. However, a user must have both "Manage Server" and "Use Slash Commands" enabled on their role permissions enabled.

> What data is collected when using this app?

PasselJs only saves provided configuration data for each server it joins (server id, and channel ids for pins and ignorelist, and rss feeds) to a local database for persistent memory during app updates. PasselJs does not save any message or pin history. PasselJs does not communicate with any third party apps or services. When PasselJs is kicked or removed from integrations in a server, any configuration saved for that server is immediately removed.
