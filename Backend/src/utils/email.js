import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarCorreoVerificacion = async (email, token) => {
  const url = `${
    process.env.BACKEND_URL || "http://localhost:3000"
  }/api/usuario/verificar/${token}`;

  const opciones = {
    from: `"Verificador de RecordBlock" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verificación de cuenta RecordBlock",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Buen día.</p>
        <h2>Verifica tu cuenta</h2>
        <p>Haz clic en el siguiente enlace para activar tu cuenta de RecordBlock:</p>
        <a href="${url}" style="color: #0066cc;">${url}</a>
        <p>El enlace expira en 15 minutos.</p>
        <br><br>
        <p>Cordialmente,</p>
        <div style="margin-top: 20px;">
          <p style="margin: 2px 0;"><strong>Area Ciberseguridad</strong></p>
          <p style="margin: 2px 0;">Equipo Servicios Ciberseguridad</p>
          <br>
          <p style="margin: 2px 0;">Cel: +57 3133585900</p>
          <p style="margin: 2px 0;">Bogotá, Colombia</p>
          <br>
          <img src="cid:logo-axity" style="max-width: 150px; margin: 10px 0;" alt="Axity">
          <p style="margin: 2px 0;"><a href="https://www.axity.com" style="color: #0066cc;">www.axity.com</a></p>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
        <div style="font-size: 10px; color: #666; margin-top: 20px;">
          <p><strong>********************** AVISO LEGAL **************************</strong></p>
          <p>Este mensaje es solamente para la persona a la que va dirigido. Puede contener información confidencial o legalmente protegida. Si usted ha recibido este mensaje por error, le rogamos que borre de su sistema inmediatamente el mensaje y notifique al remitente. No debe usar, revelar, distribuir, imprimir o copiar ninguna de las partes de este mensaje si no es usted el destinatario.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: "axity.gif",
        // Ruta absoluta correcta usando __dirname
        path: path.join(__dirname, "../../src/assets/axity.gif"),
        cid: "logo-axity",
      },
    ],
  };

  await transporter.sendMail(opciones);
};
