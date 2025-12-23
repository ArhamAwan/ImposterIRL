import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { code } = params;

    const [lobby] = await sql`
      SELECT * FROM lobbies WHERE code = ${code}
    `;

    if (!lobby) {
      return Response.json({ error: "Lobby not found" }, { status: 404 });
    }

    const players = await sql`
      SELECT id, name, avatar_color, is_host
      FROM players
      WHERE lobby_code = ${code}
      ORDER BY joined_at ASC
    `;

    return Response.json({
      lobby,
      players,
    });
  } catch (error) {
    console.error("Error fetching lobby:", error);
    return Response.json({ error: "Failed to fetch lobby" }, { status: 500 });
  }
}
