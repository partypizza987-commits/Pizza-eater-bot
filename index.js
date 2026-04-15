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
      allSlashCommands.push({
        name: command.name,
        data: command.slashData.toJSON()
      });
    }
  }
}

const helpCommand = require('./commands/help');
client.commands.set(helpCommand.name, helpCommand);
if (helpCommand.slashData) {
  allSlashCommands.push({
    name: helpCommand.name,
    data: helpCommand.slashData.toJSON()
  });
}

const setroleCommand = require('./commands/setrole');
client.commands.set(setroleCommand.name, setroleCommand);
if (setroleCommand.slashData) {
  allSlashCommands.push({
    name: setroleCommand.name,
    data: setroleCommand.slashData.toJSON()
  });
}

function normalizeGuildConfig(rawData, guildId) {
  if (!rawData[guildId]) {
    rawData[guildId] = {};
  }

  if (!Array.isArray(rawData[guildId].staffRoleIds)) {
    if (rawData[guildId].staffRoleId) {
      rawData[guildId].staffRoleIds = [rawData[guildId].staffRoleId];
    } else {
      rawData[guildId].staffRoleIds = [];
    }
  }

  if (!Array.isArray(rawData[guildId].modRoleIds)) {
    if (rawData[guildId].modRoleId) {
      rawData[guildId].modRoleIds = [rawData[guildId].modRoleId];
    } else {
      rawData[guildId].modRoleIds = [];
    }
  }

  return rawData[guildId];
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
  const guildConfig = normalizeGuildConfig(data, member.guild.id);

  if (command.category === 'mod') {
    return guildConfig.modRoleIds.some(roleId => member.roles.cache.has(roleId));
  }

  if (command.category === 'staff') {
    return guildConfig.staffRoleIds.some(roleId => member.roles.cache.has(roleId));
  }

  return true;
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  console.log(`✅ Loaded commands: ${[...client.commands.keys()].join(', ')}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  for (const cmd of allSlashCommands) {
    try {
      console.log(`⏳ Registering slash command: ${cmd.name}`);
      await rest.post(
        Routes.applicationCommands(c.user.id),
        { body: cmd.data }
      );
      console.log(`✅ Registered slash command: ${cmd.name}`);
    } catch (err) {
      console.error(`❌ Failed to register slash command: ${cmd.name}`);
      console.error(JSON.stringify(err.rawError || err, null, 2));
    }
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
  const commandName = args.shift()?.toLowerCase();

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
