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

    const [round] = await sql`
      SELECT *, 
        EXTRACT(EPOCH FROM (NOW() - round_start_time)) as elapsed_seconds
      FROM game_rounds
      WHERE lobby_code = ${code} AND round_number = ${lobby.current_round}
    `;

    const players = await sql`
      SELECT id, name, avatar_color, is_host
      FROM players
      WHERE lobby_code = ${code}
      ORDER BY joined_at ASC
    `;

    const eliminated = await sql`
      SELECT player_id FROM eliminated_players
      WHERE lobby_code = ${code}
    `;

    const eliminatedIds = eliminated.map((e) => e.player_id);

    const votes = await sql`
      SELECT voter_id, voted_for_id FROM votes
      WHERE lobby_code = ${code} AND round_number = ${lobby.current_round}
    `;

    const scores = await sql`
      SELECT player_id, total_score FROM scores
      WHERE lobby_code = ${code}
    `;

    return Response.json({
      lobby,
      round,
      players,
      eliminatedIds,
      votes,
      scores,
    });
  } catch (error) {
    console.error("Error fetching game state:", error);
    return Response.json(
      { error: "Failed to fetch game state" },
      { status: 500 },
    );
  }
}
