const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ]
});

const PREFIX = '%';
client.commands = new Collection();

const commandFolders = ['staff', 'mod', 'fun'];
const allSlashCommands = [];

for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(folderPath)) continue;
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    client.commands.set(command.name, command);
    if (command.slashData) allSlashCommands.push(command.slashData.toJSON());
  }
}

const helpCommand = require('./commands/help');
client.commands.set(helpCommand.name, helpCommand);
if (helpCommand.slashData) allSlashCommands.push(helpCommand.slashData.toJSON());

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);

  try {
    const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);
    await rest.put(Routes.applicationCommands(c.user.id), { body: allSlashCommands });
    console.log(`✅ Registered ${allSlashCommands.length} slash commands globally.`);
  } catch (err) {
    console.error('❌ Failed to register slash commands:', err);
