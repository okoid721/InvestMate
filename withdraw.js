const { User } = require("./db");
const waitingForWalletAddress = {};

module.exports.handleSetWallet = async (ctx) => {
  const userId = ctx.from.id;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      ctx.reply("User not found.");
      return;
    }

    if (user.wallet) {
      ctx.reply(
        "Your wallet address has already been set and cannot be changed."
      );
      return;
    }

    waitingForWalletAddress[userId] = true;
    ctx.reply(
      "Please submit your USDT(BNB) wallet address and 20% of your balance will be sent to your wallet every 24hrs:"
    );
  } catch (error) {
    console.error("Error checking user wallet:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
};

module.exports.handleText = async (ctx, text) => {
  const userId = ctx.from.id;

  if (waitingForWalletAddress[userId] === true) {
    const walletAddress = text;

    try {
      const user = await User.findOne({ userId });

      if (!user) {
        ctx.reply("User not found.");
        return;
      }

      if (!user.wallet) {
        user.wallet = walletAddress;
        console.log("Saving wallet address:", walletAddress); // Log wallet address

        await user.save();
        console.log("Wallet address saved:", user.wallet); // Log saved user object

        ctx.reply("Wallet uploaded successfully!");
      } else {
        ctx.reply("Your wallet address is already set and cannot be changed.");
      }

      delete waitingForWalletAddress[userId];
    } catch (error) {
      console.error("Error saving wallet address:", error);
      ctx.reply("An error occurred while saving your wallet address.");
    }
  }
};
