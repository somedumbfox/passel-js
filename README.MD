# About
This is a bot port of [Passel Bot Public](https://github.com/stoir/passel_public) to use discords official bot api ([discord.js](https://discord.js/))
I did this mainly because I was bored and some users that wanted to host passel public wanted a discord js version. 

## Requirments
Nodejs is required to be install on your machine before running this bot.

### For windows/Mac:
Download and install [nodejs](https://nodejs.org/en/download/) (version >= 18.0.0)

### For Linux:
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

## Configure your bots files
The files you will need to edit are:
- `app.js`
- `deploy-commands.js`

### app.js Configuration
Find the line:
`/**---------------------------------------Start Configuration------------------------------------------------------------**/`

For each item, you'll need to set it accordingly.

- `token`: Set this variable as your discord bot token. If you're not sure, it is the alpha numeric token that looks a bit like this: `MTAxNTEwNjcwMDg0MTMyNDU5NQ.G3QeDO.i2aHpO1buLSh_RSxRkKxPFwMTvghYoKW7IjwBM` 
- `pinsChannel`: This is the Channel ID of the channel you want pins to be archived in. In discord with developer mode enabled, right click the channel you want to use and select Copy ID. Paste that ID for this variable as a string.
- `blacklistedChannels`: Using the same process for Pins Channel, paste any Channel Ids that should be black listed from archiving (IE: your mod only channels)
- `lastPinArchive`: `true/false`. True - the oldest pin is archived. False - the newest pin is archived
- `sendAll`: `true/false`. True - All pins are purged when the max pins limit is reached (50). False - Only 1 pin is archived when the max pin limit is reached.

### deploy-commands.js Configuration
Find the line:
`/**---------------------------------------Start Configuration------------------------------------------------------------**/`

For each item, you'll need to set it according.
- `clientId`: This is your appliactionId. Paste that ID within the quotes.
- `guildId`: This is your server Id. With developer mode enabled, right click your server icon, and select Copy ID. Paste that ID in the quotes for guildId.
- `token`: This is your bot token. Paste that token within the quotes.

## Installation
Open terminal and change your directory to the `src` folder.

`npm install`

## Register your bot slash commands
With the terminal still open on `src`

`npm run register`

This command only needs to be run once after configuration. If you add more commands, or make any 
changes to the command names, you'll need to run this script again.

## Running locally
While in the `src` folder on your terminal

`npm start`

## Deployment
I don't know yet, heroku free dynos are a thing of the past and many free hosts do not allow apps 
to run 24 consecutive hours and will require a manual start whenever it is shut down. In due time, if I find anything 
out, this will likely have to be run locally on a personal machine.

This read me will be updated if a viable host is found, but more than likely, will need to be deployed on a
paid host.

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

Ensure your bot is online. If so, check the channel id you pasted for `pinsChannel` is 
correct and not assigned as a `number`, but as a `'string'`. Also, check to make sure the 
channel in question is not listed in the `blacklistedChannels` array.
