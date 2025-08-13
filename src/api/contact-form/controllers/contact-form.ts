// ملف: src/api/contact-form/controllers/contact-form.ts

import { factories } from '@strapi/strapi';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  privacyAccepted: boolean;
}

export default factories.createCoreController('api::contact-form.contact-form', ({ strapi }) => ({
  
  // Override الـ create method العادي
  async create(ctx: any) {
    try {
      // أخذ البيانات من الطلب
      const { data } = ctx.request.body;
      const { name, email, phone, message, privacyAccepted }: ContactFormData = data;

      // التحقق من البيانات
      if (!name || !email || !message) {
        return ctx.badRequest('Name, Email und Nachricht sind erforderlich');
      }

      if (!privacyAccepted) {
        return ctx.badRequest('Datenschutzerklärung muss akzeptiert werden');
      }

      // التحقق من صحة الإيميل
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ctx.badRequest('Ungültige E-Mail-Adresse');
      }

      // حفظ في قاعدة البيانات (الطريقة العادية)
      const savedMessage = await strapi.entityService.create('api::contact-form.contact-form', {
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : '',
          message: message.trim(),
          privacyAccepted,
          submittedAt: new Date(),
        },
      });

      // إرسال الإيميلات
      try {
        // HTML للإيميل المرسل للشركة
        const adminEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>رسالة جديدة من FYONKA</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
              }
              .header { 
                background: linear-gradient(135deg, #b18738, #d4af37);
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
              }
              .header h1 { 
                margin: 0; 
                font-size: 24px; 
              }
              .content { 
                padding: 30px 20px; 
                background: #f9f9f9; 
              }
              .field { 
                margin-bottom: 20px; 
                padding: 15px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .label { 
                font-weight: bold; 
                color: #b18738; 
                font-size: 14px;
                text-transform: uppercase;
                margin-bottom: 8px;
                display: block;
              }
              .value {
                font-size: 16px;
                color: #333;
              }
              .message-box {
                background: white;
                padding: 20px;
                border-left: 5px solid #b18738;
                margin: 15px 0;
                border-radius: 5px;
              }
              .footer {
                background: #333;
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Neue Kontaktanfrage</h1>
                <p>FYONKA - SPA UND BEAUTY SALON</p>
              </div>
              
              <div class="content">
                <div class="field">
                  <span class="label">👤 Name</span>
                  <div class="value">${name}</div>
                </div>
                
                <div class="field">
                  <span class="label">📧 E-Mail</span>
                  <div class="value">${email}</div>
                </div>
                
                ${phone ? `
                <div class="field">
                  <span class="label">📞 Telefon</span>
                  <div class="value">${phone}</div>
                </div>
                ` : ''}
                
                <div class="field">
                  <span class="label">💬 Nachricht</span>
                  <div class="message-box">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                
                <div class="field">
                  <span class="label">🕒 Eingegangen am</span>
                  <div class="value">${new Date().toLocaleString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
              </div>
              
              <div class="footer">
                <p>Diese E-Mail wurde automatisch über das Kontaktformular der FYONKA-Website gesendet.</p>
                <p><strong>FYONKA SPA UND BEAUTY SALON</strong><br>
                Wallstr. 17-19, 01067 Dresden</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // إرسال إيميل للشركة
        await strapi.plugins['email'].services.email.send({
          to: process.env.CONTACT_RECEIVE_EMAIL || 'info@smartly-coded.com',
          from: process.env.COMPANY_EMAIL || 'info@smartly-coded.com',
          replyTo: email,
          subject: `✉️ Neue Kontaktanfrage von ${name} - FYONKA`,
          html: adminEmailHtml,
        });

        // HTML لإيميل التأكيد للعميل
        const customerConfirmationHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>تأكيد استلام رسالتك</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
              }
              .header { 
                background: linear-gradient(135deg, #b18738, #d4af37);
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
              }
              .content { 
                padding: 30px 20px; 
                background: #f9f9f9; 
              }
              .highlight-box {
                background: white;
                padding: 20px;
                border-left: 5px solid #b18738;
                margin: 20px 0;
                border-radius: 5px;
              }
              .contact-info {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .footer {
                background: #333;
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Vielen Dank für Ihre Nachricht!</h1>
                <p>FYONKA - SPA UND BEAUTY SALON</p>
              </div>
              
              <div class="content">
                <p>Liebe/r <strong>${name}</strong>,</p>
                
                <p>vielen Dank für Ihre Kontaktanfrage! Wir haben Ihre Nachricht erfolgreich erhalten und werden uns <strong>schnellstmöglich</strong> bei Ihnen melden.</p>
                
                <div class="highlight-box">
                  <strong>📝 Ihre Nachricht:</strong><br><br>
                  ${message.replace(/\n/g, '<br>')}
                </div>
                
                <p>Unser Team bearbeitet Ihre Anfrage und meldet sich in Kürze bei Ihnen.</p>
                
                <div class="contact-info">
                  <h3 style="color: #b18738; margin-top: 0;">📞 Direkter Kontakt:</h3>
                  <p style="margin: 5px 0;"><strong>Telefon:</strong> 015227776665</p>
                  <p style="margin: 5px 0;"><strong>E-Mail:</strong> info@fyonka.de</p>
                  <p style="margin: 5px 0;"><strong>Adresse:</strong> Wallstr. 17-19, 01067 Dresden</p>
                </div>
                
                <p style="margin-top: 30px;">Wir freuen uns darauf, Ihnen zu helfen! 💆‍♀️✨</p>
                
                <p><strong>Mit herzlichen Grüßen,</strong><br>
                <strong>Ihr FYONKA Team</strong></p>
              </div>
              
              <div class="footer">
                <p><strong>FYONKA - SPA UND BEAUTY SALON</strong><br>
                Wallstr. 17-19, 01067 Dresden</p>
                <p>Diese E-Mail wurde automatisch generiert.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // إرسال إيميل تأكيد للعميل
        await strapi.plugins['email'].services.email.send({
          to: email,
          from: process.env.COMPANY_EMAIL || 'info@smartly-coded.com',
          subject: '✅ Bestätigung Ihrer Kontaktanfrage - FYONKA Spa',
          html: customerConfirmationHtml,
        });

        console.log('✅ Emails sent successfully!');

      } catch (emailError: any) {
        // لو فشل إرسال الإيميل، نسجل الخطأ بس ما نوقفش العملية
        console.error('❌ Email sending failed:', emailError);
        strapi.log.error('Email sending failed:', emailError);
      }

      // إرجاع الرد العادي (حتى لو فشل الإيميل)
      ctx.send({
        data: savedMessage,
        meta: {}
      });

    } catch (error: any) {
      console.error('❌ خطأ في حفظ الرسالة:', error);
      
      ctx.internalServerError({
        error: {
          status: 500,
          name: 'InternalServerError',
          message: 'Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  },
}));