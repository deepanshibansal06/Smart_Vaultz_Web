const SPAM_NOTICE = "If you don't see this email in your inbox, please check your spam or junk folder.";

function isResendConfigured() {
  return process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0;
}

async function sendViaResend(to, subject, text) {
  const { Resend } = require("resend");
  const resend = new Resend(process.env.RESEND_API_KEY.trim());
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || "SmartVault <onboarding@resend.dev>";
  const html = text.replace(/\n/g, "<br>");
  const { error } = await resend.emails.send({
    from,
    to: [to.trim().toLowerCase()],
    subject,
    html: html + "<br><br><p style='color:#666;font-size:12px'>" + SPAM_NOTICE + "</p>",
  });
  if (error) throw new Error(error.message || "Resend send failed");
}

exports.sendOtpEmail = async (to, otp, purpose = "verification") => {
  const subject =
    purpose === "forgot"
      ? "SmartVault – Reset password OTP"
      : "SmartVault – Sign up OTP";
  const text =
    `Your OTP is: ${otp}\nValid for 10 minutes. Do not share.\n\n${SPAM_NOTICE}`;

  if (!isResendConfigured()) {
    console.warn("Email not configured (set RESEND_API_KEY); OTP would be:", otp);
    return true;
  }

  await sendViaResend(to, subject, text);
  return true;
};

exports.getSpamNotice = () => SPAM_NOTICE;
