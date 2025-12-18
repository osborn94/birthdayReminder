const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Customer Schema
const customerSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);

// Email Setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email configuration on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Birthday Email Template
const getBirthdayEmail = (username) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                 border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .emoji { font-size: 80px; margin: 20px 0; }
    h1 { color: white; font-size: 36px; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
    p { color: white; font-size: 18px; line-height: 1.8; margin: 15px 0; }
    .highlight { background-color: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid rgba(255,255,255,0.3); 
              color: rgba(255,255,255,0.8); font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="emoji">🎉🎂🎈</div>
    <h1>Happy Birthday, ${username}!</h1>
    <div class="highlight"><p><strong>Today is YOUR special day!</strong></p></div>
    <p>Wishing you a fantastic day filled with joy, laughter, and wonderful memories!</p>
    <p>May this year bring you happiness, success, and all the amazing things you've been dreaming of.</p>
    <p>Thank you for being such a valued customer. Here's to another incredible year ahead!</p>
    <div class="emoji">🎁✨🥳</div>
    <div class="footer"><p><strong>With warm wishes,</strong><br>Your Business Team</p></div>
  </div>
</body>
</html>`;


// Send Birthday Emails (Only for today's birthdays)
async function sendBirthdayEmails() {
  try {
    const today = new Date();
    const customers = await Customer.find({});
    
    console.log('=================================');
    console.log('BIRTHDAY EMAIL CHECK');
    console.log(`Total customers in database: ${customers.length}`);
    console.log(`Today's date: ${today.toDateString()}`);
    console.log('=================================');
    
    if (customers.length === 0) {
      console.log('⚠️  No customers in database!');
      return 0;
    }

    let sent = 0;
    let errors = [];

    for (const customer of customers) {
      const dob = new Date(customer.dateOfBirth);
      const isBirthday = dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
      
      console.log(`${customer.username} - Birthday: ${dob.getMonth() + 1}/${dob.getDate()} | Today: ${today.getMonth() + 1}/${today.getDate()} | Match: ${isBirthday}`);
      
      if (isBirthday) {
        try {
          const info = await transporter.sendMail({
            from: `"Birthday Wishes 🎉" <${process.env.EMAIL_USER}>`,
            to: customer.email,
            subject: `🎉 Happy Birthday ${customer.username}! 🎂`,
            html: getBirthdayEmail(customer.username)
          });
          sent++;
          console.log(`✅ Email sent to ${customer.email}`);
          console.log(`   Message ID: ${info.messageId}`);
        } catch (err) {
          console.error(`❌ Failed to send to ${customer.email}:`, err.message);
          errors.push({ email: customer.email, error: err.message });
        }
      }
    }
    
    console.log('=================================');
    console.log(`Birthday check complete. ${sent} email(s) sent.`);
    if (errors.length > 0) {
      console.log(`Failed emails:`, errors);
    }
    console.log('=================================');
    return sent;
  } catch (error) {
    console.error('❌ Error checking birthdays:', error);
    return 0;
  }
}

// Send test email to ALL customers (for testing purposes)
async function sendTestEmailToAll() {
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
}


// Cron job - runs daily at 7:00 AM
cron.schedule('0 7 * * *', () => {
  console.log('🕐 Running scheduled birthday check at 7:00 AM...');
  sendBirthdayEmails();
});

// Routes
app.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ dateOfBirth: 1 });
    const today = new Date();
    const todayBirthdays = customers.filter(c => {
      const dob = new Date(c.dateOfBirth);
      return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
    });
    res.render('index', { 
      customers, 
      todayBirthdays, 
      success: req.query.success,
      error: req.query.error,
      count: req.query.count
    });
  } catch (error) {
    res.render('index', { customers: [], todayBirthdays: [], success: null, error: 'load_failed' });
  }
});

app.post('/customers/add', async (req, res) => {
  try {
    await Customer.create(req.body);
    res.redirect('/?success=added');
  } catch (error) {
    console.error('Error adding customer:', error);
    res.redirect('/?error=add_failed');
  }
});

app.post('/customers/delete/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.redirect('/?success=deleted');
  } catch (error) {
    res.redirect('/?error=delete_failed');
  }
});

// Test emails for today's birthdays only
app.post('/test-emails', async (req, res) => {
  console.log('Manual birthday check triggered...');
  const count = await sendBirthdayEmails();
  res.redirect(`/?success=emails_sent&count=${count}`);
});

// Test email to ALL customers (for testing the email system)
app.post('/test-email-all', async (req, res) => {
  console.log('Sending test emails to all customers...');
  const count = await sendTestEmailToAll();
  res.redirect(`/?success=emails_sent&count=${count}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});