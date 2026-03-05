# Environment variables

Copy `env.example` to `.env` and set values.

## Required

- **PORT** – Server port (default 5000)
- **MONGO_URI** – MongoDB connection string
- **JWT_SECRET** – Secret for signing JWTs

## Optional

- **HOST** – Bind address (default 0.0.0.0)
- **ESP_IP** – Locker hardware IP for open/close

## Email (OTP for signup & forgot password) – SMTP only

The app sends OTP emails via **SMTP only**. Configure your sender account below. Recipients are the users’ own email addresses (they enter them in the app).

Use **one** of the options below. The app will show a notice to check the spam folder.

### Option A: Gmail (SMTP)

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-app-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-app-gmail@gmail.com
```

Use a dedicated Gmail as the sender. For Gmail use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.

### Option B: Custom SMTP

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
```

If no email config is set, OTP is only logged to the server console (for development).

**SMTP connection timeout on Render/hosting:** The app uses 60s connection timeouts. If you see `Connection timeout` / `ETIMEDOUT` when sending OTP, try: (1) Use Gmail with an [App Password](https://support.google.com/accounts/answer/185833). (2) For custom SMTP, try port **465** with TLS: set `SMTP_PORT=465` and `SMTP_SECURE=true` (some networks treat 465 more reliably than 587).

## CORS

The API allows all origins. For production you may restrict `origin` in `src/server.js`.
