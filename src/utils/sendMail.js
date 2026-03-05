const nodemailer = require("nodemailer");

const SPAM_NOTICE = "If you don't see this email in your inbox, please check your spam or junk folder.";

function getSmtpConfigured() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) return true;
  if (process.env.SMTP_HOST && (process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD)) return true;
  return false;
}

let transporter = null;

function getSmtpTransporter() {
  if (transporter) return transporter;
  if (!getSmtpConfigured()) return null;

  const service = (process.env.EMAIL_SERVICE || "smtp").toLowerCase();
  const isGmail = service === "gmail";

  const config = isGmail
    ? {
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      }
    : {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || process.env.SMTP_USER,
          pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS,
        },
      };

  transporter = nodemailer.createTransport(config);
  return transporter;
}

exports.sendOtpEmail = async (to, otp, purpose = "verification") => {
  const subject =
    purpose === "forgot"
      ? "SmartVault – Reset password OTP"
      : "SmartVault – Sign up OTP";
  const text =
    `Your OTP is: ${otp}\nValid for 10 minutes. Do not share.\n\n${SPAM_NOTICE}`;

  if (!getSmtpConfigured()) {
    console.warn("Email not configured (SMTP); OTP would be:", otp);
    return true;
  }

  const transport = getSmtpTransporter();
  if (!transport) return true;

  const from = process.env.EMAIL_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER;
  await transport.sendMail({
    from,
    to: to.trim().toLowerCase(),
    subject,
    text,
  });
  return true;
};

exports.getSpamNotice = () => SPAM_NOTICE;
