const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'timeout',
  description: 'Timeout a member for a set number of minutes',
  usage: '%timeout @user <minutes> <reason>',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member for a set number of minutes')
    .addUserOption(opt => opt.setName('user').setDescription('The user to timeout').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the timeout').setRequired(false)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%timeout @user minutes reason`');

    const minutes = parseInt(args[1]);
    if (isNaN(minutes) || minutes < 1) return message.reply('❌ Please provide a valid number of minutes!');

    const reason = args.slice(2).join(' ') || 'No reason provided';
    const ms = minutes * 60 * 1000;

    try {
      await member.timeout(ms, reason);
    } catch {
      return message.reply('❌ I could not timeout this user! They may have a higher role than me.');
    }

    try {
      await member.send(`⏱️ You have been **timed out** in **${message.guild.name}** for **${minutes} minute(s)**.\n**Reason:** ${reason}`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('⏱️ Member Timed Out')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Duration', value: `${minutes} minute(s)`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Timed Out By', value: `${message.author.tag}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const ms = minutes * 60 * 1000;

    try {
      await member.timeout(ms, reason);
    } catch {
      return interaction.reply({ content: '❌ I could not timeout this user!', ephemeral: true });
    }

    try {
      await member.send(`⏱️ You have been **timed out** in **${interaction.guild.name}** for **${minutes} minute(s)**.\n**Reason:** ${reason}`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('⏱️ Member Timed Out')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Duration', value: `${minutes} minute(s)`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Timed Out By', value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
