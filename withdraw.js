const { User } = require("./db"); // Assuming User model is used to store wallet addresses
const waitingForWalletAddress = {};

module.exports.handleSetWallet = async (ctx) => {
  const userId = ctx.from.id;

  try {
    // Retrieve user information from the database
    const user = await User.findOne({ userId });

    if (!user) {
      ctx.reply("User not found.");
      return;
    }

    // Check if the user already has a wallet address set
    if (user.wallet) {
      ctx.reply(
        "Your wallet address has already been set and cannot be changed."
      );
      return;
    }

    // Prompt the user to submit their wallet address
    waitingForWalletAddress[userId] = true;
    ctx.reply(
      "Please submit your USDT(BNB) wallet address and 20% of your balance will be withdrawed:"
    );
  } catch (error) {
    console.error("Error checking user wallet:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
};

module.exports.handleText = async (ctx, text) => {
  const userId = ctx.from.id;

  if (waitingForWalletAddress[userId] === true) {
    const walletAddress = text; // Assuming text contains the wallet address

    try {
      // Retrieve user information from the database
      const user = await User.findOne({ userId });

      if (!user) {
        ctx.reply("User not found.");
        return;
      }

      // Save the wallet address if it's not already set
      if (!user.wallet) {
        user.wallet = walletAddress;
        await user.save();
        ctx.reply("Wallet uploaded successfully!");
      } else {
        ctx.reply("Your wallet address is already set and cannot be changed.");
      }

      // Clear the waiting flag after wallet is set
      delete waitingForWalletAddress[userId];
    } catch (error) {
      console.error("Error saving wallet address:", error);
      ctx.reply("An error occurred while saving your wallet address.");
    }
  }
};
