import cron from "node-cron";
import prisma from "../db.js";
import { mailer } from "../utils/email.js";

export default function startWorker() {
  queue.process(async (job) => {
    const { taskId, title, dueDate, userEmail } = job.data;

    // 1. Store notification in DB
    await prisma.notification.create({
      data: {
        task_id: taskId,
        message: `Reminder: ${title} is due soon`,
      },
    });

    // 2. Send Email if email is provided
    if (userEmail) {
      try {
        await mailer.sendMail({
          from: process.env.EMAIL_FROM,
          to: userEmail,
          subject: `Task Reminder: ${title}`,
          text: `Your task "${title}" is due on ${dueDate}.`,
        });

        console.log("Email sent to:", userEmail);
      } catch (err) {
        console.error("Email sending failed:", err);
      }
    }

    return true;
  });

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

        // Create a notification (status queued)
        await prisma.notification.create({
          data: {
            user_id: job.user_id,
            message,
            status: "queued",
            task_id: job.task_id,
          },
        });

        // Add job to queue — triggers email + DB write
        await queue.add({
          taskId: job.task_id,
          title: job.task_title,
          dueDate: job.fire_at,
          userEmail: job.user_email,
        });

        // Mark job processed so it does not run again
        await prisma.job.update({
          where: { id: job.id },
          data: { processed: true },
        });

        console.log(
          `[reminderWorker] processed job ${job.id} (task ${job.task_id})`
        );
      }
    } catch (err) {
      console.error("[reminderWorker] error:", err);
    }
  }

  // Run immediately (no waiting for cron)
  processDueJobs().catch((err) =>
    console.error("[reminderWorker] initial run error:", err)
  );

  // Run every 1 minute
  cron.schedule("* * * * *", processDueJobs);

  console.log("Reminder worker started (cron scheduled every minute)");
}
