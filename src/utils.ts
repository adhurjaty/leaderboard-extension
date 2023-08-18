import { TeamResult } from "./leaderboard";

type Winners =
  | {
    time: TeamResult[];
    guesses: TeamResult[];
  }
  | {
    solid: TeamResult[];
  }
  | null;

export const scoreboard: (_: TeamResult[]) => Winners = (teamsPlayed: TeamResult[]) => {
  if (teamsPlayed.length === 0) {
    return null;
  };

  const bestTime = Math.min(...teamsPlayed.map(x => x.score!.time));
  const fewestGuesses = Math.min(...teamsPlayed.map(x => x.score!.guesses));

  const timeLeaders = teamsPlayed.filter(x => x.score!.time === bestTime);
  const guessLeaders = teamsPlayed.filter(x => x.score!.guesses === fewestGuesses);
  const solidWinners = timeLeaders.filter(x => guessLeaders.includes(x));

  if (solidWinners.length > 0) {
    return {
      solid: solidWinners,
    };
  }

  return {
    time: timeLeaders,
    guesses: guessLeaders,
  };
};
