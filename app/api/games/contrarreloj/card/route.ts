import { NextResponse } from "next/server";

import { contrarrelojDatabaseConfig } from "@/games/contrarreloj/config";
import { CONTRARRELOJ_MOCK_PHRASES } from "@/games/contrarreloj/data/mock-phrases";
import { getDatabase, getEscapedGameTableName, hasDatabaseUrl } from "@/lib/platform/database";

type PhraseRow = {
  phrase: string;
};

type CardSource = "database" | "mock";

type LoadedCard = {
  phrases: string[];
  source: CardSource;
};

const PHRASES_PER_CARD = 5;

export async function GET() {
  const card = await loadPhrases();

  return NextResponse.json(card);
}

async function loadPhrases(): Promise<LoadedCard> {
  if (!hasDatabaseUrl()) {
    return buildMockCard();
  }

  try {
    const sql = getDatabase();
    const tableName = getEscapedGameTableName(contrarrelojDatabaseConfig);
    const rows = await sql.query(
      `
        select phrase
        from (
          select distinct btrim(phrase) as phrase
          from ${tableName}
          where btrim(phrase) <> ''
        ) as available_phrases
        order by random()
        limit $1
      `,
      [PHRASES_PER_CARD],
    ) as PhraseRow[];
    const phrases = rows
      .map((row) => row.phrase.trim())
      .filter(Boolean)
      .slice(0, PHRASES_PER_CARD);

    if (phrases.length === PHRASES_PER_CARD) {
      return { phrases, source: "database" };
    }
  } catch {
    return buildMockCard();
  }

  return buildMockCard();
}

function buildMockCard() {
  return {
    phrases: shuffle([...CONTRARRELOJ_MOCK_PHRASES]).slice(0, PHRASES_PER_CARD),
    source: "mock" as const,
  };
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}
