import nodemailer, { Transporter } from 'nodemailer';
import { EmailConfig, StatusCode } from '../types/type';
import { HttpError } from '../utils/http.error';

let transporter: Transporter | null = null;

export function createTransporter(): Transporter {
  if (!transporter) {
    const emailConfig: EmailConfig = {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
    };

    if (!emailConfig.user || !emailConfig.pass) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, 'Email configuration missing: EMAIL_USER and EMAIL_PASS must be set in environment variables');
    }

    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });
  }
  return transporter;
}
