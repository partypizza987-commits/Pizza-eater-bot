const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick a member from the server',
  usage: '%kick @user <reason>',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(opt => opt.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick').setRequired(false)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%kick @user reason`');
    if (!member.kickable) return message.reply('❌ I cannot kick this user! They may have a higher role than me.');

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.send(`👢 You have been **kicked** from **${message.guild.name}**.\n**Reason:** ${reason}`);
    } catch {}

    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('👢 Member Kicked')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Kicked By', value: `${message.author.tag}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member.kickable) return interaction.reply({ content: '❌ I cannot kick this user!', ephemeral: true });

    try {
      await member.send(`👢 You have been **kicked** from **${interaction.guild.name}**.\n**Reason:** ${reason}`);
    } catch {}

    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('👢 Member Kicked')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Kicked By', value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
