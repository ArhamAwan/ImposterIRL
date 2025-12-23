import sql from "@/app/api/utils/sql";

// Record game history for all players in the lobby
async function recordGameHistory(lobbyCode) {
  try {
    // Get all players in the lobby
    const players = await sql`
      SELECT p.id, p.name, s.total_score, s.survived_as_imposter, s.rounds_as_imposter
      FROM players p
      LEFT JOIN scores s ON p.id = s.player_id AND s.lobby_code = ${lobbyCode}
      WHERE p.lobby_code = ${lobbyCode}
    `;

    if (players.length < 2) return;

    // Find the winner (highest score)
    const sortedPlayers = [...players].sort((a, b) => 
      (b.total_score || 0) - (a.total_score || 0)
    );
    const winnerId = sortedPlayers[0]?.id;

    // For each player, create a game history entry with each opponent
    for (const player of players) {
      for (const opponent of players) {
        if (player.id === opponent.id) continue;

        const won = player.id === winnerId;
        const wasImposter = (player.rounds_as_imposter || 0) > 0;
        const survivedAsImposter = (player.survived_as_imposter || 0) > 0;
        // If was imposter and survived, they weren't caught
        const caughtAsImposter = wasImposter && !survivedAsImposter && (player.rounds_as_imposter || 0) > (player.survived_as_imposter || 0);

        await sql`
          INSERT INTO game_history (
            lobby_code,
            player_id,
            player_name,
            opponent_name,
            won,
            was_imposter,
            caught_as_imposter,
            survived_as_imposter,
            played_at
          ) VALUES (
            ${lobbyCode},
            ${player.id},
            ${player.name},
            ${opponent.name},
            ${won},
            ${wasImposter},
            ${caughtAsImposter},
            ${survivedAsImposter},
            NOW()
          )
        `;
      }
    }

    console.log(`Recorded game history for lobby ${lobbyCode}`);
  } catch (error) {
    console.error("Error recording game history:", error);
    // Don't throw - this is a non-critical operation
  }
}

export async function POST(request) {
  try {
    const { code, phase } = await request.json();

    if (!code || !phase) {
      return Response.json(
        { error: "Code and phase required" },
        { status: 400 },
      );
    }

    const [lobby] = await sql`
      SELECT * FROM lobbies WHERE code = ${code}
    `;

    if (!lobby) {
      return Response.json({ error: "Lobby not found" }, { status: 404 });
    }

    if (phase === "discussion") {
      await sql`
        UPDATE game_rounds
        SET phase = 'discussion', round_start_time = NOW()
        WHERE lobby_code = ${code} AND round_number = ${lobby.current_round}
      `;
    } else if (phase === "voting") {
      await sql`
        UPDATE game_rounds
        SET phase = 'voting'
        WHERE lobby_code = ${code} AND round_number = ${lobby.current_round}
      `;
    } else if (phase === "results") {
      // Calculate results
      const votes = await sql`
        SELECT voted_for_id, COUNT(*) as vote_count 
        FROM votes
        WHERE lobby_code = ${code}
        AND round_number = ${lobby.current_round}
        GROUP BY voted_for_id
        ORDER BY vote_count DESC
      `;

      const [currentRound] = await sql`
        SELECT imposter_id FROM game_rounds
        WHERE lobby_code = ${code}
        AND round_number = ${lobby.current_round}
      `;

      let eliminatedPlayerId = null;

      if (votes.length > 0) {
        eliminatedPlayerId = votes[0].voted_for_id;

        // Add to eliminated players
        await sql`
          INSERT INTO eliminated_players (lobby_code, round_number, player_id)
          VALUES (${code}, ${lobby.current_round}, ${eliminatedPlayerId})
          ON CONFLICT DO NOTHING
        `;

        // Update scores
        if (eliminatedPlayerId === currentRound.imposter_id) {
          // Imposter was caught - award points to correct voters
          const correctVoters = await sql`
            SELECT voter_id FROM votes
            WHERE lobby_code = ${code}
            AND round_number = ${lobby.current_round}
            AND voted_for_id = ${eliminatedPlayerId}
          `;

          for (const voter of correctVoters) {
            await sql`
              UPDATE scores 
              SET total_score = total_score + 100,
                  correct_votes = correct_votes + 1
              WHERE lobby_code = ${code}
              AND player_id = ${voter.voter_id}
            `;
          }
        } else {
          // Wrong person eliminated - imposter gets points
          await sql`
            UPDATE scores 
            SET total_score = total_score + 150,
                survived_as_imposter = survived_as_imposter + 1
            WHERE lobby_code = ${code}
            AND player_id = ${currentRound.imposter_id}
          `;
        }
      }

      // Update imposter stats
      await sql`
        UPDATE scores 
        SET rounds_as_imposter = rounds_as_imposter + 1
        WHERE lobby_code = ${code}
        AND player_id = ${currentRound.imposter_id}
      `;

      await sql`
        UPDATE game_rounds 
        SET phase = 'results', round_end_time = NOW()
        WHERE lobby_code = ${code} 
        AND round_number = ${lobby.current_round}
      `;
    } else if (phase === "next_round") {
      const nextRound = lobby.current_round + 1;

      if (nextRound > lobby.total_rounds) {
        // Game over
        await sql`
          UPDATE lobbies 
          SET status = 'finished'
          WHERE code = ${code}
        `;

        // Record game history for leaderboard
        await recordGameHistory(code);
      } else {
        // Start next round
        const players = await sql`
          SELECT id FROM players WHERE lobby_code = ${code}
        `;

        const [categoryData] = await sql`
          SELECT words FROM word_categories WHERE category = ${lobby.category}
        `;

        const imposter = players[Math.floor(Math.random() * players.length)];
        const word =
          categoryData.words[
            Math.floor(Math.random() * categoryData.words.length)
          ];

        await sql`
          UPDATE lobbies 
          SET current_round = ${nextRound}
          WHERE code = ${code}
        `;

        await sql`
          INSERT INTO game_rounds (lobby_code, round_number, imposter_id, word, category, phase, round_start_time)
          VALUES (${code}, ${nextRound}, ${imposter.id}, ${word}, ${lobby.category}, 'word_reveal', NOW())
        `;
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating phase:", error);
    return Response.json({ error: "Failed to update phase" }, { status: 500 });
  }
}
