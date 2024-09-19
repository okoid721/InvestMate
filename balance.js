const { User, Investment } = require("./db");

module.exports.handleBalance = async (ctx) => {
  try {
    const user = await User.findOne({ userId: ctx.from.id });

    if (user) {
      ctx.reply(`Your balance is ${user.balance.toFixed(5)} USDT`);
    } else {
      ctx.reply("User not found.");
    }
  } catch (err) {
    console.error("Error fetching balance:", err);
    ctx.reply("An error occurred while fetching your balance.");
  }
};
