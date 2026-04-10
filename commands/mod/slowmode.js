const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'slowmode',
  description: 'Set slowmode on the current channel',
  usage: '%slowmode <seconds>',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode on the current channel')
    .addIntegerOption(opt => opt.setName('seconds').setDescription('Slowmode in seconds (0 to disable)').setRequired(true).setMinValue(0).setMaxValue(21600)),

  async execute(message, args) {
    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0) return message.reply('❌ Please provide a valid number of seconds! Usage: `%slowmode 10`');

    await message.channel.setRateLimitPerUser(seconds);

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🐢 Slowmode Updated')
      .setDescription(seconds === 0 ? `Slowmode has been **disabled** in **#${message.channel.name}**.` : `Slowmode set to **${seconds} second(s)** in **#${message.channel.name}**.`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    await interaction.channel.setRateLimitPerUser(seconds);

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🐢 Slowmode Updated')
      .setDescription(seconds === 0 ? `Slowmode has been **disabled** in **#${interaction.channel.name}**.` : `Slowmode set to **${seconds} second(s)** in **#${interaction.channel.name}**.`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
