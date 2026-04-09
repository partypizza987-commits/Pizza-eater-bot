const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'fire',
  description: 'Fire a staff member by removing their role',
  usage: '%fire @user <RoleName>',
  category: 'staff',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('fire')
    .setDescription('Fire a staff member by removing their role')
    .addUserOption(opt => opt.setName('user').setDescription('The user to fire').setRequired(true))
    .addStringOption(opt => opt.setName('role').setDescription('The role name to remove').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for firing').setRequired(false)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user to fire! Usage: `%fire @user RoleName`');

    const remaining = args.slice(1);
    const roleName = remaining.join(' ');
    if (!roleName) return message.reply('❌ Please provide a role name to remove! Usage: `%fire @user RoleName`');

    const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (!role) return message.reply(`❌ Role **"${roleName}"** not found!`);

    if (!member.roles.cache.has(role.id)) {
      return message.reply(`❌ ${member.user.tag} does not have the **${role.name}** role!`);
    }

    await member.roles.remove(role);

    try {
      await member.send(`📢 You have been **fired** from your position as **${role.name}** in **${message.guild.name}**.`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔥 Staff Fired')
      .setDescription(`${member.user.tag} has been fired from **${role.name}**.`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Removed Role', value: `${role}`, inline: true },
        { name: 'Fired By', value: `${message.author}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const roleName = interaction.options.getString('role');

    const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (!role) return interaction.reply({ content: `❌ Role **"${roleName}"** not found!`, ephemeral: true });

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({ content: `❌ ${member.user.tag} does not have the **${role.name}** role!`, ephemeral: true });
    }

    await member.roles.remove(role);

    try {
      await member.send(`📢 You have been **fired** from your position as **${role.name}** in **${interaction.guild.name}**.`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔥 Staff Fired')
      .setDescription(`${member.user.tag} has been fired from **${role.name}**.`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Removed Role', value: `${role}`, inline: true },
        { name: 'Fired By', value: `${interaction.user}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
