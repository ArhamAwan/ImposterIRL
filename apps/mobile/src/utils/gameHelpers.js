export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function calculateVoteCounts(votes) {
  const voteCountsMap = {};
  votes?.forEach((vote) => {
    voteCountsMap[vote.voted_for_id] =
      (voteCountsMap[vote.voted_for_id] || 0) + 1;
  });
  return voteCountsMap;
}

export function getVoteResults(voteCountsMap, players) {
  return Object.entries(voteCountsMap)
    .map(([playerId, count]) => ({
      player: players.find((p) => String(p.id) === playerId),
      votes: count,
    }))
    .sort((a, b) => b.votes - a.votes);
}

export function getActivePlayers(players, eliminatedIds) {
  return players.filter((p) => !eliminatedIds?.includes(p.id));
}
