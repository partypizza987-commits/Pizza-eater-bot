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
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_JOKE);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(
        'Tell me a single funny, clean, and original joke. Keep it short and punchy. Only output the joke itself, no extra commentary.'
      );
      const text = result.response.text().trim();

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('😂 Joke Time!')
        .setDescription(text)
        .setFooter({ text: 'Powered by AI' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Joke error:', err);
      message.reply('❌ Couldn\'t think of a joke right now. Try again!');
    }
  },

  async executeSlash(interaction) {
    await interaction.deferReply();

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_JOKE);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(
        'Tell me a single funny, clean, and original joke. Keep it short and punchy. Only output the joke itself, no extra commentary.'
      );
      const text = result.response.text().trim();

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('😂 Joke Time!')
        .setDescription(text)
        .setFooter({ text: 'Powered by AI' })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Joke error:', err);
      interaction.editReply('❌ Couldn\'t think of a joke right now. Try again!');
    }
  }
};
