require("dotenv").config();
const connectDB = require("../config/db");
const { sendBirthdayEmails } = require("../services/birthdayService");

module.exports = async function runBirthdayJob() {
  console.log("Birthday cron job STARTED at", new Date().toISOString());
  try {
    console.log("🎉 Birthday cron job started");
    await connectDB();

    const count = await sendBirthdayEmails();
    console.log(`✅ Birthday job finished. Emails sent: ${count}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Birthday job failed:", err);
    process.exit(1);
  }
}

// (async () => {
//   try {
//     console.log("🎉 Birthday cron job started");
//     await connectDB();

//     const count = await sendBirthdayEmails();
//     console.log(`✅ Birthday job finished. Emails sent: ${count}`);

//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Birthday job failed:", err);
//     process.exit(1);
//   }
// })();
