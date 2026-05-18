import { NextRequest, NextResponse } from "next/server";

import { impostorDatabaseConfig } from "@/games/impostor/config";
import { getDatabase, getEscapedGameTableName } from "@/lib/platform/database";

type WordRow = {
  word: string;
  hint: string;
};

const MAX_WORDS_PER_ROUND = 7;

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("categoryId")?.trim();
  const count = clampCount(Number(request.nextUrl.searchParams.get("count") ?? 1));

  if (!categoryId) {
    return NextResponse.json(
      { error: "categoryId is required." },
      { status: 400 },
    );
  }

  try {
    const sql = getDatabase();
    const tableName = getEscapedGameTableName(impostorDatabaseConfig);

    const words = await sql.query(
      `
        select
          word,
          clue as hint
        from ${tableName}
        where category_id = $1
        order by random()
        limit $2
      `,
      [categoryId, count],
    ) as WordRow[];

    if (words.length < count) {
      return NextResponse.json(
        { error: "Not enough words for this category." },
        { status: 404 },
      );
    }

    return NextResponse.json({ words });
  } catch {
    return NextResponse.json(
      { error: "Could not load impostor words." },
      { status: 500 },
    );
  }
}

function clampCount(count: number) {
  if (!Number.isFinite(count)) {
    return 1;
  }

  return Math.max(1, Math.min(Math.floor(count), MAX_WORDS_PER_ROUND));
}
