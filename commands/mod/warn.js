const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadJSON, saveJSON } = require('../../utils/data');

module.exports = {
  name: 'warn',
  description: 'Warn a member and log it',
  usage: '%warn @user <reason>',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member and log it')
    .addUserOption(opt => opt.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%warn @user reason`');

    const reason = args.slice(1).join(' ');
    if (!reason) return message.reply('❌ Please provide a reason for the warning!');

    const warnings = loadJSON('warnings.json');
    if (!warnings[message.guild.id]) warnings[message.guild.id] = {};
    if (!warnings[message.guild.id][member.id]) warnings[message.guild.id][member.id] = [];

    warnings[message.guild.id][member.id].push({
      reason,
      moderator: message.author.tag,
      timestamp: Date.now()
    });
    saveJSON('warnings.json', warnings);

    const count = warnings[message.guild.id][member.id].length;

    try {
      await member.send(`⚠️ You have been **warned** in **${message.guild.name}**.\n**Reason:** ${reason}\nYou now have **${count}** warning(s).`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('⚠️ Member Warned')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Total Warnings', value: `${count}`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Warned By', value: `${message.author.tag}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    const warnings = loadJSON('warnings.json');
    if (!warnings[interaction.guild.id]) warnings[interaction.guild.id] = {};
    if (!warnings[interaction.guild.id][member.id]) warnings[interaction.guild.id][member.id] = [];

    warnings[interaction.guild.id][member.id].push({
      reason,
      moderator: interaction.user.tag,
      timestamp: Date.now()
    });
    saveJSON('warnings.json', warnings);

    const count = warnings[interaction.guild.id][member.id].length;

    try {
      await member.send(`⚠️ You have been **warned** in **${interaction.guild.name}**.\n**Reason:** ${reason}\nYou now have **${count}** warning(s).`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('⚠️ Member Warned')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Total Warnings', value: `${count}`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Warned By', value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
