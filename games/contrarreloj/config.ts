import type { GameDatabaseConfig } from "@/lib/platform/game-types";

export const contrarrelojDatabaseConfig = {
  provider: "neon",
  tableName: "contrarreloj",
  access: "read-only",
} satisfies GameDatabaseConfig;
