import prisma from "../db.js";

export default function preferencesRoute(app) {
  app.get("/users/:id/preferences", async (req, res) => {
    const user_id = Number(req.params.id);

    const pref = await prisma.userPreferences.findFirst({
      where: { user_id }
    });

    res.json(pref || {});
  });

  app.put("/users/:id/preferences", async (req, res) => {
    const user_id = Number(req.params.id);
    const { email, enabled, reminder_offset } = req.body;

    const pref = await prisma.userPreferences.upsert({
      where: { user_id },
      update: { email, enabled, reminder_offset },
      create: { user_id, email, enabled, reminder_offset }
    });

    res.json(pref);
  });
}
