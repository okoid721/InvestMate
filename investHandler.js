const fs = require("fs");
const { User, Investment } = require("./db"); // Import the Investment model

// Temporary storage for pending investments (could also use session storage or a proper state management)
let pendingInvestments = {};

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

    ctx.reply("Choose an amount you want to trade:", {
      reply_markup: {
        keyboard: keyboard,
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  },

  handleText: async (ctx, text) => {
    const userId = ctx.from.id; // User's Telegram ID

    if (["3 USDT", "5 USDT", "8 USDT", "10 USDT", "20 USDT"].includes(text)) {
      const amount = parseInt(text.split(" ")[0]);

      // Temporarily store the user's investment details
      pendingInvestments[userId] = { amount };

      ctx.replyWithPhoto(
        {
          source: fs.createReadStream("./card.PNG"),
        },
        {
          caption:
            `🚀 **Investment Confirmation**\n\n` +
            `Thank you for choosing to Trade **${amount} USDT**! 💰\n\n` +
            `Please send the amount to the following wallet address:\n\n` +
            `🪙 **Wallet Address USDT(BNB)**: 0x730d48fF15bb07179fA45dD21C000193a5e715d1\n\n` +
            `Make sure to double-check the address before sending. ✅\n\n` +
            `Once you've sent the amount, please send your receipt to our support at [@InvestMate_01](https://t.me/InvestMate_01). 🧾\n\n` +
            `After you've sent the receipt, click the button below to confirm your transfer. 🌟`,
        }
      );

      // Display the "Transfer successful" button immediately
      const keyboard = [
        [{ text: "Transfer successful", callback_data: "success" }],
      ];

      ctx.reply(
        "After sending the receipt, click the button below once you've completed the transfer:",
        {
          reply_markup: {
            keyboard: keyboard,
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        }
      );
    } else if (text === "Transfer successful") {
      // Retrieve the stored investment details
      const investmentDetails = pendingInvestments[userId];

      if (investmentDetails) {
        const { amount } = investmentDetails;

        // Save the investment details to MongoDB when transfer is confirmed
        try {
          await Investment.create({ userId, amount });
          console.log(`Investment of ${amount} USDT saved for user ${userId}`);

          // Optionally update the user's balance
          const user = await User.findOne({ userId });
          const profitPercentage = 0.75;
          const profitAmount = amount * profitPercentage;
          user.balance += amount + profitAmount;
          await user.save();
          console.log(
            `User's balance updated with ${amount + profitAmount} USDT`
          );

          ctx.reply(
            `Transfer successful! Your Trade of ${amount} USDT has been processed. 💼`
          );
        } catch (err) {
          console.error("Error saving investment:", err);
          ctx.reply("Sorry, there was an error processing your investment.");
        }

        // Clear the pending investment
        delete pendingInvestments[userId];
      } else {
        ctx.reply("No pending investment found. Please try again.");
      }

      const keyboard = [
        [
          { text: "Balance", callback_data: "balance" },
          { text: "Trade", callback_data: "invest" },
          { text: "Set wallet", callback_data: "withdraw" },
        ],
      ];
      ctx.reply("What would you like to do next?", {
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
          { text: "Trade", callback_data: "invest" },
          { text: "Set wallet", callback_data: "withdraw" },
        ],
      ];
      ctx.reply("Action canceled.", {
        reply_markup: {
          keyboard: keyboard,
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });

      // Clear pending investment if any
      delete pendingInvestments[userId];
    }
  },
};
