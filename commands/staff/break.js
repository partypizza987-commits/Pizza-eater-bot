const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'hire',
  description: 'Hire a staff member by giving them a role',
  usage: '%hire @user <RoleName>',
  category: 'staff',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('hire')
    .setDescription('Hire a staff member by giving them a role')
    .addUserOption(opt => opt.setName('user').setDescription('The user to hire').setRequired(true))
    .addStringOption(opt => opt.setName('role').setDescription('The role name to give them').setRequired(true)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user to hire! Usage: `%hire @user RoleName`');

    const roleName = args.slice(1).join(' ');
    if (!roleName) return message.reply('❌ Please provide a role name! Usage: `%hire @user RoleName`');

    const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (!role) return message.reply(`❌ Role **"${roleName}"** not found! Make sure the role exists in the server.`);

    if (member.roles.cache.has(role.id)) {
      return message.reply(`❌ ${member.user.tag} already has the **${role.name}** role!`);
    }

    await member.roles.add(role);

    try {
      await member.send(`🎉 Congratulations! You have been **hired** as **${role.name}** in **${message.guild.name}**!`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Staff Hired')
      .setDescription(`${member.user.tag} has been hired as **${role.name}**!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Hired By', value: `${message.author}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const roleName = interaction.options.getString('role');

    const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (!role) return interaction.reply({ content: `❌ Role **"${roleName}"** not found! Make sure the role exists.`, ephemeral: true });

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ content: `❌ ${member.user.tag} already has the **${role.name}** role!`, ephemeral: true });
    }

    await member.roles.add(role);

    try {
      await member.send(`🎉 Congratulations! You have been **hired** as **${role.name}** in **${interaction.guild.name}**!`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Staff Hired')
      .setDescription(`${member.user.tag} has been hired as **${role.name}**!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Hired By', value: `${interaction.user}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
