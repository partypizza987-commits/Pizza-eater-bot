const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'View available commands',
  usage: '%help',
  category: 'general',
  adminOnly: false,

  slashData: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View available commands'),

  async execute(message) {
    const isAdmin = message.member?.permissions.has('Administrator');
    const embed = buildHelpEmbed(isAdmin, message.author);
    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const isAdmin = interaction.member?.permissions.has('Administrator');
    const embed = buildHelpEmbed(isAdmin, interaction.user);
    interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

function buildHelpEmbed(isAdmin, user) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('📖 Bot Commands')
    .setFooter({ text: `Requested by ${user.tag} • Use % or / prefix` })
    .setTimestamp();

  if (isAdmin) {
    embed.setDescription('You have **admin access**. Here are all available commands:');

    embed.addFields(
      {
        name: '👔 Staff Management (Admin Only)',
        value: [
          '`%hire @user RoleName` — Hire a staff member',
          '`%fire @user RoleName` — Fire a staff member',
          '`%promote @user OldRole | NewRole` — Promote to higher role',
          '`%degrade @user OldRole | NewRole` — Demote to lower role',
          '`%break @user [reason]` — Put staff on break',
          '`%endbreak @user` — End a staff break',
          '`%breaklist` — View all staff on break',
        ].join('\n')
      },
      {
        name: '🔨 Moderation (Admin Only)',
        value: [
          '`%ban @user [reason]` — Ban a member',
          '`%unban <userID>` — Unban a member',
          '`%kick @user [reason]` — Kick a member',
          '`%mute @user [reason]` — Mute a member',
          '`%unmute @user` — Unmute a member',
          '`%timeout @user <mins> [reason]` — Timeout a member',
          '`%warn @user <reason>` — Warn a member',
          '`%warnings @user` — View a user\'s warnings',
          '`%purge <amount>` — Delete messages (1-100)',
          '`%lock` — Lock current channel',
          '`%unlock` — Unlock current channel',
          '`%slowmode <seconds>` — Set channel slowmode',
          '`%nick @user [nickname]` — Change a user\'s nickname',
        ].join('\n')
      },
      {
        name: '🎉 Fun (Everyone)',
        value: [
          '`%quote` — AI-generated quote of the day',
          '`%joke` — AI-generated joke',
          '`%roast @user` — AI roast (no limit for admins!)',
        ].join('\n')
      }
    );
  } else {
    embed.setDescription('Here are the commands available to you:');

    embed.addFields(
      {
        name: '🎉 Fun Commands',
        value: [
          '`%quote` or `/quote` — Get a quote of the day',
          '`%joke` or `/joke` — Get a random joke',
          '`%roast @user` or `/roast @user` — AI roast someone (**5 per day**, 1 min cooldown)',
        ].join('\n')
      },
      {
        name: '💡 Tips',
        value: 'All commands also work with `/` as a slash command!\nAdmin commands are restricted to server admins only.'
      }
    );
  }

  return embed;
}
