import cron from "node-cron";
import prisma from "../db.js";

// Starts the reminder worker. Currently schedules a simple cron job
// that runs every minute and logs activity. This is a safe placeholder
// to avoid registering routes from the scheduler file and to prevent
// `app` being undefined when `startWorker()` is invoked from `server.js`.
export default function startWorker() {
  // Processing function: find due jobs, create a Notification, mark processed.
  async function processDueJobs() {
    console.log("[reminderWorker] tick - checking for due reminders...");
    try {
      const dueJobs = await prisma.job.findMany({
        where: { processed: false, fire_at: { lte: new Date() } }
      });

      for (const job of dueJobs) {
        // Create a notification for the job
        await prisma.notification.create({
          data: {
            user_id: job.user_id,
            message: `Reminder for task ${job.task_id}`,
            status: "queued",
            task_id: job.task_id,
          }
        });

        // Mark job processed
        await prisma.job.update({ where: { id: job.id }, data: { processed: true } });

        console.log(`[reminderWorker] processed job ${job.id} (task ${job.task_id})`);
      }

    } catch (err) {
      console.error("[reminderWorker] error:", err);
    }
  }

  // Run immediately once so tests can verify behavior without waiting for the cron tick.
  processDueJobs().catch(err => console.error("[reminderWorker] initial run error:", err));

  // Schedule to run every minute
  cron.schedule("* * * * *", processDueJobs);

  console.log("Reminder worker started (cron scheduled every minute)");
}
