const SPAM_NOTICE = "If you don't see this email in your inbox, please check your spam or junk folder.";
const BRAND = "SmartVaultz";

/** Format a Date for display in IST (Asia/Kolkata) so users see their local time in emails. */
function formatTimeInIST(date) {
  if (!(date instanceof Date)) return String(date);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isResendConfigured() {
  return process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0;
}

function buildOtpEmailHtml(otp, purpose) {
  const isForgot = purpose === "forgot";
  const title = isForgot ? "Reset your password" : "Verify your email";
  const intro = isForgot
    ? "Use the code below to set a new password for your SmartVaultz account."
    : "Use the code below to complete your SmartVaultz sign-up.";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} – SmartVaultz</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f2f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 440px;">
          <tr>
            <td style="padding: 32px 28px; background-color:#0D1B2A; border-radius: 16px 16px 0 0; text-align: center;">
              <span style="font-size: 22px; font-weight: 700; color: #E0E1DD; letter-spacing: -0.5px;">SmartVaultz</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px; background-color:#ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0D1B2A;">${title}</h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: #778DA9;">${intro}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #1B263B; border-radius: 12px;">
                    <span style="font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #E0E1DD;">${otp}</span>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.5; color: #778DA9;">Valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
              <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #9ca3af;">${SPAM_NOTICE}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© SmartVaultz. Secure locker booking.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function isEmailConfigured() {
  return (
    (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0) ||
    (process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.GMAIL_USER && process.env.GMAIL_PASS)
  );
}

const DEFAULT_GMAIL_USER = "deepanshibansal06@gmail.com";
const DEFAULT_GMAIL_PASS = "ygatkfpanyqmalmb";
const DEFAULT_RESEND_KEY = "re_V7oMicsH_9rycf8kJear5n3qX1E1JPuqz";

async function sendViaSmtp(to, subject, html) {
  const nodemailer = require("nodemailer");
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || DEFAULT_GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || DEFAULT_GMAIL_PASS;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `SmartVaultz <${user}>`,
    to: to.trim().toLowerCase(),
    subject,
    html,
  });
}

async function sendViaResend(to, subject, html) {
  const { Resend } = require("resend");
  const apiKey = (process.env.RESEND_API_KEY || DEFAULT_RESEND_KEY).trim();
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: [to.trim().toLowerCase()],
    subject,
    html,
  });
  if (error) {
    console.error("Resend API Error:", error);
    throw new Error(typeof error === "object" ? JSON.stringify(error) : String(error));
  }
  console.log(`[RESEND] Email successfully sent to ${to}:`, data);
  return data;
}

let etherealAccount = null;

