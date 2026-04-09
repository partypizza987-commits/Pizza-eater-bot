const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'promote',
  description: 'Promote a staff member to a higher role',
  usage: '%promote @user <OldRole> <NewRole>',
  category: 'staff',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promote a staff member to a higher role')
    .addUserOption(opt => opt.setName('user').setDescription('The user to promote').setRequired(true))
    .addStringOption(opt => opt.setName('oldrole').setDescription('Their current role to remove').setRequired(true))
    .addStringOption(opt => opt.setName('newrole').setDescription('The new higher role to give').setRequired(true)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%promote @user OldRole | NewRole`');

    const rest = args.slice(1).join(' ');
    const parts = rest.split('|');
    if (parts.length < 2) return message.reply('❌ Usage: `%promote @user OldRole | NewRole`');

    const oldRoleName = parts[0].trim();
    const newRoleName = parts[1].trim();

    const oldRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === oldRoleName.toLowerCase());
    const newRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === newRoleName.toLowerCase());

    if (!oldRole) return message.reply(`❌ Old role **"${oldRoleName}"** not found!`);
    if (!newRole) return message.reply(`❌ New role **"${newRoleName}"** not found!`);

    if (!member.roles.cache.has(oldRole.id)) {
      return message.reply(`❌ ${member.user.tag} doesn't have the **${oldRole.name}** role!`);
    }

    await member.roles.remove(oldRole);
    await member.roles.add(newRole);

    try {
      await member.send(`🎉 Congratulations! You have been **promoted** from **${oldRole.name}** to **${newRole.name}** in **${message.guild.name}**!`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('⬆️ Staff Promoted')
      .setDescription(`${member.user.tag} has been promoted!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Old Role', value: `${oldRole}`, inline: true },
        { name: 'New Role', value: `${newRole}`, inline: true },
        { name: 'Promoted By', value: `${message.author}`, inline: false }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const oldRoleName = interaction.options.getString('oldrole');
    const newRoleName = interaction.options.getString('newrole');

    const oldRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === oldRoleName.toLowerCase());
    const newRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === newRoleName.toLowerCase());

    if (!oldRole) return interaction.reply({ content: `❌ Old role **"${oldRoleName}"** not found!`, ephemeral: true });
    if (!newRole) return interaction.reply({ content: `❌ New role **"${newRoleName}"** not found!`, ephemeral: true });

    if (!member.roles.cache.has(oldRole.id)) {
      return interaction.reply({ content: `❌ ${member.user.tag} doesn't have the **${oldRole.name}** role!`, ephemeral: true });
    }

    await member.roles.remove(oldRole);
    await member.roles.add(newRole);

    try {
      await member.send(`🎉 Congratulations! You have been **promoted** from **${oldRole.name}** to **${newRole.name}** in **${interaction.guild.name}**!`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('⬆️ Staff Promoted')
      .setDescription(`${member.user.tag} has been promoted!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Old Role', value: `${oldRole}`, inline: true },
        { name: 'New Role', value: `${newRole}`, inline: true },
        { name: 'Promoted By', value: `${interaction.user}`, inline: false }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
