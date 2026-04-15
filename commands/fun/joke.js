const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
  name: 'joke',
  description: 'Get an AI-generated joke',
  usage: '%joke',
  category: 'fun',
  adminOnly: false,

  slashData: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get an AI-generated joke'),

  async execute(message) {
    await message.channel.sendTyping();

    try {
      if (!process.env.GEMINI_KEY_JOKE) {
        return message.reply('❌ GEMINI_KEY_JOKE is missing in Railway variables.');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_JOKE);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent(
        'Tell me one clean, funny, original joke. Keep it short. Output only the joke.'
      );

      const text = result.response.text().trim();

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('😂 Joke Time!')
        .setDescription(text)
        .setFooter({ text: 'Powered by Gemini' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Joke error:', err);
      return message.reply('❌ Couldn’t generate a joke right now.');
    }
  },

  async executeSlash(interaction) {
    await interaction.deferReply();

    try {
      if (!process.env.GEMINI_KEY_JOKE) {
        return interaction.editReply('❌ GEMINI_KEY_JOKE is missing in Railway variables.');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_JOKE);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent(
        'Tell me one clean, funny, original joke. Keep it short. Output only the joke.'
      );

      const text = result.response.text().trim();

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('😂 Joke Time!')
        .setDescription(text)
        .setFooter({ text: 'Powered by Gemini' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Joke error:', err);
      return interaction.editReply('❌ Couldn’t generate a joke right now.');
    }
  }
};
