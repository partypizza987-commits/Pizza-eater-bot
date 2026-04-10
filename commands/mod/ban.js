const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a member from the server',
  usage: '%ban @user <reason>',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(opt => opt.setName('user').setDescription('The user to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban').setRequired(false)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%ban @user reason`');
    if (!member.bannable) return message.reply('❌ I cannot ban this user! They may have a higher role than me.');

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.send(`🔨 You have been **banned** from **${message.guild.name}**.\n**Reason:** ${reason}`);
    } catch {}

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔨 Member Banned')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Banned By', value: `${message.author.tag}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member.bannable) return interaction.reply({ content: '❌ I cannot ban this user!', ephemeral: true });

    try {
      await member.send(`🔨 You have been **banned** from **${interaction.guild.name}**.\n**Reason:** ${reason}`);
    } catch {}

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔨 Member Banned')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Banned By', value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
