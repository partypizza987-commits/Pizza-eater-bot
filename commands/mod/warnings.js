const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadJSON } = require('../../utils/data');

module.exports = {
  name: 'warnings',
  description: 'View all warnings for a user',
  usage: '%warnings @user',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View all warnings for a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to check warnings for').setRequired(true)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%warnings @user`');

    const warnings = loadJSON('warnings.json');
    const userWarnings = warnings[message.guild.id]?.[member.id] || [];

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`⚠️ Warnings for ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    if (userWarnings.length === 0) {
      embed.setDescription('This user has no warnings. Clean record! ✅');
    } else {
      const lines = userWarnings.map((w, i) => {
        const date = new Date(w.timestamp).toLocaleDateString();
        return `**${i + 1}.** ${w.reason}\n   › By: ${w.moderator} on ${date}`;
      });
      embed.setDescription(lines.join('\n\n'));
      embed.setFooter({ text: `Total warnings: ${userWarnings.length}` });
    }

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const warnings = loadJSON('warnings.json');
    const userWarnings = warnings[interaction.guild.id]?.[member.id] || [];

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`⚠️ Warnings for ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    if (userWarnings.length === 0) {
      embed.setDescription('This user has no warnings. Clean record! ✅');
    } else {
      const lines = userWarnings.map((w, i) => {
        const date = new Date(w.timestamp).toLocaleDateString();
        return `**${i + 1}.** ${w.reason}\n   › By: ${w.moderator} on ${date}`;
      });
      embed.setDescription(lines.join('\n\n'));
      embed.setFooter({ text: `Total warnings: ${userWarnings.length}` });
    }

    interaction.reply({ embeds: [embed] });
  }
};
