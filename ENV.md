# Environment variables

Copy `env.example` to `.env` and set values.

## Required

- **PORT** – Server port (default 5000)
- **MONGO_URI** – MongoDB connection string
- **JWT_SECRET** – Secret for signing JWTs

## Optional

- **HOST** – Bind address (default 0.0.0.0)
- **ESP_IP** – Locker hardware IP for open/close

## Email (OTP for signup & forgot password)

**Important:** The variables below are for the **app’s sender account** — the address that **sends** OTP emails. The **user’s email** (the one they use to sign up or log in) is not in .env; they enter it in the app, and the OTP is sent **to** that address.

Use **one** of the options below. The app will show a notice to check the spam folder.

### Option A: Gmail

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-app-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-app-gmail@gmail.com
```

Use a dedicated Gmail (or your own) as the **sender**. For Gmail use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.

### Option B: Resend (API)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=SmartVault <onboarding@resend.dev>
```

Get your API key at [resend.com](https://resend.com).

**Two ways to send:**

1. **No domain setup (easiest)**  
   Use Resend’s default sender. Keep:
   - `RESEND_FROM=SmartVault <onboarding@resend.dev>`  
   The free tier lets you send from `onboarding@resend.dev` to any recipient. No DNS or domain steps.

2. **Your own domain (e.g. `noreply@yourdomain.com`)**  
   - In [Resend Dashboard → Domains](https://resend.com/domains), click **Add Domain**.  
   - Enter your domain or subdomain (e.g. `mail.yourdomain.com` or `yourdomain.com`).  
   - Resend will show **DKIM** and **SPF** DNS records. Add them at your DNS provider (where you manage your domain):  
     - **DKIM**: one TXT record (name and value from Resend).  
     - **SPF**: one TXT record; Resend may also show an MX record for bounces.  
   - In the Resend dashboard, click **Verify**. Wait until the domain status is **Verified**.  
   - Set in `.env`:  
     `RESEND_FROM=SmartVault <noreply@yourdomain.com>` (use an address on the verified domain).  

   If verification fails, see [Resend: Domain not verifying](https://resend.com/knowledge-base/what-if-my-domain-is-not-verifying).

### Option C: Custom SMTP

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
```

If no email config is set, OTP is only logged to the server console (for development).

## CORS

The API allows all origins. For production you may restrict `origin` in `src/server.js`.
