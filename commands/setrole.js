const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadJSON, saveJSON } = require('../utils/data');

module.exports = {
  name: 'setrole',
  description: 'Set which role can use staff or mod commands',
  usage: '%setrole <staff|mod> @role',
  category: 'general',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('setrole')
    .setDescription('Set which role can use staff or mod commands')
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
        .setDescription('Role that can use this category')
        .setRequired(true)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Only administrators can use this command.');
    }

    const category = args[0]?.toLowerCase();
    if (!category || !['staff', 'mod'].includes(category)) {
      return message.reply('❌ Usage: `%setrole <staff|mod> @role`');
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply('❌ Please mention a role. Example: `%setrole mod @Moderator`');
    }

    const data = loadJSON('permissions.json');

    if (!data[message.guild.id]) {
      data[message.guild.id] = {};
    }

    if (category === 'mod') {
      data[message.guild.id].modRoleId = role.id;
    }

    if (category === 'staff') {
      data[message.guild.id].staffRoleId = role.id;
    }

    saveJSON('permissions.json', data);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Role Permission Updated')
      .setDescription(`${role} can now use **${category}** commands.`)
      .addFields(
        { name: 'Category', value: category, inline: true },
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Set By', value: `${message.author}`, inline: true }
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Only administrators can use this command.',
        ephemeral: true
      });
    }

    const category = interaction.options.getString('category');
    const role = interaction.options.getRole('role');

    const data = loadJSON('permissions.json');

    if (!data[interaction.guild.id]) {
      data[interaction.guild.id] = {};
    }

    if (category === 'mod') {
      data[interaction.guild.id].modRoleId = role.id;
    }

    if (category === 'staff') {
      data[interaction.guild.id].staffRoleId = role.id;
    }

    saveJSON('permissions.json', data);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Role Permission Updated')
      .setDescription(`${role} can now use **${category}** commands.`)
      .addFields(
        { name: 'Category', value: category, inline: true },
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Set By', value: `${interaction.user}`, inline: true }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
