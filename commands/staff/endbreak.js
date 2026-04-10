const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadJSON, saveJSON } = require('../../utils/data');

module.exports = {
  name: 'endbreak',
  description: 'End a staff member\'s break',
  usage: '%endbreak @user',
  category: 'staff',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('endbreak')
    .setDescription('End a staff member\'s break')
    .addUserOption(opt => opt.setName('user').setDescription('The staff member whose break to end').setRequired(true)),

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user! Usage: `%endbreak @user`');

    const breaks = loadJSON('breaks.json');
    if (!breaks[message.guild.id] || !breaks[message.guild.id][member.id]) {
      return message.reply(`❌ ${member.user.tag} is not currently on break!`);
    }

    const breakData = breaks[message.guild.id][member.id];
    const duration = Math.floor((Date.now() - breakData.startTime) / 60000);

    delete breaks[message.guild.id][member.id];
    saveJSON('breaks.json', breaks);

    const onBreakRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'on break');
    if (onBreakRole && member.roles.cache.has(onBreakRole.id)) {
      try { await member.roles.remove(onBreakRole); } catch {}
    }

    try {
      await member.send(`✅ Your break in **${message.guild.name}** has ended. Welcome back!`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Break Ended')
      .setDescription(`${member.user.tag}'s break has ended. Welcome back!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Break Duration', value: `${duration} minute(s)`, inline: true },
        { name: 'Ended By', value: `${message.author}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const breaks = loadJSON('breaks.json');

    if (!breaks[interaction.guild.id] || !breaks[interaction.guild.id][member.id]) {
      return interaction.reply({ content: `❌ ${member.user.tag} is not currently on break!`, ephemeral: true });
    }

    const breakData = breaks[interaction.guild.id][member.id];
    const duration = Math.floor((Date.now() - breakData.startTime) / 60000);

    delete breaks[interaction.guild.id][member.id];
    saveJSON('breaks.json', breaks);

    const onBreakRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'on break');
    if (onBreakRole && member.roles.cache.has(onBreakRole.id)) {
      try { await member.roles.remove(onBreakRole); } catch {}
    }

    try {
      await member.send(`✅ Your break in **${interaction.guild.name}** has ended. Welcome back!`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Break Ended')
      .setDescription(`${member.user.tag}'s break has ended. Welcome back!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Break Duration', value: `${duration} minute(s)`, inline: true },
        { name: 'Ended By', value: `${interaction.user}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
