const transporter = require("../config/mailer");

exports.safeSendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);

    return {
      ok: true,
      info
    };
  } catch (err) {
    console.error("❌ Email send failed:", {
      code: err.code,
      message: err.message
    });

    return {
      ok: false,
      errorType: err.code || "SMTP_ERROR",
      message: err.message
    };
  }
};
