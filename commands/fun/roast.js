const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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

  if (!data[userId]) {
    data[userId] = {};
  }

  if (!data[userId][today]) {
    data[userId][today] = { count: 0, lastUsed: 0 };
  }

  const entry = data[userId][today];
  const now = Date.now();

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, reason: 'daily_limit', remaining: 0 };
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
  if (!process.env.GEMINI_KEY_ROAST) {
    throw new Error('Missing GEMINI_KEY_ROAST environment variable.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_ROAST);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
Roast the person named "${targetName}" in a funny, playful, and harmless way.
Rules:
- Keep it light-hearted
- Do NOT be hateful, sexual, violent, or overly insulting
- Make it sound like a playful joke between friends
- Keep it to 2 short sentences max
- Output only the roast
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

module.exports = {
  name: 'roast',
  description: 'Get a funny AI roast of a user',
  usage: '%roast @user',
  category: 'fun',
  adminOnly: false,

  slashData: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Get a funny AI roast of a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to roast')
        .setRequired(true)
    ),

  async execute(message) {
    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('❌ Please mention someone to roast! Usage: `%roast @user`');
    }

    if (target.user.id === message.author.id) {
      return message.reply('😂 Bro you cannot roast yourself with this command.');
    }

    if (target.user.bot) {
      return message.reply('🤖 Nice try bro, but I am not roasting bots.');
    }

    const isAdmin = message.member?.permissions.has(PermissionFlagsBits.Administrator);

    if (!isAdmin) {
      const check = checkAndUpdateLimit(message.author.id);

      if (!check.allowed) {
        if (check.reason === 'daily_limit') {
          return message.reply(`❌ You reached your **daily roast limit of ${DAILY_LIMIT}**. Come back tomorrow 🔥`);
        }

        if (check.reason === 'cooldown') {
          return message.reply(`⏳ Chill bro, you can roast again in **${check.secondsLeft} second(s)**.`);
        }
      }
    }

    await message.channel.sendTyping();

    try {
      const roast = await generateRoast(target.displayName);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle(`🔥 Roasting ${target.displayName}`)
        .setDescription(roast)
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Target', value: `${target}`, inline: true },
          { name: 'Requested By', value: `${message.author}`, inline: true },
          { name: 'Limits', value: isAdmin ? 'Admin: Unlimited' : `Daily max: ${DAILY_LIMIT}`, inline: true }
        )
        .setFooter({ text: isAdmin ? 'Admin mode 😈' : 'Fun roast mode 😈' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Roast error:', err);
      return message.reply('❌ Couldn’t generate a roast right now. Check Gemini key or try again later.');
    }
  },

  async executeSlash(interaction) {
    const target = interaction.options.getMember('user');

    if (!target) {
      return interaction.reply({
        content: '❌ I could not find that user in this server.',
        ephemeral: true
      });
    }

    if (target.user.id === interaction.user.id) {
      return interaction.reply({
        content: '😂 Bro you cannot roast yourself with this command.',
        ephemeral: true
      });
    }

    if (target.user.bot) {
      return interaction.reply({
        content: '🤖 Nice try bro, but I am not roasting bots.',
        ephemeral: true
      });
    }

    const isAdmin = interaction.member?.permissions.has(PermissionFlagsBits.Administrator);

    if (!isAdmin) {
      const check = checkAndUpdateLimit(interaction.user.id);

      if (!check.allowed) {
        if (check.reason === 'daily_limit') {
          return interaction.reply({
            content: `❌ You reached your **daily roast limit of ${DAILY_LIMIT}**. Come back tomorrow 🔥`,
            ephemeral: true
          });
        }

        if (check.reason === 'cooldown') {
          return interaction.reply({
            content: `⏳ Chill bro, you can roast again in **${check.secondsLeft} second(s)**.`,
            ephemeral: true
          });
        }
      }
    }

    await interaction.deferReply();

    try {
      const roast = await generateRoast(target.displayName);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle(`🔥 Roasting ${target.displayName}`)
        .setDescription(roast)
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Target', value: `${target}`, inline: true },
          { name: 'Requested By', value: `${interaction.user}`, inline: true },
          { name: 'Limits', value: isAdmin ? 'Admin: Unlimited' : `Daily max: ${DAILY_LIMIT}`, inline: true }
        )
        .setFooter({ text: isAdmin ? 'Admin mode 😈' : 'Fun roast mode 😈' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Roast error:', err);
      return interaction.editReply('❌ Couldn’t generate a roast right now. Check Gemini key or try again later.');
    }
  }
};
