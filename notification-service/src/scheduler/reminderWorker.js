import cron from "node-cron";
import prisma from "../db.js";
import { mailer } from "../utils/email.js";

export default function startWorker() {
  async function processDueJobs() {
    console.log("[reminderWorker] tick - checking for due reminders...");

    try {
      const dueJobs = await prisma.job.findMany({
        where: { processed: false, fire_at: { lte: new Date() } },
      });

      for (const job of dueJobs) {
        const message = job.task_title
          ? `Reminder: ${job.task_title}`
          : `Reminder for task ${job.task_id}`;

        // Create notification
        await prisma.notification.create({
          data: {
            user_id: job.user_id,
            message,
            status: "sent",
            task_id: job.task_id,
          },
        });

        // Send email directly (no queue)
        if (job.user_email) {
          try {
            await mailer.sendMail({
              from: process.env.EMAIL_FROM,
              to: job.user_email,
              subject: `Task Reminder: ${job.task_title}`,
              text: `Your task "${job.task_title}" is due on ${job.fire_at}.`,
            });

            console.log("Email sent to:", job.user_email);
          } catch (err) {
            console.error("Email sending failed:", err);
          }
        }

        // Mark job processed
        await prisma.job.update({
          where: { id: job.id },
          data: { processed: true },
        });

        console.log(`[reminderWorker] processed job ${job.id}`);
      }
    } catch (err) {
      console.error("[reminderWorker] error:", err);
    }
  }

  // Run immediately once
  processDueJobs().catch((err) =>
    console.error("[reminderWorker] initial run error:", err)
  );

  // Run every minute
  cron.schedule("* * * * *", processDueJobs);

  console.log("Reminder worker started (cron scheduled every minute)");
}