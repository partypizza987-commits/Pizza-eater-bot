const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'quote',
  description: 'Get an AI-generated quote of the day',
  usage: '%quote',
  category: 'fun',
  adminOnly: false,

  slashData: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get an AI-generated quote of the day'),

  async execute(message) {
    const typing = await message.channel.sendTyping();

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_QUOTE);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(
        'Generate a single unique, inspiring, and thoughtful quote of the day. Make it feel genuine and memorable. Only output the quote and who said it (or "Unknown" if original). Format: "Quote here." — Author'
      );
      const text = result.response.text().trim();

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('✨ Quote of the Day')
        .setDescription(`*${text}*`)
        .setFooter({ text: 'Powered by AI' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Quote error:', err);
      message.reply('❌ Couldn\'t fetch a quote right now. Try again later!');
    }
  },

  async executeSlash(interaction) {
    await interaction.deferReply();

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_QUOTE);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(
        'Generate a single unique, inspiring, and thoughtful quote of the day. Make it feel genuine and memorable. Only output the quote and who said it (or "Unknown" if original). Format: "Quote here." — Author'
      );
      const text = result.response.text().trim();

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('✨ Quote of the Day')
        .setDescription(`*${text}*`)
        .setFooter({ text: 'Powered by AI' })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Quote error:', err);
      interaction.editReply('❌ Couldn\'t fetch a quote right now. Try again later!');
    }
  }
};
