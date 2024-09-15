const waitingForWalletAddress = {};
const waitingForAmount = {};
const fs = require("fs");
const { User, Withdrawal } = require("./db"); // Import Withdrawal model

module.exports.handleWithdraw = async (ctx) => {
  waitingForWalletAddress[ctx.from.id] = true;
  ctx.replyWithPhoto(
    {
      source: fs.createReadStream("./card.PNG"),
    },
    {
      caption:
        "⬇️ Now Please Submit Your USDT(BNB) Wallet Address \n " +
        "\n" +
        "Search USDT(BNB) in wallet or Safepal, Copy receive address and paste it Here",
    }
  );
};

module.exports.handleText = async (ctx, text) => {
  if (waitingForWalletAddress[ctx.from.id] === true) {
    // Save the wallet address and prompt for amount
    waitingForWalletAddress[ctx.from.id] = text; // Save the wallet address
    waitingForAmount[ctx.from.id] = true; // Set waitingForAmount to true
    ctx.reply("Please enter the amount (e.g., 2 USDT).");
  } else if (waitingForAmount[ctx.from.id] === true) {
    const amount = parseFloat(text);

    if (isNaN(amount) || amount < 2) {
      ctx.reply("The withdrawable amount should be more than 2 USDT.");
    } else {
      try {
        // Retrieve user information from the database
        const user = await User.findOne({ userId: ctx.from.id });

        if (!user) {
          ctx.reply("User not found.");
          return;
        }

        // Check if the user has enough balance
        const maxWithdrawalAmount = Math.min(
          user.balance * 0.2,
          user.balance - 0.9
        ); // 20% of balance, but not less than 0.9 USDT
        if (amount > maxWithdrawalAmount) {
          ctx.reply(
            `You can only withdraw up to ${maxWithdrawalAmount} USDT every 24 hours.`
          );
          return;
        }

        // Check if the user has withdrawn in the last 24 hours
        const lastWithdrawal = await Withdrawal.findOne({
          userId: user.userId,
          createdAt: { $gt: Date.now() - 24 * 60 * 60 * 1000 },
        });
        if (lastWithdrawal) {
          ctx.reply("You can only withdraw once every 24 hours.");
          return;
        }

        // Deduct the amount from user's balance
        user.balance -= amount;
        await user.save();

        // Log the withdrawal
        const withdrawal = new Withdrawal({
          userId: user.userId,
          wallet: waitingForWalletAddress[ctx.from.id], // Store the wallet address
          withdrawnAmount: amount,
          updatedBalance: user.balance,
        });
        await withdrawal.save();

        // Reply with confirmation messages
        ctx.reply(
          `Withdrawal processed to wallet address: ${
            waitingForWalletAddress[ctx.from.id]
          }`
        );
        ctx.reply("Successfully withdrawn!");

        // Reset the waiting flags after the withdrawal is completed
        delete waitingForWalletAddress[ctx.from.id];
        delete waitingForAmount[ctx.from.id];
      } catch (error) {
        console.error("Error processing withdrawal:", error);
        ctx.reply("An error occurred while processing your withdrawal.");
      }
    }
  }
};