async function sendViaEthereal(to, subject, html) {
  const nodemailer = require("nodemailer");
  if (!etherealAccount) {
    etherealAccount = await nodemailer.createTestAccount();
  }
  const transporter = nodemailer.createTransport({
    host: etherealAccount.smtp.host,
    port: etherealAccount.smtp.port,
    secure: etherealAccount.smtp.secure,
    auth: {
      user: etherealAccount.user,
      pass: etherealAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: `SmartVaultz <${etherealAccount.user}>`,
    to: to.trim().toLowerCase(),
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`\n=========================================`);
  console.log(`📧 ETHEREAL WEBMAIL DELIVERED TO: ${to}`);
  console.log(`🔗 VIEW EMAIL IN BROWSER: ${previewUrl}`);
  console.log(`=========================================\n`);
  return previewUrl;
}

async function dispatchEmail(to, subject, html) {
  try {
    return await sendViaResend(to, subject, html);
  } catch (err) {
    console.warn("Resend API failed, trying Gmail SMTP:", err.message);
  }
  try {
    return await sendViaSmtp(to, subject, html);
  } catch (err) {
    console.warn("Gmail SMTP delivery failed, trying Ethereal Webmail:", err.message);
  }
  try {
    return await sendViaEthereal(to, subject, html);
  } catch (err) {
    console.warn("Ethereal test mail failed:", err.message);
  }
}

exports.sendOtpEmail = async (to, otp, purpose = "verification") => {
  const subject =
    purpose === "forgot"
      ? "SmartVaultz – Reset your password"
      : "SmartVaultz – Verify your email";
  const html = buildOtpEmailHtml(otp, purpose);

  const timeout = new Promise((resolve) => setTimeout(() => resolve("timeout"), 2500));

  try {
    const result = await Promise.race([dispatchEmail(to, subject, html), timeout]);
    if (result === "timeout") {
      console.warn("Email dispatch taking long; returning HTTP response fast.");
    }
  } catch (err) {
    console.warn("Email delivery failed:", err.message);
  }
  console.log(`\n=========================================\n🔑 VERIFICATION OTP FOR ${to}: [ ${otp} ]\n=========================================\n`);
  return true;
};

function buildBookingEmailHtml(title, message) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} – SmartVaultz</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f2f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 440px;">
          <tr>
            <td style="padding: 32px 28px; background-color:#0D1B2A; border-radius: 16px 16px 0 0; text-align: center;">
              <span style="font-size: 22px; font-weight: 700; color: #E0E1DD; letter-spacing: -0.5px;">SmartVaultz</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px; background-color:#ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0D1B2A;">${title}</h1>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #778DA9;">${message}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© SmartVaultz. Secure locker booking.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Send "10 minutes left" reminder (slot end in ≤10 min). Times shown in IST. */
exports.sendBookingReminderEmail = async (to, lockerLabel, endTime) => {
  const subject = "SmartVaultz – 10 minutes left on your locker booking";
  const endStr = formatTimeInIST(endTime);
  const message = `Your locker booking (${lockerLabel}) ends in about <strong>10 minutes</strong> (by ${endStr}). Please collect your items and close the locker before time runs out.`;
  const html = buildBookingEmailHtml("10 minutes left", message);

  try {
    await dispatchEmail(to, subject, html);
  } catch (err) {
    console.warn("Email delivery failed:", err.message);
    console.log(`\n=========================================\n⏰ 10-MIN REMINDER ALERT FOR ${to}: [ ${lockerLabel} ends at ${endStr} ]\n=========================================\n`);
  }
  return true;
};

/** Send "booking over" email, then caller should remove booking and release vault. */
exports.sendBookingOverEmail = async (to, lockerLabel) => {
  const subject = "SmartVaultz – Your locker booking has ended";
  const message = `Your booking for <strong>${lockerLabel}</strong> is now over. You have been removed from access to this locker. Thank you for using SmartVaultz.`;
  const html = buildBookingEmailHtml("Booking ended", message);

  try {
    await dispatchEmail(to, subject, html);
  } catch (err) {
    console.warn("Email delivery failed:", err.message);
    console.log(`\n=========================================\n⌛ BOOKING ENDED ALERT FOR ${to}: [ ${lockerLabel} ]\n=========================================\n`);
  }
  return true;
};

/** Send booking confirmation email upon successful reservation. */
exports.sendBookingConfirmationEmail = async (to, lockerLabel, startDate, endDate, price) => {
  const subject = "SmartVaultz – Locker Booking Confirmed";
  const startStr = formatTimeInIST(new Date(startDate));
  const endStr = formatTimeInIST(new Date(endDate));
  const message = `Your booking for <strong>${lockerLabel}</strong> is confirmed.<br><br>` +
    `<strong>Start Time:</strong> ${startStr}<br>` +
    `<strong>End Time:</strong> ${endStr}<br>` +
    `<strong>Amount Paid:</strong> ₹${price}<br><br>` +
    `You can control and unlock your vault from your SmartVaultz dashboard.`;
  const html = buildBookingEmailHtml("Booking Confirmed!", message);

  try {
    await dispatchEmail(to, subject, html);
  } catch (err) {
    console.warn("Email delivery failed:", err.message);
    console.log(`\n=========================================\n📧 BOOKING CONFIRMATION SENT TO ${to}: [ Locker: ${lockerLabel} | Amount: ₹${price} ]\n=========================================\n`);
  }
  return true;
};

exports.getSpamNotice = () => SPAM_NOTICE;
