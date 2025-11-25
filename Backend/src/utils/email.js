import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

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

// Correo de verificación
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
        <p>El enlace expira en 7 días.</p>
        <br><br>
        <p>Cordialmente,</p>
        <div style="margin-top: 20px;">
          <p style="margin: 2px 0; color: #A032C3;"><strong>Área Ciberseguridad</strong></p>
          <p style="margin: 2px 0; color: #3C1451;">Equipo Servicios Ciberseguridad</p>
          <br>
          <p style="margin: 2px 0;">Cel: +57 3133585900</p>
          <p style="margin: 2px 0;">Bogotá, Colombia</p>
          <br>
          <img src="cid:logo-axity" style="max-width: 150px; margin: 10px 0;" alt="Axity">
          <p style="margin: 2px 0;"><a href="https://www.axity.com" style="color: #DE2CE5;">www.axity.com</a></p>
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
        path: path.join(__dirname, "../../src/assets/axity.gif"),
        cid: "logo-axity",
      },
    ],
  };

  await transporter.sendMail(opciones);
};

// Correo de recuperación
export const enviarCorreoRecuperacion = async (email, token) => {
  const url = `${
    process.env.BACKEND_URL || "http://localhost:3000"
  }/api/auth/reset-password/${encodeURIComponent(token)}`;

  const opciones = {
    from: `"Soporte RecordBlock" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Recuperación de contraseña RecordBlock",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Buen día.</p>
        <h2>Recupera tu contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña de RecordBlock:</p>
        <a href="${url}" style="color: #0066cc;">${url}</a>
        <p>El enlace expira en 15 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <br><br>
        <p>Cordialmente,</p>
        <div style="margin-top: 20px;">
          <p style="margin: 2px 0; color: #A032C3;"><strong>Área Ciberseguridad</strong></p>
          <p style="margin: 2px 0; color: #3C1451;">Equipo Servicios Ciberseguridad</p>
          <br>
          <p style="margin: 2px 0;">Cel: +57 3133585900</p>
          <p style="margin: 2px 0;">Bogotá, Colombia</p>
          <br>
          <img src="cid:logo-axity" style="max-width: 150px; margin: 10px 0;" alt="Axity">
          <p style="margin: 2px 0;"><a href="https://www.axity.com" style="color: #DE2CE5;">www.axity.com</a></p>
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
        path: path.join(__dirname, "../../src/assets/axity.gif"),
        cid: "logo-axity",
      },
    ],
  };

  console.log("[email] enviarCorreoRecuperacion -> url:", url);
  await transporter.sendMail(opciones);
};

// Notificación de cambio de contraseña (usuario propio)
export const enviarCorreoCambioPasswordPropio = async (email, nombre) => {
  const fecha = new Date().toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const opciones = {
    from: `"Seguridad RecordBlock" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Tu contraseña ha sido actualizada",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Queremos informarte que la contraseña de tu cuenta en <strong>RecordBlock</strong> fue actualizada correctamente el <strong>${fecha}</strong>.</p>
        <p>Si realizaste este cambio, puedes ignorar este mensaje.</p>
        <p style="color:#b30000;"><strong>Si no fuiste tú, por favor contacta al área de soporte inmediatamente para proteger tu cuenta.</strong></p>
        <br>
        <p>Cordialmente,</p>
        <div style="margin-top: 20px;">
          <p style="margin: 2px 0; color: #A032C3;"><strong>Área Ciberseguridad</strong></p>
          <p style="margin: 2px 0; color: #3C1451;">Equipo Servicios Ciberseguridad</p>
          <br>
          <p style="margin: 2px 0;">Cel: +57 3133585900</p>
          <p style="margin: 2px 0;">Bogotá, Colombia</p>
          <br>
          <img src="cid:logo-axity" style="max-width: 150px; margin: 10px 0;" alt="Axity">
          <p style="margin: 2px 0;"><a href="https://www.axity.com" style="color: #DE2CE5;">www.axity.com</a></p>
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
        path: path.join(__dirname, "../../src/assets/axity.gif"),
        cid: "logo-axity",
      },
    ],
  };

  await transporter.sendMail(opciones);
};

// Notificación de cambio de contraseña por administrador
export const enviarCorreoCambioPasswordAdmin = async (email, nombre) => {
  const fecha = new Date().toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const opciones = {
    from: `"Seguridad RecordBlock" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Cambio de contraseña realizado por un administrador",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Queremos informarte que un <strong>administrador</strong> actualizó la contraseña de tu cuenta en <strong>RecordBlock</strong> el <strong>${fecha}</strong>.</p>
        <p>Si fuiste notificado previamente sobre este cambio, puedes ignorar este mensaje.</p>
        <p style="color:#b30000;"><strong>Si no autorizaste esta acción, por favor comunícate con el área de soporte de inmediato.</strong></p>
        <br>
        <p>Cordialmente,</p>
        <div style="margin-top: 20px;">
          <p style="margin: 2px 0; color: #A032C3;"><strong>Área Ciberseguridad</strong></p>
          <p style="margin: 2px 0; color: #3C1451;">Equipo Servicios Ciberseguridad</p>
          <br>
          <p style="margin: 2px 0;">Cel: +57 3133585900</p>
          <p style="margin: 2px 0;">Bogotá, Colombia</p>
          <br>
          <img src="cid:logo-axity" style="max-width: 150px; margin: 10px 0;" alt="Axity">
          <p style="margin: 2px 0;"><a href="https://www.axity.com" style="color: #DE2CE5;">www.axity.com</a></p>
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
        path: path.join(__dirname, "../../src/assets/axity.gif"),
        cid: "logo-axity",
      },
    ],
  };

  await transporter.sendMail(opciones);
};
