const Customer = require("../models/customer");
const transporter = require("../config/mailer");
require('dotenv').config();
const { getBirthdayEmail } = require("../utils/emailTemplates");

exports.sendBirthdayEmails = async () => {
  const today = new Date();
  let sent = 0;

  const customers = await Customer.find();

  for (const customer of customers) {
    const dob = new Date(customer.dateOfBirth);

    if (
      dob.getDate() === today.getDate() &&
      dob.getMonth() === today.getMonth()
    ) {
      await transporter.sendMail({
        from: `"Birthday Wishes 🎉" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: `🎂 Happy Birthday ${customer.username}!`,
        html: getBirthdayEmail(customer.username),
      });

      sent++;
      console.log(`✅ Sent to ${customer.email}`);
    }
  }

  return sent;
};


exports.sendTestEmailToAll = async () => {
  try {
    const customers = await Customer.find({});
    
    console.log('=================================');
    console.log('TEST EMAIL TO ALL CUSTOMERS');
    console.log(`Total customers in database: ${customers.length}`);
    console.log('=================================');
    
    if (customers.length === 0) {
      console.log('⚠️  No customers in database! Please add customers first.');
      return 0;
    }

    let sent = 0;
    let errors = [];

    for (const customer of customers) {
      try {
        console.log(`Sending test email to ${customer.username} (${customer.email})...`);
        
        const info = await transporter.sendMail({
          from: `"Birthday Wishes 🎉" <${process.env.EMAIL_USER}>`,
          to: customer.email,
          subject: `🧪 Test Email - Birthday System`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { margin: 0; padding: 20px; background: #f7fafc; font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #48bb78, #38a169);
                             border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
                h1 { color: white; font-size: 32px; margin: 20px 0; }
                p { color: white; font-size: 16px; line-height: 1.6; }
                .info { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🧪 Test Email</h1>
                <p>Hi ${customer.username}!</p>
                <div class="info">
                  <p><strong>This is a test email from the Birthday Reminder System.</strong></p>
                  <p>Your birthday is registered as: <strong>${new Date(customer.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
                </div>
                <p>When your birthday arrives, you'll receive a beautiful birthday greeting!</p>
                <p style="margin-top: 30px; font-size: 14px; opacity: 0.8;">This email confirms that the system is working correctly.</p>
              </div>
            </body>
            </html>
          `
        });
        
        sent++;
        console.log(`✅ Test email sent successfully!`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        
      } catch (err) {
        console.error(`❌ Failed to send to ${customer.email}`);
        console.error(`   Error: ${err.message}`);
        errors.push({ email: customer.email, error: err.message });
      }
    }
    
    console.log('=================================');
    console.log(`Test complete. ${sent}/${customers.length} email(s) sent successfully.`);
    if (errors.length > 0) {
      console.log(`Failed emails:`, errors);
    }
    console.log('=================================');
    return sent;
  } catch (error) {
    console.error('❌ Error sending test emails:', error);
    return 0;
  }
};

