module.exports = {
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || 'example@gmail.com',
  smtpPass: process.env.SMTP_PASS || 'password',
  fromEmail: process.env.FROM_EMAIL || 'no-reply@ecommerce.com',
};
