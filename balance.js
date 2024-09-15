const { User, Investment } = require("./db");
// const schedule = require("node-schedule");
const bot = require("./bot"); // Assuming you have a bot instance for sending messages

// Function to update user balances based on investments
// async function updateBalances() {
//   try {
//     // Get all investments
//     const investments = await Investment.find();

//     for (const investment of investments) {
//       const user = await User.findOne({ userId: investment.userId });

//       if (user) {
//         // Calculate per hour interest (0.08% of the amount)
//         const interest = investment.amount * 0.008; // 0.08% per hour

//         // Update the user's balance
//         user.balance += interest;
//         await user.save();

//         console.log(
//           `User ${
//             user.userId
//           } balance updated. New balance: ${user.balance.toFixed(5)} USDT`
//         );

//         // Send a message to the user notifying them of the balance update
//         bot.telegram.sendMessage(
//           user.userId,
//           `You have received 0.08% interest on your investment. Your new balance is ${user.balance.toFixed(
//             5
//           )} USDT.`
//         );
//       }
//     }

//     console.log("Balances updated successfully");
//   } catch (err) {
//     console.error("Error updating balances:", err);
//   }
// }

// Schedule the update function to run every hour
// schedule.scheduleJob("0 * * * *", updateBalances); // Runs every hour at the start of the hour

// Handle balance request
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
