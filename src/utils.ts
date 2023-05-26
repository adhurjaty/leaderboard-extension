import { TeamResult } from "./leaderboard";

type Winners =
  | {
    time: TeamResult;
    guesses: TeamResult;
  }
  | {
    solid: TeamResult;
  }
  | null;

export const scoreboard: (_: TeamResult[]) => Winners = (teamsPlayed: TeamResult[]) => {
  if (teamsPlayed.length === 0) {
    return null;
  };

  const timeLeader = teamsPlayed
    .reduce((prev, curr) => {
      return prev.score!.time < curr.score!.time ? prev : curr;
    }, teamsPlayed[0]);

  const guessLeader = teamsPlayed
    .reduce((prev, curr) => {
      return prev.score!.guesses < curr.score!.guesses ? prev : curr;
    }, teamsPlayed[0]);

  if (timeLeader === guessLeader) {
    return {
      solid: timeLeader,
    };
  }

  return {
    time: timeLeader,
    guesses: guessLeader,
  };
};
