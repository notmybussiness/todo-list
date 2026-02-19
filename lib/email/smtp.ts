import nodemailer from "nodemailer";

type SendSmtpMailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName?: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedSignature = "";

function parseBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (!raw) {
    return fallback;
  }
  return raw.trim().toLowerCase() === "true";
}

function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST ?? "";
  const portRaw = process.env.SMTP_PORT ?? "";
  const user = process.env.SMTP_USER ?? "";
  const pass = process.env.SMTP_PASS ?? "";
  const from = process.env.SMTP_FROM ?? "";
  const fromName = process.env.SMTP_FROM_NAME;
  const secure = parseBoolean(process.env.SMTP_SECURE, false);
  const port = Number(portRaw || (secure ? "465" : "587"));

  if (!host || !Number.isFinite(port) || !user || !pass || !from) {
    throw new Error(
      "SMTP 환경변수가 부족합니다. SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM을 확인해주세요."
    );
  }

  return { host, port, secure, user, pass, from, fromName };
}

function getTransporter(config: SmtpConfig): nodemailer.Transporter {
  const signature = `${config.host}:${config.port}:${config.user}:${config.secure}`;
  if (cachedTransporter && cachedSignature === signature) {
    return cachedTransporter;
  }

  cachedSignature = signature;
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  return cachedTransporter;
}

export async function sendSmtpMail({ to, subject, text, html }: SendSmtpMailParams) {
  const config = getSmtpConfig();
  const transporter = getTransporter(config);
  const from = config.fromName ? `"${config.fromName}" <${config.from}>` : config.from;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
}
