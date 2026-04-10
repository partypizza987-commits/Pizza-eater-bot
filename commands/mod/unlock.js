const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unlock',
  description: 'Unlock the current channel',
  usage: '%unlock',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the current channel so members can send messages again'),

  async execute(message) {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: null
    });

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔓 Channel Unlocked')
      .setDescription(`**#${message.channel.name}** has been unlocked by ${message.author}.`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null
    });

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔓 Channel Unlocked')
      .setDescription(`**#${interaction.channel.name}** has been unlocked by ${interaction.user}.`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
