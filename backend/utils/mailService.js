
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPaymentReceipt = async (to, receiptData) => {
  const {
    devoteeName,
    pujaName,
    bookingId,
    amountPaid,
    totalAmount,
    paymentStatus,
    date,
    time,
  } = receiptData;

  const isFullPayment = paymentStatus === 'fully_paid';
  
  const mailOptions = {
    from: `"Sri Vedic Puja" <${process.env.SMTP_USER}>`,
    to: to,
    subject: `Payment Receipt - ${pujaName} - ${bookingId}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #f97316, #b45309); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Sri Vedic Puja</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Payment Confirmation Receipt</p>
        </div>
        
        <div style="padding: 32px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #4b5563;">Namaste <strong>${devoteeName}</strong>,</p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            We have successfully received your payment for <strong>${pujaName}</strong>. Your booking is currently being processed.
          </p>
          
          <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #9a3412; font-size: 12px; text-transform: uppercase; font-weight: bold;">Booking ID</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1f2937;">#${bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #9a3412; font-size: 12px; text-transform: uppercase; font-weight: bold;">Puja</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937;">${pujaName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #9a3412; font-size: 12px; text-transform: uppercase; font-weight: bold;">Date & Time</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937;">${date} | ${time}</td>
              </tr>
              <tr style="border-top: 1px solid #ffedd5; margin-top: 8px;">
                <td style="padding: 12px 0 4px; color: #9a3412; font-size: 12px; text-transform: uppercase; font-weight: bold;">Total Amount</td>
                <td style="padding: 12px 0 4px; text-align: right; color: #1f2937;">₹${totalAmount}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #9a3412; font-size: 14px; text-transform: uppercase; font-weight: bold;">Amount Paid</td>
                <td style="padding: 4px 0; text-align: right; font-size: 18px; font-weight: 800; color: #ea580c;">₹${amountPaid}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #9a3412; font-size: 12px; text-transform: uppercase; font-weight: bold;">Status</td>
                <td style="padding: 4px 0; text-align: right;">
                  <span style="background-color: ${isFullPayment ? '#dcfce7' : '#fef9c3'}; color: ${isFullPayment ? '#166534' : '#854d0e'}; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    ${isFullPayment ? 'Fully Paid' : 'Advance Paid'}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 24px;">
            Our team will contact you shortly to coordinate the ritual. You can track your booking in the <strong>My Bookings</strong> section of your profile.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            If you have any questions, please reply to this email or contact us at support@srivedicpuja.com
          </p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
            © 2026 Sri Vedic Puja. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Sent] Payment Receipt:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email Error] Failed to send payment receipt:', error);
    return false;
  }
};
