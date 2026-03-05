# Environment variables

Copy `env.example` to `.env` and set values.

## Required

- **PORT** – Server port (default 5000)
- **MONGO_URI** – MongoDB connection string
- **JWT_SECRET** – Secret for signing JWTs

## Optional

- **HOST** – Bind address (default 0.0.0.0)
- **ESP_IP** – Locker hardware IP for open/close

## Email (OTP for signup & forgot password) – Resend only

The app sends OTP emails via **Resend** (HTTPS API). Recipients are the users’ own email addresses. The app shows a notice to check the spam folder.

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=SmartVault <onboarding@resend.dev>
```

- Get an API key at [resend.com](https://resend.com).
- Free tier allows sending from `onboarding@resend.dev`.
- For your own domain: add and verify the domain in the [Resend dashboard](https://resend.com/domains), then set `RESEND_FROM=Your App <noreply@yourdomain.com>`.

If `RESEND_API_KEY` is not set, OTP is only logged to the server console (for development).

## CORS

The API allows all origins. For production you may restrict `origin` in `src/server.js`.
