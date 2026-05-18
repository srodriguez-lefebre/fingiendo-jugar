import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type GameStatus = "playable" | "hidden" | "coming-soon";

export type GameEntryMode = "intro" | "direct";

export type GameAccent = "violet" | "mint" | "amber" | "rose";

export type GameDatabaseConfig = {
  provider: "neon";
  tableName: string;
  access: "read-only" | "read-write";
};

export type GameManifest = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description?: string | string[];
  featurePills: string[];
  actionLabel?: string;
  statusLabel?: string;
  tags: string[];
  status: GameStatus;
  route: `/games/${string}`;
  entryMode?: GameEntryMode;
  accent?: GameAccent;
  icon?: LucideIcon;
  database?: GameDatabaseConfig;
  Game?: ComponentType;
};
