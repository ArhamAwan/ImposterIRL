import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const categories = await sql`
      SELECT category FROM word_categories ORDER BY category ASC
    `;

    return Response.json({ categories: categories.map((c) => c.category) });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
