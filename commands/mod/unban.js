const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Unban a user from the server',
  usage: '%unban <userID>',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server by their ID')
    .addStringOption(opt => opt.setName('userid').setDescription('The user ID to unban').setRequired(true)),

  async execute(message, args) {
    const userId = args[0];
    if (!userId) return message.reply('❌ Please provide a user ID! Usage: `%unban userID`');

    try {
      const bannedUser = await message.guild.bans.fetch(userId);
      await message.guild.members.unban(userId);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Member Unbanned')
        .addFields(
          { name: 'User', value: `${bannedUser.user.tag}`, inline: true },
          { name: 'Unbanned By', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch {
      message.reply('❌ Could not unban that user. Make sure the ID is correct and they are banned!');
    }
  },

  async executeSlash(interaction) {
    const userId = interaction.options.getString('userid');

    try {
      const bannedUser = await interaction.guild.bans.fetch(userId);
      await interaction.guild.members.unban(userId);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Member Unbanned')
        .addFields(
          { name: 'User', value: `${bannedUser.user.tag}`, inline: true },
          { name: 'Unbanned By', value: `${interaction.user.tag}`, inline: true }
        )
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch {
      interaction.reply({ content: '❌ Could not unban that user. Make sure the ID is correct and they are banned!', ephemeral: true });
    }
  }
};
