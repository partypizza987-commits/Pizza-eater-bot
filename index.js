const { Client, GatewayIntentBits, Collection, Events, REST, Routes, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { loadJSON } = require('./utils/data');

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

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    client.commands.set(command.name, command);

    if (command.slashData) {
      allSlashCommands.push(command.slashData.toJSON());
    }
  }
}

const helpCommand = require('./commands/help');
client.commands.set(helpCommand.name, helpCommand);
if (helpCommand.slashData) {
  allSlashCommands.push(helpCommand.slashData.toJSON());
}

const setroleCommand = require('./commands/setrole');
client.commands.set(setroleCommand.name, setroleCommand);
if (setroleCommand.slashData) {
  allSlashCommands.push(setroleCommand.slashData.toJSON());
}

function hasCommandAccess(member, command) {
  if (!member || !command) return false;

  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  if (command.category === 'fun' || command.category === 'general') {
    return true;
  }

  const data = loadJSON('permissions.json');
  const guildConfig = data[member.guild.id] || {};

  if (command.category === 'mod') {
    if (!guildConfig.modRoleId) return false;
    return member.roles.cache.has(guildConfig.modRoleId);
  }

  if (command.category === 'staff') {
    if (!guildConfig.staffRoleId) return false;
    return member.roles.cache.has(guildConfig.staffRoleId);
  }

  return true;
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
    await rest.put(Routes.applicationCommands(c.user.id), { body: allSlashCommands });
    console.log(`✅ Registered ${allSlashCommands.length} slash commands globally.`);
    console.log('✅ Loaded commands:', [...client.commands.keys()].join(', '));
  } catch (err) {
    console.error('❌ Failed to register slash commands:', err);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  if (!hasCommandAccess(interaction.member, command)) {
    return interaction.reply({
      content: '❌ You do not have permission to use this command.',
      ephemeral: true
    });
  }

  try {
    await command.executeSlash(interaction, client);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command.',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command.',
        ephemeral: true
      });
    }
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  if (!hasCommandAccess(message.member, command)) {
    return message.reply('❌ You do not have permission to use this command.');
  }

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    await message.reply('There was an error while executing that command.');
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
