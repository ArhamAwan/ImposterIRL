import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const playerName = url.searchParams.get("player_name");

    if (!playerName) {
      return new Response(
        JSON.stringify({ error: "player_name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get aggregated stats for all players the user has played with
    const stats = await sql`
      SELECT 
        opponent_name,
        COUNT(*) as games_played,
        SUM(CASE WHEN won THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN was_imposter AND caught_as_imposter THEN 1 ELSE 0 END) as times_caught_as_imposter,
        SUM(CASE WHEN was_imposter AND survived_as_imposter THEN 1 ELSE 0 END) as times_survived_as_imposter,
        SUM(CASE WHEN was_imposter THEN 1 ELSE 0 END) as times_was_imposter,
        MAX(played_at) as last_played
      FROM game_history
      WHERE LOWER(player_name) = LOWER(${playerName})
      GROUP BY opponent_name
      ORDER BY games_played DESC, wins DESC
    `;

    // Calculate additional stats
    const leaderboard = stats.map((player) => ({
      opponent_name: player.opponent_name,
      games_played: parseInt(player.games_played),
      wins: parseInt(player.wins),
      losses: parseInt(player.games_played) - parseInt(player.wins),
      win_rate: player.games_played > 0 
        ? Math.round((parseInt(player.wins) / parseInt(player.games_played)) * 100) 
        : 0,
      times_caught_as_imposter: parseInt(player.times_caught_as_imposter),
      times_survived_as_imposter: parseInt(player.times_survived_as_imposter),
      times_was_imposter: parseInt(player.times_was_imposter),
      last_played: player.last_played,
    }));

    // Also get the user's own overall stats
    const userStats = await sql`
      SELECT 
        COUNT(*) as total_games,
        SUM(CASE WHEN won THEN 1 ELSE 0 END) as total_wins,
        SUM(CASE WHEN was_imposter THEN 1 ELSE 0 END) as times_imposter,
        SUM(CASE WHEN was_imposter AND survived_as_imposter THEN 1 ELSE 0 END) as times_survived
      FROM game_history
      WHERE LOWER(player_name) = LOWER(${playerName})
    `;

    const ownStats = userStats[0] || {
      total_games: 0,
      total_wins: 0,
      times_imposter: 0,
      times_survived: 0,
    };

    return new Response(
      JSON.stringify({
        player_name: playerName,
        own_stats: {
          total_games: parseInt(ownStats.total_games) || 0,
          total_wins: parseInt(ownStats.total_wins) || 0,
          win_rate: ownStats.total_games > 0 
            ? Math.round((parseInt(ownStats.total_wins) / parseInt(ownStats.total_games)) * 100) 
            : 0,
          times_imposter: parseInt(ownStats.times_imposter) || 0,
          times_survived: parseInt(ownStats.times_survived) || 0,
        },
        leaderboard,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch leaderboard" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

