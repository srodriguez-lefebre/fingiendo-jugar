import type { ComponentType } from "react";

export type GameStatus = "playable" | "hidden" | "coming-soon";

export type GameEntryMode = "intro" | "direct";

export type GameManifest = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
  tags: string[];
  status: GameStatus;
  route: `/games/${string}`;
  entryMode?: GameEntryMode;
  accent?: "violet" | "mint" | "amber" | "rose";
  Game?: ComponentType;
};
