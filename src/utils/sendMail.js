const dns = require("dns");
const nodemailer = require("nodemailer");

// Prefer IPv4 so SMTP works on hosts (e.g. Render) where IPv6 is unreachable (ENETUNREACH)
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");

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

  // Longer timeouts for cloud (e.g. Render) where SMTP connection can be slow
  const socketTimeouts = {
    connectionTimeout: 60000,  // 60s to establish TCP + TLS
    greetingTimeout: 60000,
    socketTimeout: 60000,
  };

  const config = isGmail
    ? {
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        ...socketTimeouts,
      }
    : {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER || process.env.SMTP_USER,
          pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS,
        },
        ...socketTimeouts,
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
