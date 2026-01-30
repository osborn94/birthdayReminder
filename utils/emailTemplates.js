
exports.getBirthdayEmail = (username) => `
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
    <div class="footer"><p><strong>With warm wishes,</strong><br>Osborn Networks</p></div>
  </div>
</body>
</html>`;
