import sql from "@/app/api/utils/sql";

export async function action({ request }) {
  try {
    const { code, playerName, playerId } = await request.json();

    if (!code || !playerName || !playerId) {
      return Response.json(
        { error: "Code, player name, and ID required" },
        { status: 400 }
      );
    }

    // Check if lobby exists
    const [lobby] = await sql`
      SELECT * FROM lobbies WHERE code = ${code.toUpperCase()}
    `;

    if (!lobby) {
      return Response.json({ error: "Lobby not found" }, { status: 404 });
    }

    if (lobby.status !== "waiting") {
      return Response.json({ error: "Game already started" }, { status: 400 });
    }

    // Check player count
    const players = await sql`
      SELECT COUNT(*) as count FROM players WHERE lobby_code = ${code.toUpperCase()}
    `;

    if (players[0].count >= 10) {
      return Response.json({ error: "Lobby is full" }, { status: 400 });
    }

    // Random avatar color
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    // Add player
    await sql`
      INSERT INTO players (id, lobby_code, name, avatar_color, is_host)
      VALUES (${playerId}, ${code.toUpperCase()}, ${playerName}, ${avatarColor}, false)
    `;

    // Initialize scores
    await sql`
      INSERT INTO scores (lobby_code, player_id)
      VALUES (${code.toUpperCase()}, ${playerId})
    `;

    return Response.json({
      code: code.toUpperCase(),
      playerId,
      playerName,
      avatarColor,
      isHost: false,
    });
  } catch (error) {
    console.error("Error joining lobby:", error);
    return Response.json({ error: "Failed to join lobby" }, { status: 500 });
  }
}
