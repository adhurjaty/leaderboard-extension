import React from "react";
import { Score, TeamResult } from "../leaderboard";
import GameMode from "../models/gameMode";

type Winners =
  | {
    time: TeamResult;
    guesses: TeamResult;
  }
  | {
    solid: TeamResult;
  }
  | null;

interface Props {
  mode: GameMode;
  teamResults: TeamResult[];
}

const LeaderboardDisplay = ({ mode, teamResults }: Props) => {
  const isFinalResults = () => teamResults.every(team => team.score !== null);

  const displayTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const displayScore = (score: Score) => {
    return `${displayTime(score.time)} | ${score.guesses} guesses`;
  };

  const displayResult = (result: TeamResult) => {
    return `${result.teamName} - ${displayScore(result.score!)}`;
  }

  const wonTime = () => isFinalResults() ? 'Won time' : 'Winning time';
  const wonGuesses = () => isFinalResults() ? 'Won guesses' : 'Winning guesses';
  const solidWin = () => isFinalResults() ? 'Solid win' : 'Solidly winning';

  const teamsPlayed = teamResults.filter(team => team.score !== null);
  const teamsRemaining = teamResults.filter(team => team.score === null);

  const scoreboard : () => Winners = () => {
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
  }

  const winnersDisplay = () => {
    const winners = scoreboard();

    if (!winners) {
      return (<></>);
    }

    if ('solid' in winners) {
      return (
        <div>
          <h3>{solidWin()}</h3>
          <p>{displayResult(winners.solid)}</p>
        </div>
      );
    }

    return (
      <div>
        <h3>{wonTime()}</h3>
        <p>{displayResult(winners.time)}</p>
        <h3>{wonGuesses()}</h3>
        <p>{displayResult(winners.guesses)}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Leaderboard: {mode}{isFinalResults() ? ' (Final)' : ''}</h2>
      {winnersDisplay()}
      {teamsRemaining.length > 0 && (
        <>
          <h3>Teams remaining</h3>
          <p>{teamsRemaining.map(team => team.teamName).join(', ')}</p>
        </>
      )}
    </div>
  )
};

export default LeaderboardDisplay;