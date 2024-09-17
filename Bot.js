const { Telegraf } = require("telegraf");
const { connectToDatabase, User } = require("./db");
const fs = require("fs");
require("dotenv").config();
const investHandler = require("./investHandler");
const withdrawHandler = require("./withdraw");
const balanceHandler = require("./balance");

// Initialize and connect to the database
connectToDatabase();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

module.exports = bot;
// Handle /start command
bot.start(async (ctx) => {
  const { id, first_name, last_name, username } = ctx.from;

  try {
    // Save user data to MongoDB
    await User.findOneAndUpdate(
      { userId: id },
      { firstName: first_name, lastName: last_name, username: username },
      { upsert: true, new: true }
    );

    ctx.replyWithPhoto("https://rebrand.ly/51fedd", {
      caption:
        `Hello, ${first_name} This is InvestMate ✨ - your reliable app for keeping and using your cryptocurrencies, all at your fingertips to make extra income for yourself! 📱\n` +
        "\n" +
        "We're excited to introduce our new Telegram mini-app! Start earning now, and soon you'll find out all the great USDT you can earn from them. ⚡\n" +
        "\n" +
        "Have friends? Invite them! The more, the merrier! 👯\n" +
        "\n" +
        "Remember: InvestMate is a place where you can invest your cryptocurrency and earn 20% every day, offering boundless investment opportunities!.🚀\n" +
        "\n" +
        "💬 *Join our Telegram group for updates and discussions:* [Join the Group](https://t.me/+2TGeHpWQ4_JhMzZk)",
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          [
            { text: "Balance", callback_data: "balance" },
            { text: "Invest", callback_data: "invest" },
            { text: "Withdraw", callback_data: "withdraw" },
          ],
        ],
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error("Error handling /start command:", error);
  }
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  try {
    if (text === "Invest") {
      await investHandler.handleInvest(ctx);
    } else if (text === "Balance") {
      await balanceHandler.handleBalance(ctx);
    } else if (text === "Withdraw") {
      await withdrawHandler.handleWithdraw(ctx);
    } else {
      await investHandler.handleText(ctx, text);
      await withdrawHandler.handleText(ctx, text);
    }
  } catch (error) {
    console.error("Error handling text message:", error);
  }
});

// Launch the bot
bot.launch();
