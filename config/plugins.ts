export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'mail.smartly-coded.com'), // قد يختلف حسب مقدم الخدمة
        port: env('SMTP_PORT', 587),
        secure: false, // true for 465, false for other ports
        auth: {
          user: env('COMPANY_EMAIL'),
          pass: env('COMPANY_EMAIL_PASSWORD'),
        },
        tls: {
          rejectUnauthorized: false
        }
      },
      settings: {
        defaultFrom: env('COMPANY_EMAIL', 'info@smartly-coded.com'),
        defaultReplyTo: env('COMPANY_EMAIL', 'info@smartly-coded.com'),
      },
    },
  },
});
