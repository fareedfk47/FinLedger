require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"FinLedger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


const sendRegistrationEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: `"FinLedger" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to FinLedger",

      text: `
Hello ${name},

Welcome to FinLedger.

Your account has been successfully created.

You can now log in and start using your FinLedger account.

If you did not create this account, please contact our support team.

Regards,
FinLedger Team
      `,

      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FinLedger</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: Arial, Helvetica, sans-serif;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="padding: 40px 15px;"
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td style="
              padding: 24px;
              text-align: center;
              border-bottom: 1px solid #eeeeee;
            ">
              <h1 style="
                margin: 0;
                font-size: 26px;
                color: #1f2937;
              ">
                FinLedger
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 35px 30px;">

              <h2 style="
                margin: 0 0 20px;
                font-size: 22px;
                color: #1f2937;
              ">
                Welcome, ${name}!
              </h2>

              <p style="
                margin: 0 0 16px;
                font-size: 15px;
                line-height: 1.6;
                color: #4b5563;
              ">
                Your FinLedger account has been successfully created.
              </p>

              <p style="
                margin: 0 0 25px;
                font-size: 15px;
                line-height: 1.6;
                color: #4b5563;
              ">
                You can now log in and start using your account.
              </p>

              <p style="
                margin: 0;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              ">
                If you did not create this account, please contact our
                support team immediately.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 20px 30px;
              background-color: #f9fafb;
              border-top: 1px solid #eeeeee;
              text-align: center;
            ">

              <p style="
                margin: 0 0 6px;
                font-size: 13px;
                color: #6b7280;
              ">
                FinLedger Team
              </p>

              <p style="
                margin: 0;
                font-size: 12px;
                color: #9ca3af;
              ">
                This is an automated email. Please do not reply.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
      `,
    });

    console.log("Registration email sent successfully");
  } catch (error) {
    console.error("Registration email failed:", error);
  }
};



module.exports = { sendRegistrationEmail };