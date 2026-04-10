const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'mute',
  description: 'Mute a member by giving them the Muted role',
  usage: '%mute @user',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member by giving them the Muted role')
    .addUserOption(opt => opt.setName('user').setDescription('The user to mute').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for muting').setRequired(false)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%mute @user`');

    const reason = args.slice(1).join(' ') || 'No reason provided';
    const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
    if (!muteRole) return message.reply('❌ No **"Muted"** role found! Please create a role named **Muted** in your server.');

    if (member.roles.cache.has(muteRole.id)) return message.reply(`❌ ${member.user.tag} is already muted!`);

    await member.roles.add(muteRole);

    try {
      await member.send(`🔇 You have been **muted** in **${message.guild.name}**.\n**Reason:** ${reason}`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0x95a5a6)
      .setTitle('🔇 Member Muted')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Muted By', value: `${message.author.tag}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
    if (!muteRole) return interaction.reply({ content: '❌ No **"Muted"** role found! Please create a role named **Muted**.', ephemeral: true });

    if (member.roles.cache.has(muteRole.id)) return interaction.reply({ content: `❌ ${member.user.tag} is already muted!`, ephemeral: true });

    await member.roles.add(muteRole);

    try {
      await member.send(`🔇 You have been **muted** in **${interaction.guild.name}**.\n**Reason:** ${reason}`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0x95a5a6)
      .setTitle('🔇 Member Muted')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Muted By', value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
