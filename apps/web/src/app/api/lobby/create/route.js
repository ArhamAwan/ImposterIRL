import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { playerName, playerId } = await request.json();

    if (!playerName || !playerId) {
      return Response.json(
        { error: "Player name and ID required" },
        { status: 400 },
      );
    }

    // Generate unique 6-character code
    const code = generateLobbyCode();

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

    // Create lobby
    await sql`
      INSERT INTO lobbies (code, host_player_id, status)
      VALUES (${code}, ${playerId}, 'waiting')
    `;

    // Add host as first player
    await sql`
      INSERT INTO players (id, lobby_code, name, avatar_color, is_host)
      VALUES (${playerId}, ${code}, ${playerName}, ${avatarColor}, true)
    `;

    // Initialize scores
    await sql`
      INSERT INTO scores (lobby_code, player_id)
      VALUES (${code}, ${playerId})
    `;

    return Response.json({
      code,
      playerId,
      playerName,
      avatarColor,
      isHost: true,
    });
  } catch (error) {
    console.error("Error creating lobby:", error);
    return Response.json({ error: "Failed to create lobby" }, { status: 500 });
  }
}

function generateLobbyCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
