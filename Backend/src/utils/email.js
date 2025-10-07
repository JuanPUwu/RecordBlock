import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // usa una "contraseña de aplicación"
  },
});

export const enviarCorreoVerificacion = async (email, token) => {
  const url = `${
    process.env.BACKEND_URL || "http://localhost:3000"
  }/api/usuario/verificar/${token}`;

  const opciones = {
    from: `"Soporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifica tu cuenta",
    html: `
      <h2>Verifica tu cuenta</h2>
      <p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
      <a href="${url}">${url}</a>
      <p>El enlace expira en 1 hora.</p>
    `,
  };

  await transporter.sendMail(opciones);
};
