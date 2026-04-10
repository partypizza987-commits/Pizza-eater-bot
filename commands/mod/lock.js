const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'lock',
  description: 'Lock the current channel so nobody can send messages',
  usage: '%lock',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the current channel so nobody can send messages'),

  async execute(message) {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false
    });

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔒 Channel Locked')
      .setDescription(`**#${message.channel.name}** has been locked by ${message.author}.`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    });

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔒 Channel Locked')
      .setDescription(`**#${interaction.channel.name}** has been locked by ${interaction.user}.`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
