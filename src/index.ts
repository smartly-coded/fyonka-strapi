// F:\my-strapi-project\src\index.ts

import type { Core } from '@strapi/strapi';

// تحديد الأنواع الصحيحة
interface ContactFormData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

// استخدام النوع الصحيح من Strapi
interface StrapiEvent {
  result?: ContactFormData;
  params?: any;
  model?: any;
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    console.log('🚀 Strapi register function called (TypeScript)');
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    console.log('🔥 Bootstrap function called - setting up email (TypeScript)');

    // تحديد nodemailer كـ dynamic import للتجنب مشاكل TypeScript
    const setupEmailListener = async () => {
      try {
        // Dynamic import لـ nodemailer
        const nodemailer = await import('nodemailer');

        console.log('📧 Setting up email transporter...');

        // إعداد transporter
        const transporter = nodemailer.createTransport({
          host: 'mail.fyonka.de',
          port: 465,
          secure: true,
          auth: {
            user: 'kontakt@fyonka.de',
            pass: 'Fyonka2024!!@'
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000
        });

        // إعداد listener للـ contact-form مع النوع الصحيح
        strapi.db.lifecycles.subscribe({
          models: ['api::contact-form.contact-form'],

          async afterCreate(event: StrapiEvent) {
            console.log('🎯🎯🎯 CONTACT FORM CREATED VIA BOOTSTRAP (TS)! 🎯🎯🎯');
            console.log('Event received:', event);

            // التحقق من وجود النتيجة
            if (!event.result) {
              console.error('❌ No result in event object');
              return;
            }

            try {
              const formData = event.result;

              console.log('📝 Processing form data:', {
                id: formData.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                messageLength: formData.message?.length || 0
              });

              // التحقق من البيانات المطلوبة
              if (!formData.name || !formData.email || !formData.message) {
                console.error('❌ Missing required fields in form data');
                return;
              }

              // إعداد محتوى الإيميل
              const mailOptions = {
                from: '"Fyonka Website" <kontakt@fyonka.de>',
                to: 'kontakt@fyonka.de',
                replyTo: formData.email,
                subject: ``,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #b18738ff, #A0821F); padding: 30px; text-align: center; color: white;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🌟 FYONKA CONTACT FORM</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px;">Neue Nachricht von der Website</p>
                    </div>
                    
                    <div style="padding: 30px; background: white;">
                      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #b18738ff; padding-bottom: 10px;">
                        📝 Kontaktdetails
                      </h2>
                      
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666; width: 120px;">
                            👤 Name:
                          </td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">
                            ${formData.name}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">
                            📧 E-Mail:
                          </td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">
                            <a href="mailto:${formData.email}" style="color: #b18738ff; text-decoration: none;">
                              ${formData.email}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">
                            📞 Telefon:
                          </td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">
                            ${formData.phone || 'Nicht angegeben'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">
                            📅 Gesendet am:
                          </td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">
                            ${new Date(formData.createdAt).toLocaleString('de-DE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'Europe/Berlin'
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">
                            🆔 Anfrage-ID:
                          </td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">
                            #${formData.id}
                          </td>
                        </tr>
                      </table>
                      
                      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #b18738ff; padding-bottom: 8px;">
                        💬 Nachricht
                      </h3>
                      
                      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #b18738ff; font-size: 15px; line-height: 1.6; color: #333;">
                        ${formData.message.replace(/\n/g, '<br>')}
                      </div>
                      
                      <div style="margin-top: 30px; padding: 20px; background: #f0f8ff; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
                        <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">
                          🚀 Schnelle Aktionen:
                        </h4>
                        <div>
                          <a href="mailto:${formData.email}?subject=Re: Ihre Anfrage bei Fyonka&body=Hallo ${formData.name},%0D%0A%0D%0AVielen Dank für Ihre Nachricht." 
                             style="background: #b18738ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 14px; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                            📧 Antworten
                          </a>
                          ${formData.phone ? `
                          <a href="tel:${formData.phone}" 
                             style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 14px; display: inline-block; margin-bottom: 10px;">
                            📞 ${formData.phone}
                          </a>
                          ` : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                      <p style="margin: 0; color: #666; font-size: 14px;">
                        Diese Nachricht wurde automatisch von der Fyonka Website generiert
                      </p>
                      <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
                        © ${new Date().getFullYear()} Fyonka Barber Shop & Hammam | Wallstr. 17-19, Dresden
                      </p>
                    </div>
                  </div>
                `,
                text: `
FYONKA CONTACT FORM - Neue Nachricht

Name: ${formData.name}
E-Mail: ${formData.email}
Telefon: ${formData.phone || 'Nicht angegeben'}
Gesendet am: ${new Date(formData.createdAt).toLocaleString('de-DE')}
Anfrage-ID: #${formData.id}

Nachricht:
${formData.message}

Antworten: mailto:${formData.email}

---
Diese Nachricht wurde automatisch von der Fyonka Website generiert.
© ${new Date().getFullYear()} Fyonka Barber Shop & Hammam | Wallstr. 17-19, Dresden
                `
              };

              console.log('🔗 Testing SMTP connection...');
              await transporter.verify();
              console.log('✅ SMTP connection successful!');

              console.log('📤 Sending email to kontakt@fyonka.de...');
              const info = await transporter.sendMail(mailOptions);
              
              console.log('✅ Email sent successfully!');
              console.log('📧 Message ID:', info.messageId);
              console.log('📬 Server response:', info.response);

              // تحديث السجل (اختياري)
              try {
                await strapi.entityService.update('api::contact-form.contact-form', formData.id, {
                  data: {
                    emailSent: true,
                    emailSentAt: new Date(),
                    emailMessageId: info.messageId
                  }
                });
                console.log('📝 Record updated with email status');
              } catch (updateError: any) {
                console.error('⚠️ Could not update record:', updateError.message);
              }

            } catch (error: any) {
              console.error('❌ Error sending email:', error);
              console.error('Error type:', error.constructor?.name);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              
              if (error.response) {
                console.error('SMTP Response:', error.response);
              }

              // تسجيل الخطأ في السجل
              try {
                const formData = event.result;
                if (formData?.id) {
                  await strapi.entityService.update('api::contact-form.contact-form', formData.id, {
                    data: {
                      emailSent: false,
                      emailError: error.message,
                      emailAttemptedAt: new Date()
                    }
                  });
                  console.log('📝 Record updated with email error');
                }
              } catch (updateError: any) {
                console.error('⚠️ Could not update record with error:', updateError.message);
              }
            }
          }
        } as any); // استخدام 'as any' لتجنب مشاكل TypeScript

        console.log('✅ Email listener set up successfully (TypeScript)');

      } catch (importError) {
        console.error('❌ Error importing nodemailer or setting up email:', importError);
      }
    };

    // تشغيل إعداد الإيميل
    setupEmailListener();
  },
};