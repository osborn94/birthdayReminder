const connectDB = require("../config/db");
const { sendBirthdayEmails } = require("../services/birthdayService");

require("dotenv").config();

exports.runBirthdayJob = async () => {

  console.log("Birthday cron job started");

  try {

    await connectDB();

    const result = await sendBirthdayEmails();

    return {
      success: result.success || 0,
      failed: result.failed || 0,
      smtpError: result.smtpError || false
    };

  } catch (error) {
    console.error("Birthday job crashed:", error.message);

    // Only throw if this is a SYSTEM failure
    throw error;
  }
};




// module.exports = async function runBirthdayJob() {
//   console.log("Birthday cron job STARTED at", new Date().toISOString());
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
// }
