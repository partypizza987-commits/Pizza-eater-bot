const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadJSON } = require('../utils/data');

function normalizeGuildConfig(rawData, guildId) {
  if (!rawData[guildId]) {
    rawData[guildId] = {};
  }

  if (!Array.isArray(rawData[guildId].staffRoleIds)) {
    if (rawData[guildId].staffRoleId) {
      rawData[guildId].staffRoleIds = [rawData[guildId].staffRoleId];
    } else {
      rawData[guildId].staffRoleIds = [];
    }
  }

  if (!Array.isArray(rawData[guildId].modRoleIds)) {
    if (rawData[guildId].modRoleId) {
      rawData[guildId].modRoleIds = [rawData[guildId].modRoleId];
    } else {
      rawData[guildId].modRoleIds = [];
    }
  }

  return rawData[guildId];
}

function hasAnyConfiguredRole(member, roleIds) {
  if (!member || !Array.isArray(roleIds)) return false;
  return roleIds.some(roleId => member.roles.cache.has(roleId));
}

function buildHelpEmbed(member, user) {
  const data = loadJSON('permissions.json');
  const guildConfig = normalizeGuildConfig(data, member.guild.id);

  const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
  const hasStaffAccess = isAdmin || hasAnyConfiguredRole(member, guildConfig.staffRoleIds);
  const hasModAccess = isAdmin || hasAnyConfiguredRole(member, guildConfig.modRoleIds);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('📖 Pizza Eater Bot Help')
    .setDescription(
      [
        '**How to use commands:**',
        '• Prefix commands start with `%`',
        '• Slash commands start with `/`',
        '',
        '**Examples:**',
        '`%help` or `/help`',
        '`%roast @user` or `/roast`',
        '`%setrole add staff @Staff` or `/setrole`',
      ].join('\n')
    )
    .setFooter({ text: `Requested by ${user.tag}` })
    .setTimestamp();

  embed.addFields({
    name: '🎉 Fun Commands (Everyone)',
    value: [
      '`%quote` or `/quote`',
      'Get an AI quote.',
      '',
      '`%joke` or `/joke`',
      'Get an AI joke.',
      '',
      '`%roast @user` or `/roast user:@user`',
      'Roast someone in a funny way.',
    ].join('\n')
  });

  embed.addFields({
    name: '⚙️ Role Setup Commands',
    value: [
      '`%setrole add staff @Role` or `/setrole`',
      'Add a staff role that can use staff commands.',
      '',
      '`%setrole add mod @Role` or `/setrole`',
      'Add a mod role that can use mod commands.',
      '',
      '`%setrole remove staff @Role` or `/setrole`',
      'Remove a staff role from the allowed list.',
      '',
      '`%setrole remove mod @Role` or `/setrole`',
      'Remove a mod role from the allowed list.',
      '',
      '`%setrole list staff` or `/setrole`',
      'Show all allowed staff roles.',
      '',
      '`%setrole list mod` or `/setrole`',
      'Show all allowed mod roles.',
    ].join('\n')
  });

  if (hasStaffAccess) {
    embed.addFields({
      name: '👔 Staff Commands',
      value: [
        '`%hire @user RoleName` or `/hire`',
        'Give a staff role to a member.',
        '',
        '`%fire @user RoleName` or `/fire`',
        'Remove a staff role from a member.',
        '',
        '`%promote @user OldRole | NewRole` or `/promote`',
        'Promote a staff member.',
        '',
        '`%degrade @user OldRole | NewRole` or `/degrade`',
        'Demote a staff member.',
        '',
        '`%break @user [reason]` or `/break`',
        'Put a staff member on break.',
        '',
        '`%endbreak @user` or `/endbreak`',
        'End a staff member break.',
        '',
        '`%breaklist` or `/breaklist`',
        'Show everyone currently on break.',
      ].join('\n')
    });
  }

  if (hasModAccess) {
    embed.addFields({
      name: '🔨 Mod Commands',
      value: [
        '`%ban @user [reason]` or `/ban`',
        'Ban a member.',
        '',
        '`%unban userID` or `/unban`',
        'Unban a member.',
        '',
        '`%kick @user [reason]` or `/kick`',
        'Kick a member.',
        '',
        '`%mute @user [reason]` or `/mute`',
        'Mute a member.',
        '',
        '`%unmute @user` or `/unmute`',
        'Unmute a member.',
        '',
        '`%timeout @user minutes [reason]` or `/timeout`',
        'Timeout a member.',
        '',
        '`%warn @user reason` or `/warn`',
        'Warn a member.',
        '',
        '`%warnings @user` or `/warnings`',
        'Show warnings for a member.',
        '',
        '`%purge amount` or `/purge`',
        'Delete messages.',
        '',
        '`%lock` or `/lock`',
        'Lock the current channel.',
        '',
        '`%unlock` or `/unlock`',
        'Unlock the current channel.',
        '',
        '`%slowmode seconds` or `/slowmode`',
        'Set channel slowmode.',
        '',
        '`%nick @user nickname` or `/nick`',
        'Change a member nickname.',
      ].join('\n')
    });
  }

  if (!hasStaffAccess && !hasModAccess) {
    embed.addFields({
      name: '💡 Access Info',
      value: 'You currently see only public commands. Ask an admin to add your role with `%setrole add staff @Role` or `%setrole add mod @Role` if needed.'
    });
  }

  return embed;
}

module.exports = {
  name: 'help',
  description: 'View all available bot commands',
  usage: '%help',
  category: 'general',
  adminOnly: false,

  slashData: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View all available bot commands'),

  async execute(message) {
    const embed = buildHelpEmbed(message.member, message.author);
    return message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const embed = buildHelpEmbed(interaction.member, interaction.user);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
