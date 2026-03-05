const dns = require("dns");
const nodemailer = require("nodemailer");

const { promisify } = require("util");
const dnsLookup = promisify(dns.lookup);

const SPAM_NOTICE = "If you don't see this email in your inbox, please check your spam or junk folder.";

function getSmtpConfigured() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) return true;
  if (process.env.SMTP_HOST && (process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD)) return true;
  return false;
}

let transporterPromise = null;

/** Resolve host to IPv4 so SMTP works on hosts (e.g. Render) where IPv6 is unreachable (ENETUNREACH). */
async function resolveHostIPv4(hostname) {
  const { address } = await dnsLookup(hostname, { family: 4 });
  return address;
}

async function getSmtpTransporter() {
  if (transporterPromise) return transporterPromise;
  if (!getSmtpConfigured()) return null;

  transporterPromise = (async () => {
    const service = (process.env.EMAIL_SERVICE || "smtp").toLowerCase();
    const isGmail = service === "gmail";
    const hostname = isGmail ? "smtp.gmail.com" : (process.env.SMTP_HOST || "smtp.gmail.com");
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;

    // Force IPv4 to avoid ENETUNREACH on Render and similar hosts
    const host = await resolveHostIPv4(hostname);

    const socketTimeouts = {
      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000,
    };

    const config = {
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || (isGmail && port === 465),
      auth: {
        user: process.env.EMAIL_USER || process.env.SMTP_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS,
      },
      ...socketTimeouts,
      // TLS SNI: use hostname when connecting by IP so certificate validates
      tls: { servername: hostname },
    };

    return nodemailer.createTransport(config);
  })();

  return transporterPromise;
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

  const transport = await getSmtpTransporter();
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
