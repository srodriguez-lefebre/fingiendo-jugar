import type { GameDatabaseConfig } from "@/lib/platform/game-types";

export const impostorDatabaseConfig = {
  provider: "neon",
  tableName: "impostor",
  access: "read-only",
} satisfies GameDatabaseConfig;
