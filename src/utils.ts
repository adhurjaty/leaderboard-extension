import { TeamResult } from "./leaderboard";

type Winners =
  | {
    time: TeamResult[];
    guesses: TeamResult[];
  }
  | {
    solid: TeamResult[];
    time?: TeamResult[];
    guesses?: TeamResult[];
  }
  | null;

export const scoreboard: (_: TeamResult[]) => Winners = (teamsPlayed: TeamResult[]) => {
  if (teamsPlayed.length === 0) {
    return null;
  };

  const bestTime = Math.min(...teamsPlayed.map(x => x.score!.time));
  const fewestGuesses = Math.min(...teamsPlayed.map(x => x.score!.guesses));

  const solidWinners = teamsPlayed
    .filter(x =>
      x.score!.time === bestTime && x.score!.guesses === fewestGuesses
    );
  const timeLeaders = teamsPlayed
    .filter(x =>
      x.score!.time === bestTime && !solidWinners.includes(x)
    );
  const guessLeaders = teamsPlayed
    .filter(x =>
      x.score!.guesses === fewestGuesses && !solidWinners.includes(x)
    );

  if (solidWinners.length > 0) {
    return {
      solid: solidWinners,
      time: timeLeaders.length > 0 ? timeLeaders : undefined,
      guesses: guessLeaders.length > 0 ? guessLeaders : undefined,
    };
  }

  return {
    time: timeLeaders,
    guesses: guessLeaders,
  };
};
