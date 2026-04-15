const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadJSON, saveJSON } = require('../../utils/data');

module.exports = {
  name: 'break',
  description: 'Put a staff member on break',
  usage: '%break @user [reason]',
  category: 'staff',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('break')
    .setDescription('Put a staff member on break')
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription('The staff member to put on break')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('reason')
        .setDescription('Reason for the break')
        .setRequired(false)
    ),

  async execute(message, args) {
    const member = message.mentions.members.first();

    if (!member) {
      return message.reply('❌ Please mention a user! Usage: `%break @user [reason]`');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const breaks = loadJSON('breaks.json');

    if (!breaks[message.guild.id]) {
      breaks[message.guild.id] = {};
    }

    if (breaks[message.guild.id][member.id]) {
      return message.reply(`❌ ${member.user.tag} is already on break!`);
    }

    breaks[message.guild.id][member.id] = {
      userId: member.id,
      username: member.user.tag,
      reason,
      startTime: Date.now()
    };

    saveJSON('breaks.json', breaks);

    const onBreakRole = message.guild.roles.cache.find(
      r => r.name.toLowerCase() === 'on break'
    );

    if (onBreakRole && !member.roles.cache.has(onBreakRole.id)) {
      try {
        await member.roles.add(onBreakRole);
      } catch (err) {
        console.error('Failed to add On Break role:', err);
      }
    }

    try {
      await member.send(`☕ You have been put on break in **${message.guild.name}**.\n**Reason:** ${reason}`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('☕ Staff Put On Break')
      .setDescription(`${member.user.tag} is now on break.`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Set By', value: `${message.author}`, inline: true }
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply({
        content: '❌ I could not find that user in this server.',
        ephemeral: true
      });
    }

    const breaks = loadJSON('breaks.json');

    if (!breaks[interaction.guild.id]) {
      breaks[interaction.guild.id] = {};
    }

    if (breaks[interaction.guild.id][member.id]) {
      return interaction.reply({
        content: `❌ ${member.user.tag} is already on break!`,
        ephemeral: true
      });
    }

    breaks[interaction.guild.id][member.id] = {
      userId: member.id,
      username: member.user.tag,
      reason,
      startTime: Date.now()
    };

    saveJSON('breaks.json', breaks);

    const onBreakRole = interaction.guild.roles.cache.find(
      r => r.name.toLowerCase() === 'on break'
    );

    if (onBreakRole && !member.roles.cache.has(onBreakRole.id)) {
      try {
        await member.roles.add(onBreakRole);
      } catch (err) {
        console.error('Failed to add On Break role:', err);
      }
    }

    try {
      await member.send(`☕ You have been put on break in **${interaction.guild.name}**.\n**Reason:** ${reason}`);
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('☕ Staff Put On Break')
      .setDescription(`${member.user.tag} is now on break.`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Set By', value: `${interaction.user}`, inline: true }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
