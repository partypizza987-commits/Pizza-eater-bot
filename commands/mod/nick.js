const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'nick',
  description: 'Change a member\'s nickname',
  usage: '%nick @user <new nickname>',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('nick')
    .setDescription("Change a member's nickname")
    .addUserOption(opt => opt.setName('user').setDescription('The user to rename').setRequired(true))
    .addStringOption(opt => opt.setName('nickname').setDescription('The new nickname (leave empty to reset)').setRequired(false)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%nick @user NewNickname`');

    const newNick = args.slice(1).join(' ') || null;

    try {
      const oldNick = member.displayName;
      await member.setNickname(newNick);

      const embed = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setTitle('✏️ Nickname Changed')
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          { name: 'User', value: `${member.user.tag}`, inline: true },
          { name: 'Old Nickname', value: oldNick, inline: true },
          { name: 'New Nickname', value: newNick || member.user.username, inline: true },
          { name: 'Changed By', value: `${message.author.tag}`, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch {
      message.reply('❌ I cannot change this user\'s nickname! They may have a higher role than me.');
    }
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const newNick = interaction.options.getString('nickname') || null;

    try {
      const oldNick = member.displayName;
      await member.setNickname(newNick);

      const embed = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setTitle('✏️ Nickname Changed')
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          { name: 'User', value: `${member.user.tag}`, inline: true },
          { name: 'Old Nickname', value: oldNick, inline: true },
          { name: 'New Nickname', value: newNick || member.user.username, inline: true },
          { name: 'Changed By', value: `${interaction.user.tag}`, inline: false }
        )
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch {
      interaction.reply({ content: '❌ I cannot change this user\'s nickname!', ephemeral: true });
    }
  }
};
