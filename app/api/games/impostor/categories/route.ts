import { NextResponse } from "next/server";

import { impostorDatabaseConfig } from "@/games/impostor/config";
import { getDatabase, getEscapedGameTableName } from "@/lib/platform/database";

type CategoryRow = {
  id: string;
  label: string;
  word_count: number;
};

export async function GET() {
  try {
    const sql = getDatabase();
    const tableName = getEscapedGameTableName(impostorDatabaseConfig);

    const categories = await sql.query(
      `
        select
          category_id as id,
          min(category_name) as label,
          count(*)::int as word_count
        from ${tableName}
        group by category_id
        order by label
      `,
    ) as CategoryRow[];

    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category.id,
        label: category.label,
        wordCount: category.word_count,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load impostor categories." },
      { status: 500 },
    );
  }
}
