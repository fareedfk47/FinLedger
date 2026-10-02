require("dotenv").config();
const nodemailer = require("nodemailer");

// ============================================================
// EMAIL TRANSPORTER (Gmail OAuth2)
// ============================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify email server connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("Email server connection note:", error.message || error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// ============================================================
// COMMON SEND EMAIL FUNCTION
// ============================================================
const sendEmail = async (to, subject, text, html) => {
  try {
    const sender = process.env.EMAIL_USER
      ? `"FinLedger" <${process.env.EMAIL_USER}>`
      : '"FinLedger Support" <no-reply@finledger.com>';

    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// ============================================================
// 1. REGISTRATION EMAIL
// ============================================================
const sendRegistrationEmail = async (email, name) => {
  try {
    const subject = "Welcome to FinLedger";

    const text = `
Hello ${name},

Welcome to FinLedger.

Your banking account has been successfully created.
You can now log in to the dashboard and start managing your finances.

If you did not create this account, please contact our support team immediately.

Regards,
FinLedger Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FinLedger</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 24px; text-align: center; border-bottom: 1px solid #eeeeee; background: #0037b0;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">FinLedger</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #1f2937;">Welcome, ${name}!</h2>
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4b5563;">Your FinLedger account has been successfully created.</p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4b5563;">You can now log in and manage your savings, current accounts, deposits, and transfers.</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280;">If you did not create this account, please contact support immediately.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #eeeeee; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280; font-weight: bold;">FinLedger Team</p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an automated banking notification. Please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await sendEmail(email, subject, text, html);
    console.log("Registration email sent successfully");
  } catch (error) {
    console.error("Registration email failed:", error);
  }
};

// ============================================================
// 2. TRANSACTION SUCCESS EMAIL
// ============================================================
const sendTransactionEmail = async (userEmail, transactionDetails) => {
  try {
    const {
      type,
      amount,
      accountNumber,
      balanceAfter,
      description,
      date,
    } = transactionDetails;

    // Correct type mapping for FinLedger
    const typeMap = {
      deposit: "Deposit (Credit)",
      withdraw: "Withdrawal (Debit)",
      transfer: "Transfer",
    };
    const transactionType = typeMap[type?.toLowerCase()] || type || "Transaction";

    const formattedAmount = Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });

    const formattedBalance =
      balanceAfter !== undefined
        ? Number(balanceAfter).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })
        : "N/A";

    const formattedDate = date ? new Date(date).toLocaleString("en-IN") : new Date().toLocaleString("en-IN");

    const subject = `FinLedger Alert: ${transactionType} of ${formattedAmount}`;

    const text = `
Hello,

A new transaction was processed on your FinLedger account.

Transaction Details:
- Type: ${transactionType}
- Amount: ${formattedAmount}
- Account: ${accountNumber ? `•••• ${accountNumber.slice(-4)}` : "N/A"}
- Available Balance: ${formattedBalance}
- Description: ${description || "N/A"}
- Date: ${formattedDate}

Regards,
FinLedger Banking Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Transaction Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 24px; text-align: center; border-bottom: 1px solid #eeeeee; background: #0037b0;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">FinLedger</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #1f2937;">Transaction Successful</h2>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b5563;">Your transaction has been processed and credited/debited to your ledger.</p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; color: #6b7280;">Transaction Type</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #1f2937;">${transactionType}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; color: #6b7280;">Amount</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #0037b0;">${formattedAmount}</td>
                </tr>
                ${
                  accountNumber
                    ? `<tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; color: #6b7280;">Account</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; text-align: right; font-family: monospace; color: #1f2937;">•••• ${accountNumber.slice(-4)}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; color: #6b7280;">Available Balance</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #1f2937;">${formattedBalance}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; color: #6b7280;">Description</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; text-align: right; color: #1f2937;">${description || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #6b7280;">Date & Time</td>
                  <td style="padding: 12px 16px; text-align: right; color: #1f2937;">${formattedDate}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #eeeeee; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">FinLedger Banking System • Automated Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await sendEmail(userEmail, subject, text, html);
    console.log("Transaction email sent successfully");
  } catch (error) {
    console.error("Transaction email failed:", error);
  }
};

// ============================================================
// 3. TRANSACTION FAILURE EMAIL
// ============================================================
const sendTransactionFailureEmail = async (userEmail, transactionDetails, errorMessage) => {
  try {
    const { type, amount, accountNumber, description, date } = transactionDetails;

    const formattedAmount = Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });

    const subject = "FinLedger Alert: Transaction Failed";

    const text = `
Hello,

A transaction could not be completed on your FinLedger account.

Details:
- Type: ${type || "Transaction"}
- Attempted Amount: ${formattedAmount}
- Account: ${accountNumber ? `•••• ${accountNumber.slice(-4)}` : "N/A"}
- Description: ${description || "N/A"}
- Date: ${date || new Date().toLocaleString("en-IN")}

Reason for failure:
${errorMessage || "Processing error or insufficient funds."}

Regards,
FinLedger Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Transaction Failed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 24px; text-align: center; border-bottom: 1px solid #eeeeee; background: #ba1a1a;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">FinLedger</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #ba1a1a;">Transaction Failed</h2>
              <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563;">We were unable to process the following transaction on your account:</p>

              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 4px; font-weight: bold; color: #991b1b; font-size: 13px;">Reason:</p>
                <p style="margin: 0; color: #b91c1c; font-size: 14px;">${errorMessage || "Transaction could not be completed."}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #eeeeee; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">FinLedger Banking System • Automated Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await sendEmail(userEmail, subject, text, html);
    console.log("Transaction failure email sent successfully");
  } catch (error) {
    console.error("Transaction failure email failed:", error);
  }
};

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};