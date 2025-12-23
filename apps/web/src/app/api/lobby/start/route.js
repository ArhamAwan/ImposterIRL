import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { code, category, roundDuration, totalRounds } = await request.json();

    if (!code || !category) {
      return Response.json(
        { error: "Code and category required" },
        { status: 400 },
      );
    }

    // Get lobby and verify host
    const [lobby] = await sql`
      SELECT * FROM lobbies WHERE code = ${code}
    `;

    if (!lobby) {
      return Response.json({ error: "Lobby not found" }, { status: 404 });
    }

    // Get all players
    const players = await sql`
      SELECT id FROM players WHERE lobby_code = ${code}
    `;

    if (players.length < 2) {
      return Response.json(
        { error: "Need at least 2 players" },
        { status: 400 },
      );
    }

    // Get random word from category
    const [categoryData] = await sql`
      SELECT words FROM word_categories WHERE category = ${category}
    `;

    if (!categoryData) {
      return Response.json({ error: "Invalid category" }, { status: 400 });
    }

    const words = categoryData.words;
    const word = words[Math.floor(Math.random() * words.length)];

    // Select random imposter
    const imposter = players[Math.floor(Math.random() * players.length)];

    // Update lobby settings
    await sql`
      UPDATE lobbies
      SET status = 'playing',
          category = ${category},
          round_duration = ${roundDuration || 300},
          total_rounds = ${totalRounds || 3},
          current_round = 1
      WHERE code = ${code}
    `;

    // Create first round
    await sql`
      INSERT INTO game_rounds (lobby_code, round_number, imposter_id, word, category, phase, round_start_time)
      VALUES (${code}, 1, ${imposter.id}, ${word}, ${category}, 'word_reveal', NOW())
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error starting game:", error);
    return Response.json({ error: "Failed to start game" }, { status: 500 });
  }
}
