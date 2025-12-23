import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { code, playerId, votedForId } = await request.json();

    if (!code || !playerId || !votedForId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [lobby] = await sql`
      SELECT current_round FROM lobbies WHERE code = ${code}
    `;

    if (!lobby) {
      return Response.json({ error: "Lobby not found" }, { status: 404 });
    }

    // Check if already voted
    const existingVote = await sql`
      SELECT id FROM votes
      WHERE lobby_code = ${code} AND round_number = ${lobby.current_round} AND voter_id = ${playerId}
    `;

    if (existingVote.length > 0) {
      // Update vote
      await sql`
        UPDATE votes
        SET voted_for_id = ${votedForId}
        WHERE lobby_code = ${code} AND round_number = ${lobby.current_round} AND voter_id = ${playerId}
      `;
    } else {
      // Insert vote
      await sql`
        INSERT INTO votes (lobby_code, round_number, voter_id, voted_for_id)
        VALUES (${code}, ${lobby.current_round}, ${playerId}, ${votedForId})
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error submitting vote:", error);
    return Response.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}
