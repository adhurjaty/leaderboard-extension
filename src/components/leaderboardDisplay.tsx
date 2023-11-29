import React from "react";
import { TeamResult } from "../leaderboard";
import GameMode from "../models/gameMode";
import { scoreboard } from "../utils"
import { GUESS_WIN_COLOR, SOLID_WIN_COLOR, TIME_WIN_COLOR, convertToCssColor } from "../colors";

interface Props {
  mode: GameMode;
  teamResults: TeamResult[];
  teamName: string;
}

const LeaderboardDisplay = ({ mode, teamResults, teamName }: Props) => {
  const teamsPlayed = teamResults.filter(team => team.score !== null);
  const teamsRemaining = teamResults.filter(team => team.score === null);
  const winners = scoreboard(teamsPlayed);

  const isFinalResults = () => teamResults.every(team => team.score !== null);

  const displayTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const displayTimeResult = (result: TeamResult) => {
    return `${result.teamName} - ${displayTime(result.score!.time)}`;
  }

  const displayGuessResult = (result: TeamResult) => {
    return `${result.teamName} - ${result.score!.guesses}`;
  }

  const backgroundColor = (team: TeamResult) => {
    if (winners && 'solid' in winners && winners.solid.includes(team)) {
      return convertToCssColor(SOLID_WIN_COLOR)
    }
    if (winners?.guesses && winners.guesses.includes(team)) {
      return convertToCssColor(GUESS_WIN_COLOR)
    }
    if (winners?.time && winners.time.includes(team)) {
      return convertToCssColor(TIME_WIN_COLOR)
    }
    return 'inherit'
  }

  const teamsDisplay = (teams: TeamResult[], display: (teeam: TeamResult) => string) => (
    <ul>
      {
        teams.map(team => (
          <li
            key={team.teamName}
            style={{
              fontWeight: team.teamName === teamName ? 'bold' : 'normal',
              backgroundColor: backgroundColor(team)
            }}
          >
            {display(team)}
          </li>
        ))
      }
    </ul>
  );

  const leaderboardDisplay = () => {
    const columns = [
      {
        heading: 'Time',
        teamResults: [...teamsPlayed]
          .sort((a, b) => a.score!.time - b.score!.time),
        displayFn: displayTimeResult
      },
      {
        heading: 'Guesses',
        teamResults: [...teamsPlayed]
          .sort((a, b) => a.score!.guesses - b.score!.guesses),
        displayFn: displayGuessResult
      }
    ] as const

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}>
        {
          columns.map(column => (
            <div style={{
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 key={column.heading}>{column.heading}</h3>
              {teamsDisplay(column.teamResults, column.displayFn)}
            </div>
          ))
        }
      </div>
    );
  }

  return (
    <div>
      <h2>Leaderboard: {mode}{isFinalResults() ? ' (Final)' : ''}</h2>
      {leaderboardDisplay()}
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