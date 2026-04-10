const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadJSON } = require('../../utils/data');

module.exports = {
  name: 'breaklist',
  description: 'View all staff currently on break',
  usage: '%breaklist',
  category: 'staff',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('breaklist')
    .setDescription('View all staff currently on break'),

  async execute(message) {
    const breaks = loadJSON('breaks.json');
    const guildBreaks = breaks[message.guild.id] || {};
    const entries = Object.values(guildBreaks);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('☕ Staff Currently On Break')
      .setTimestamp();

    if (entries.length === 0) {
      embed.setDescription('No staff members are currently on break.');
    } else {
      const lines = entries.map(b => {
        const duration = Math.floor((Date.now() - b.startTime) / 60000);
        return `• **${b.username}** — ${duration} min(s)\n  Reason: ${b.reason}`;
      });
      embed.setDescription(lines.join('\n\n'));
      embed.setFooter({ text: `${entries.length} staff on break` });
    }

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const breaks = loadJSON('breaks.json');
    const guildBreaks = breaks[interaction.guild.id] || {};
    const entries = Object.values(guildBreaks);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('☕ Staff Currently On Break')
      .setTimestamp();

    if (entries.length === 0) {
      embed.setDescription('No staff members are currently on break.');
    } else {
      const lines = entries.map(b => {
        const duration = Math.floor((Date.now() - b.startTime) / 60000);
        return `• **${b.username}** — ${duration} min(s)\n  Reason: ${b.reason}`;
      });
      embed.setDescription(lines.join('\n\n'));
      embed.setFooter({ text: `${entries.length} staff on break` });
    }

    interaction.reply({ embeds: [embed] });
  }
};
