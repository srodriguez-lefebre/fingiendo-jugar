import type { ComponentType } from "react";

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
  description?: string;
  featurePills: string[];
  actionLabel?: string;
  statusLabel?: string;
  tags: string[];
  status: GameStatus;
  route: `/games/${string}`;
  entryMode?: GameEntryMode;
  accent?: GameAccent;
  database?: GameDatabaseConfig;
  Game?: ComponentType;
};
