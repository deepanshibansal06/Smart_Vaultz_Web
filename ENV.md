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

## CORS

The API allows all origins. For production you may restrict `origin` in `src/server.js`.
