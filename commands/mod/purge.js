const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'Delete a number of messages from the channel',
  usage: '%purge <amount>',
  category: 'mod',
  adminOnly: true,

  slashData: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a number of messages from the channel')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),

  async execute(message, args) {
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ Please provide a number between 1 and 100! Usage: `%purge 10`');
    }

    await message.delete();
    const deleted = await message.channel.bulkDelete(amount, true);

    const reply = await message.channel.send(`🗑️ Successfully deleted **${deleted.size}** message(s).`);
    setTimeout(() => reply.delete().catch(() => {}), 4000);
  },

  async executeSlash(interaction) {
    const amount = interaction.options.getInteger('amount');

    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.editReply({ content: `🗑️ Successfully deleted **${deleted.size}** message(s).` });
  }
};
