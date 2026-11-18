import nodemailer from "nodemailer";

export type Mail = { to: string; subject: string; text: string };

// Envoi réel si SMTP_HOST est défini. Sinon (développement, démonstration), le
// message est écrit dans la console du serveur : le lien reste utilisable sans
// serveur de messagerie.
export async function sendMail(mail: Mail) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.info(
      `\n[mail] SMTP_HOST non défini : e-mail affiché ici au lieu d'être envoyé\n` +
        `À : ${mail.to}\nObjet : ${mail.subject}\n\n${mail.text}\n`,
    );
    return;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? "SlamGement <no-reply@localhost>",
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
  });
}
