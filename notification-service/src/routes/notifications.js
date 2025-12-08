import prisma from "../db.js";

export default function notificationsRoute(app) {
  app.get("/notifications", async (req, res) => {
    const user_id = Number(req.query.user_id || 1);

    const notifications = await prisma.notification.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" }
    });

    res.json(notifications);
  });
}
