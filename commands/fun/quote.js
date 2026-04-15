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
    await message.channel.sendTyping();

    try {
      if (!process.env.GEMINI_KEY_QUOTE) {
        return message.reply('❌ GEMINI_KEY_QUOTE is missing in Railway variables.');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_QUOTE);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent(
        'Generate one short inspiring quote. Output only: "Quote" — Author'
      );

      const text = result.response.text().trim();

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('✨ Quote of the Day')
        .setDescription(`*${text}*`)
        .setFooter({ text: 'Powered by Gemini' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Quote error:', err);
      return message.reply('❌ Couldn’t fetch a quote right now.');
    }
  },

  async executeSlash(interaction) {
    await interaction.deferReply();

    try {
      if (!process.env.GEMINI_KEY_QUOTE) {
        return interaction.editReply('❌ GEMINI_KEY_QUOTE is missing in Railway variables.');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_QUOTE);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent(
        'Generate one short inspiring quote. Output only: "Quote" — Author'
      );

      const text = result.response.text().trim();

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('✨ Quote of the Day')
        .setDescription(`*${text}*`)
        .setFooter({ text: 'Powered by Gemini' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Quote error:', err);
      return interaction.editReply('❌ Couldn’t fetch a quote right now.');
    }
  }
};
