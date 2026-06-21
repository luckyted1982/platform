import { createRouter, publicQuery } from "./middleware";
import { projectRouter } from "./routes/project";
import { researchRouter } from "./routes/research";
import { platformRouter } from "./routes/platform";
import { aiAssistantRouter } from "./routes/aiAssistant";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  project: projectRouter,
  research: researchRouter,
  platform: platformRouter,
  aiAssistant: aiAssistantRouter,
});

export type AppRouter = typeof appRouter;
