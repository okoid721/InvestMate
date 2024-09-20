// referral.js

const { User } = require("./db");

async function generateReferralLink(ctx) {
  const userId = ctx.from.id;

  // Find or create a unique referral code for the user
  let user = await User.findOne({ userId });
  if (!user.referralCode) {
    user.referralCode = `INVESTMATE-${userId}`; // You can generate a more complex code if needed
    await user.save();
  }

  const referralLink = `https://t.me/Invest_Mate01_bot?start=${user.referralCode}`;
  await ctx.reply(`Your referral link: ${referralLink}`);
}

async function handleReferral(ctx) {
  const referralCode = ctx.message.text.split(" ")[1];

  // If the user starts with a referral code
  if (referralCode) {
    const referrer = await User.findOneAndUpdate(
      { referralCode },
      { $inc: { referralBalance: 0.002 } }, // Use upsert: true to update or create the document
      { upsert: true, new: true }
    );
    if (referrer) {
      await ctx.reply(`Refer a user and earn 0.002USDT`);
    } else {
      await ctx.reply("Invalid referral code.");
    }
  }
}

module.exports = { generateReferralLink, handleReferral };
