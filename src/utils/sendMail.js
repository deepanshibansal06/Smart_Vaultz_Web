const nodemailer = require("nodemailer");

const SPAM_NOTICE = "If you don't see this email in your inbox, please check your spam or junk folder.";

function getProvider() {
  const provider = (process.env.EMAIL_PROVIDER || process.env.EMAIL_SERVICE || "").toLowerCase();
  if (provider === "resend" && process.env.RESEND_API_KEY) return "resend";
  if ((provider === "gmail" || provider === "smtp") && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) return "smtp";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) return "smtp";
  return null;
}

let transporter = null;

function getSmtpTransporter() {
  if (transporter) return transporter;
  const provider = getProvider();
  if (provider !== "smtp") return null;

  const service = (process.env.EMAIL_SERVICE || "").toLowerCase();
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

async function sendViaSmtp(to, subject, text, from) {
  const transport = getSmtpTransporter();
  if (!transport) return false;
  const fromAddr = from || process.env.EMAIL_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER;
  await transport.sendMail({
    from: fromAddr,
    to: to.trim().toLowerCase(),
    subject,
    text,
  });
  return true;
}

async function sendViaResend(to, subject, text) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const { Resend } = require("resend");
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || "SmartVault <onboarding@resend.dev>";
  const html = text.replace(/\n/g, "<br>");
  const { data, error } = await resend.emails.send({
    from,
    to: [to.trim().toLowerCase()],
    subject,
    html: html + "<br><br><p style='color:#666;font-size:12px'>" + SPAM_NOTICE + "</p>",
  });
  if (error) throw new Error(error.message || "Resend send failed");
  return true;
}

exports.sendOtpEmail = async (to, otp, purpose = "verification") => {
  const subject =
    purpose === "forgot"
      ? "SmartVault – Reset password OTP"
      : "SmartVault – Sign up OTP";
  const text =
    `Your OTP is: ${otp}\nValid for 10 minutes. Do not share.\n\n${SPAM_NOTICE}`;

  const provider = getProvider();
  if (!provider) {
    console.warn("Email not configured; OTP would be:", otp);
    return true;
  }

  if (provider === "resend") {
    await sendViaResend(to, subject, text);
  } else {
    const from = process.env.EMAIL_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER;
    await sendViaSmtp(to, subject, text, from);
  }
  return true;
};

exports.getSpamNotice = () => SPAM_NOTICE;
