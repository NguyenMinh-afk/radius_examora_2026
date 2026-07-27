/**
 * Test Email Script - Kiểm tra Gmail SMTP credentials
 * Run: node scripts/test-email.mjs
 */
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  // Port 587 = STARTTLS (secure=false), Port 465 = SSL (secure=true)
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const TEST_EMAIL = process.argv[2] || process.env.SMTP_USER;

async function testEmail() {
  console.log("=".repeat(60));
  console.log("EXAMORA EMAIL TEST SCRIPT");
  console.log("=".repeat(60));
  console.log(`\nSMTP Configuration:`);
  console.log(`  Host: ${SMTP_CONFIG.host}`);
  console.log(`  Port: ${SMTP_CONFIG.port}`);
  console.log(`  Secure: ${SMTP_CONFIG.secure}`);
  console.log(`  User: ${SMTP_CONFIG.auth.user}`);
  console.log(`  Test Email: ${TEST_EMAIL}`);
  console.log();

  const transporter = nodemailer.createTransport(SMTP_CONFIG);

  try {
    console.log("Testing SMTP connection...");
    const verifyResult = await transporter.verify();
    console.log(`  Connection: ${verifyResult ? "SUCCESS" : "FAILED"}`);

    console.log("\nSending test email...");
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || SMTP_CONFIG.auth.user,
      to: TEST_EMAIL,
      subject: "Examora - Email Test",
      text: "This is a test email from Examora Notification System.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Examora Email Test</h1>
          <p>This is a test email from the <strong>Examora Notification System</strong>.</p>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Sent at: ${new Date().toISOString()}<br>
            Service: Notification_Service
          </p>
        </div>
      `,
    });

    console.log(`\nEmail sent successfully!`);
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Accepted: ${info.accepted.join(", ") || "none"}`);
    console.log(`  Rejected: ${info.rejected.join(", ") || "none"}`);
    console.log("\n" + "=".repeat(60));
    console.log("TEST PASSED - Email system is working!");
    console.log("=".repeat(60));
    return true;
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("TEST FAILED - Email error:");
    console.error("=".repeat(60));
    console.error(`  Code: ${error.code}`);
    console.error(`  Message: ${error.message}`);
    if (error.code === "EAUTH") {
      console.error("\n  → Authentication failed. Please check:");
      console.error("     1. SMTP_USER and SMTP_PASS in .env");
      console.error("     2. Gmail: Enable 2FA and use App Password");
      console.error("     3. Gmail: Allow Less Secure Apps (not recommended)");
    }
    if (error.code === "ECONNECTION") {
      console.error("\n  → Connection failed. Please check:");
      console.error("     1. SMTP_HOST and SMTP_PORT are correct");
      console.error("     2. Network/firewall allows outbound SMTP");
    }
    return false;
  }
}

testEmail()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
