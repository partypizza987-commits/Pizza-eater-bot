const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { loadJSON, saveJSON } = require('../../utils/data');

const DAILY_LIMIT = 5;
const COOLDOWN_MS = 60 * 1000;

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function checkAndUpdateLimit(userId) {
  const data = loadJSON('roast_limits.json');
  const today = getTodayKey();

  if (!data[userId]) data[userId] = {};
  if (!data[userId][today]) data[userId][today] = { count: 0, lastUsed: 0 };

  const entry = data[userId][today];
  const now = Date.now();

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, reason: `daily_limit`, remaining: 0 };
  }

  const timeSinceLast = now - entry.lastUsed;
  if (entry.lastUsed > 0 && timeSinceLast < COOLDOWN_MS) {
    const secondsLeft = Math.ceil((COOLDOWN_MS - timeSinceLast) / 1000);
    return { allowed: false, reason: 'cooldown', secondsLeft };
  }

  entry.count += 1;
  entry.lastUsed = now;
  data[userId][today] = entry;
  saveJSON('roast_limits.json', data);

  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}

async function generateRoast(targetName) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_ROAST);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(
    `Roast the person named "${targetName}" in a funny, witty, and harmless way. Keep it light-hearted and humorous — not mean or offensive. 2-3 sentences max. Only output the roast, nothing else.`
  );
  return result.response.text().trim();
}

module.exports = {
  name: 'roast',
  description: 'Get an AI roast of a mentioned user (5 per day for regular users)',
  usage: '%roast @user',
  category: 'fun',
  adminOnly: false,

  slashData: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Get an AI roast of a user (5 per day for regular users)')
    .addUserOption(opt => opt.setName('user').setDescription('The user to roast').setRequired(true)),

  async execute(message, args) {
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Please mention someone to roast! Usage: `%roast @user`');

    const isAdmin = message.member?.permissions.has('Administrator');

    if (!isAdmin) {
      const check = checkAndUpdateLimit(message.author.id);
      if (!check.allowed) {
        if (check.reason === 'daily_limit') {
          return message.reply(`❌ You've hit your **daily roast limit of ${DAILY_LIMIT}**! Come back tomorrow. 🔥`);
        }
        if (check.reason === 'cooldown') {
          return message.reply(`⏳ Slow down! You can roast again in **${check.secondsLeft} second(s)**!`);
        }
      }
    }

    await message.channel.sendTyping();

    try {
      const roast = await generateRoast(target.displayName);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle(`🔥 Roasting ${target.displayName}...`)
        .setDescription(roast)
        .setThumbnail(target.user.displayAvatarURL())
        .setFooter({ text: isAdmin ? 'Admin — no limits 😈' : `Requested by ${message.author.tag}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Roast error:', err);
      message.reply('❌ Couldn\'t generate a roast right now. Try again!');
    }
  },

  async executeSlash(interaction) {
    const target = interaction.options.getMember('user');
    const isAdmin = interaction.member?.permissions.has('Administrator');

    if (!isAdmin) {
      const check = checkAndUpdateLimit(interaction.user.id);
      if (!check.allowed) {
        if (check.reason === 'daily_limit') {
          return interaction.reply({ content: `❌ You've hit your **daily roast limit of ${DAILY_LIMIT}**! Come back tomorrow. 🔥`, ephemeral: true });
        }
        if (check.reason === 'cooldown') {
          return interaction.reply({ content: `⏳ Slow down! You can roast again in **${check.secondsLeft} second(s)**!`, ephemeral: true });
        }
      }
    }

    await interaction.deferReply();

    try {
      const roast = await generateRoast(target.displayName);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle(`🔥 Roasting ${target.displayName}...`)
        .setDescription(roast)
        .setThumbnail(target.user.displayAvatarURL())
        .setFooter({ text: isAdmin ? 'Admin — no limits 😈' : `Requested by ${interaction.user.tag}` })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Roast error:', err);
      interaction.editReply('❌ Couldn\'t generate a roast right now. Try again!');
    }
  }
};
