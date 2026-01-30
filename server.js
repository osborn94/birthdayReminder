const express = require('express');
require('dotenv').config();
const path = require('path');
const { sendBirthdayEmails, sendTestEmailToAll } = require("./services/birthdayService");
const connectDB = require('./config/db');
const Customer = require("./models/customer");

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));


// Cron job - runs daily at 7:00 AM
// cron.schedule('0 7 * * *', () => {
//   console.log('🕐 Running scheduled birthday check at 7:00 AM...');
//   sendBirthdayEmails();
// });

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

(async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
})();