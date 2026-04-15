const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadJSON, saveJSON } = require('../utils/data');

function normalizeGuildData(data, guildId) {
  if (!data[guildId]) {
    data[guildId] = {};
  }

  if (!Array.isArray(data[guildId].staffRoleIds)) {
    if (data[guildId].staffRoleId) {
      data[guildId].staffRoleIds = [data[guildId].staffRoleId];
    } else {
      data[guildId].staffRoleIds = [];
    }
  }

  if (!Array.isArray(data[guildId].modRoleIds)) {
    if (data[guildId].modRoleId) {
      data[guildId].modRoleIds = [data[guildId].modRoleId];
    } else {
      data[guildId].modRoleIds = [];
    }
  }

  delete data[guildId].staffRoleId;
  delete data[guildId].modRoleId;

  return data[guildId];
}

function getRoleArray(guildConfig, category) {
  return category === 'staff' ? guildConfig.staffRoleIds : guildConfig.modRoleIds;
}

module.exports = {
  name: 'setrole',
  description: 'Add, remove, or list roles allowed to use staff or mod commands',
  usage: '%setrole <add|remove|list> <staff|mod> [@role]',
  category: 'general',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('setrole')
    .setDescription('Add, remove, or list allowed roles for staff or mod commands')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('What do you want to do?')
        .setRequired(true)
        .addChoices(
          { name: 'add', value: 'add' },
          { name: 'remove', value: 'remove' },
          { name: 'list', value: 'list' }
        )
    )
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Choose which category to configure')
        .setRequired(true)
        .addChoices(
          { name: 'staff', value: 'staff' },
          { name: 'mod', value: 'mod' }
        )
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Role to add or remove')
        .setRequired(false)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Only administrators can use this command.');
    }

    const action = args[0]?.toLowerCase();
    const category = args[1]?.toLowerCase();

    if (!['add', 'remove', 'list'].includes(action)) {
      return message.reply('❌ Usage: `%setrole <add|remove|list> <staff|mod> [@role]`');
    }

    if (!['staff', 'mod'].includes(category)) {
      return message.reply('❌ Category must be `staff` or `mod`.');
    }

    const data = loadJSON('permissions.json');
    const guildConfig = normalizeGuildData(data, message.guild.id);
    const roleArray = getRoleArray(guildConfig, category);

    if (action === 'list') {
      const roleMentions = roleArray.length
        ? roleArray
            .map(roleId => {
              const role = message.guild.roles.cache.get(roleId);
              return role ? `${role}` : `⚠️ Deleted Role (${roleId})`;
            })
            .join('\n')
        : 'No roles set yet.';

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📋 ${category.toUpperCase()} Role List`)
        .setDescription(roleMentions)
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply('❌ Please mention a role. Example: `%setrole add staff @Staff`');
    }

    if (action === 'add') {
      if (roleArray.includes(role.id)) {
        return message.reply(`❌ ${role} is already in the **${category}** role list.`);
      }

      roleArray.push(role.id);
      saveJSON('permissions.json', data);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Role Added')
        .setDescription(`${role} can now use **${category}** commands.`)
        .addFields(
          { name: 'Action', value: 'Add', inline: true },
          { name: 'Category', value: category, inline: true },
          { name: 'Total Roles', value: `${roleArray.length}`, inline: true }
        )
        .setFooter({ text: `Set by ${message.author.tag}` })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (action === 'remove') {
      if (!roleArray.includes(role.id)) {
        return message.reply(`❌ ${role} is not in the **${category}** role list.`);
      }

      guildConfig[category === 'staff' ? 'staffRoleIds' : 'modRoleIds'] = roleArray.filter(id => id !== role.id);
      saveJSON('permissions.json', data);

      const updatedArray = getRoleArray(guildConfig, category);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('✅ Role Removed')
        .setDescription(`${role} can no longer use **${category}** commands.`)
        .addFields(
          { name: 'Action', value: 'Remove', inline: true },
          { name: 'Category', value: category, inline: true },
          { name: 'Remaining Roles', value: `${updatedArray.length}`, inline: true }
        )
        .setFooter({ text: `Set by ${message.author.tag}` })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }
  },

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Only administrators can use this command.',
        ephemeral: true
      });
    }

    const action = interaction.options.getString('action');
    const category = interaction.options.getString('category');
    const role = interaction.options.getRole('role');

    const data = loadJSON('permissions.json');
    const guildConfig = normalizeGuildData(data, interaction.guild.id);
    const roleArray = getRoleArray(guildConfig, category);

    if (action === 'list') {
      const roleMentions = roleArray.length
        ? roleArray
            .map(roleId => {
              const guildRole = interaction.guild.roles.cache.get(roleId);
              return guildRole ? `${guildRole}` : `⚠️ Deleted Role (${roleId})`;
            })
            .join('\n')
        : 'No roles set yet.';

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📋 ${category.toUpperCase()} Role List`)
        .setDescription(roleMentions)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    if (!role) {
      return interaction.reply({
        content: '❌ You must choose a role for add/remove.',
        ephemeral: true
      });
    }

    if (action === 'add') {
      if (roleArray.includes(role.id)) {
        return interaction.reply({
          content: `❌ ${role} is already in the **${category}** role list.`,
          ephemeral: true
        });
      }

      roleArray.push(role.id);
      saveJSON('permissions.json', data);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Role Added')
        .setDescription(`${role} can now use **${category}** commands.`)
        .addFields(
          { name: 'Action', value: 'Add', inline: true },
          { name: 'Category', value: category, inline: true },
          { name: 'Total Roles', value: `${roleArray.length}`, inline: true }
        )
        .setFooter({ text: `Set by ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    if (action === 'remove') {
      if (!roleArray.includes(role.id)) {
        return interaction.reply({
          content: `❌ ${role} is not in the **${category}** role list.`,
          ephemeral: true
        });
      }

      guildConfig[category === 'staff' ? 'staffRoleIds' : 'modRoleIds'] = roleArray.filter(id => id !== role.id);
      saveJSON('permissions.json', data);

      const updatedArray = getRoleArray(guildConfig, category);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('✅ Role Removed')
        .setDescription(`${role} can no longer use **${category}** commands.`)
        .addFields(
          { name: 'Action', value: 'Remove', inline: true },
          { name: 'Category', value: category, inline: true },
          { name: 'Remaining Roles', value: `${updatedArray.length}`, inline: true }
        )
        .setFooter({ text: `Set by ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
  }
};
