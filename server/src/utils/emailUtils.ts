import { ExportRequest } from "../types/user";
import { createTransporter } from "../config/mailer";

export async function sendReportEmail(
  userId: string,
  request: ExportRequest,
  content: Buffer,
  filename: string
): Promise<void> {
  const { reportType, email } = request;

  if (!email) {
    throw new Error('Recipient email address is required for email export');
  }

  const reportName = reportType.replace('-', ' ').toUpperCase();
  const subject = `${reportName} Report - ${new Date().toLocaleDateString()}`;
  const text = `Dear User,\n\nAttached is your ${reportName} report.\n\nBest regards,\nYour Application Team`;
  const html = `
    <p>Dear User,</p>
    <p>Attached is your <strong>${reportName}</strong> report.</p>
    <p>Best regards,<br>Your Application Team</p>
  `;

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Your Application" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text,
      html,
      attachments: [
        {
          filename,
          content,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    });
  } catch (error: any) {
    console.error(`Failed to send email for user ${userId}:`, error);
    throw new Error(`Failed to send report email: ${error.message}`);
  }
}