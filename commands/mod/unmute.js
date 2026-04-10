const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'Unmute a member by removing their Muted role',
  usage: '%unmute @user',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a member by removing their Muted role')
    .addUserOption(opt => opt.setName('user').setDescription('The user to unmute').setRequired(true)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%unmute @user`');

    const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
    if (!muteRole) return message.reply('❌ No **"Muted"** role found!');
    if (!member.roles.cache.has(muteRole.id)) return message.reply(`❌ ${member.user.tag} is not muted!`);

    await member.roles.remove(muteRole);

    try {
      await member.send(`🔊 You have been **unmuted** in **${message.guild.name}**. Welcome back!`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔊 Member Unmuted')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Unmuted By', value: `${message.author.tag}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

    if (!muteRole) return interaction.reply({ content: '❌ No **"Muted"** role found!', ephemeral: true });
    if (!member.roles.cache.has(muteRole.id)) return interaction.reply({ content: `❌ ${member.user.tag} is not muted!`, ephemeral: true });

    await member.roles.remove(muteRole);

    try {
      await member.send(`🔊 You have been **unmuted** in **${interaction.guild.name}**. Welcome back!`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔊 Member Unmuted')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Unmuted By', value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
