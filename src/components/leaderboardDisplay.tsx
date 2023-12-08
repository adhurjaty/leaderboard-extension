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

  const backgroundColor = (team: TeamResult, winType: 'guess' | 'time') => {
    if (winners && 'solid' in winners && winners.solid.includes(team)) {
      return convertToCssColor(SOLID_WIN_COLOR)
    }
    if (winType === 'guess' && winners?.guesses && winners.guesses.includes(team)) {
      return convertToCssColor(GUESS_WIN_COLOR)
    }
    if (winType === 'time' && winners?.time && winners.time.includes(team)) {
      return convertToCssColor(TIME_WIN_COLOR)
    }
    return 'inherit'
  }

  const teamsDisplay = (teams: TeamResult[], display: (team: TeamResult) => JSX.Element) => (
    <ul style={{
      lineHeight: '1.5em',
      listStyleType: 'none',
      paddingLeft: '0px',
    }}>
      {
        teams.map(team => display(team))
      }
    </ul>
  );

  const leaderboardDisplay = () => {
    const liStyle = (team: TeamResult, liColor: string) => ({
      fontWeight: team.teamName === teamName ? 'bold' : 'normal',
      backgroundColor: liColor,
      fontSize: '1.4em',
      padding: '0.25em 0em 0.25em 0.5em',
      marginBottom: '0.25em',
    } as const);

    const columns = [
      {
        heading: 'Time',
        teamResults: [...teamsPlayed]
          .sort((a, b) => (a.score!.time - b.score!.time) || (a.score!.guesses - b.score!.guesses)),
        liElement: (team: TeamResult) => (
          <li
            key={team.teamName}
            style={liStyle(team, backgroundColor(team, 'time'))}
          >
            {displayTimeResult(team)}
          </li>
        )
      },
      {
        heading: 'Guesses',
        teamResults: [...teamsPlayed]
          .sort((a, b) => (a.score!.guesses - b.score!.guesses) || (a.score!.time - b.score!.time)),
        liElement: (team: TeamResult) => (
          <li
            key={team.teamName}
            style={liStyle(team, backgroundColor(team, 'guess'))}
          >
            {displayGuessResult(team)}
          </li>
        )
      }
    ] as const

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
      }}>
        {
          columns.map(column => (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h3 
                key={column.heading}
                style={{
                  fontSize: '1.6em',
                  marginBottom: '0px',
                }}
              >
                {column.heading}
              </h3>
              {teamsDisplay(column.teamResults, column.liElement)}
            </div>
          ))
        }
      </div>
    );
  }

  const followContributeLink = () => {
    chrome.tabs.create({
      url: 'https://github.com/adhurjaty/leaderboard-extension'
    });
  }

  return (
    <div>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '0px',
      }}>
        Leaderboard: {mode}{isFinalResults() ? ' (Final)' : ''}
      </h2>
      {leaderboardDisplay()}
      {teamsRemaining.length > 0 && (
        <>
          <h3>
            Teams remaining
          </h3>
          <p>{teamsRemaining.map(team => team.teamName).join(', ')}</p>
        </>
      )}
      <div style={{
        display: 'inline-block',
        position: 'fixed',
        left: '100%',
        top: '100%',
        transform: 'translate(-100%, -100%)',
        whiteSpace: 'nowrap',
      }}>
        <p style={{
          fontSize: '1.1em',
          margin: '0px',
          padding: '15px',
          textAlign: 'right',
        }}>
          Wanna make this better?
          <br/>
          <a
            href="#"
            onClick={followContributeLink}
          >
            Contribute!
          </a>
        </p>
      </div>
    </div>
  )
};

export default LeaderboardDisplay;