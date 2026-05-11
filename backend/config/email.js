const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Helper function to send invitation email
const sendInvitationEmail = async (recipientEmail, reservationId, invitationId) => {
  const acceptUrl = `http://localhost:3000/api/invitations/${invitationId}/accept`;
  const refuseUrl = `http://localhost:3000/api/invitations/${invitationId}/refuse`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Invitation à une réservation - VEKTOR',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">VEKTOR</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Gestion des Réservations</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Vous êtes invité à une réservation!</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #666; font-size: 16px;">
              Vous avez été invité à rejoindre une réservation. Veuillez cliquer sur l'un des boutons ci-dessous pour répondre à cette invitation.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
              ✅ Accepter
            </a>
            <a href="${refuseUrl}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              ❌ Refuser
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Si les boutons ne fonctionnent pas:</strong><br>
              Copiez-collez ces liens dans votre navigateur:
            </p>
            <div style="margin-top: 10px; font-size: 12px; word-break: break-all;">
              <p style="margin: 5px 0;"><strong>Accepter:</strong><br>${acceptUrl}</p>
              <p style="margin: 5px 0;"><strong>Refuser:</strong><br>${refuseUrl}</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
          <p>Ce lien d'invitation expirera après 30 jours.</p>
          <p>Si vous avez des questions, contactez l'administrateur du système.</p>
        </div>
      </div>
    `
  };
  
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

module.exports = { transporter, sendInvitationEmail };
