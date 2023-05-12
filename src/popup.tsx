import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSettings, saveSettings } from "./store";
import Settings from "./models/settings";
import EditSettings from "./components/editSettings";
import DisplaySettings from "./components/displaySettings";
import GameMode from "./models/gameMode";
import { SpreadsheetClient } from "./sheets/spreadsheetClient";
import ApiClient from "./sheets/apiClient";
import { Leaderboard, TeamResult } from "./leaderboard";
import LeaderboardDisplay from "./components/leaderboardDisplay";

const defaultSettings = {
  teamName: "",
  sheetId: "",
};

const Popup = () => {
  const [editMode, setEditMode] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [spreadsheetClient, setSpreadsheetClient] = useState<SpreadsheetClient | null>(null);
  const [scoreboard, setScoreboard] = useState<TeamResult[]>([]);
  const [currentMode, setCurrentMode] = useState<GameMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSettings().then(settings => {
      setSettings(settings);
    }).catch((err) => setError(err.message ?? err));
  }, []);

  useEffect(() => {
    if (settings.sheetId) {
      chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        const apiClient = new ApiClient(
          `https://sheets.googleapis.com/v4/spreadsheets/${settings.sheetId ?? ''}`,
          token
        );
        SpreadsheetClient.create(apiClient)
          .then((client) => setSpreadsheetClient(client))
          .catch((err) => setError(err.message ?? err));
      });
    }
  }, [settings])

  const onSaveSettings = async (newSettings: Settings) => {
    setError(null);
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
      setEditMode(false);
    } catch (err) {
      console.log('error saving settings', err);
      setError((err as Error).message ?? err);
    }
  }

  const onClickUpdate = () => {
    setError(null);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (!tab.id) {
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          function byXpath(xp: string): Node | null {
            return document.evaluate(
              xp, document, null,
              XPathResult.FIRST_ORDERED_NODE_TYPE, null
            ).singleNodeValue
          }
          
          const content = byXpath('//*[text()="You got it! 🎉🎉🎉"]/following-sibling::p');
          const parsed = content?.textContent?.match(/\((.*?)\)/)
          if (!parsed || parsed.length < 2) {
            return;
          }
          const score = parsed[1];
          console.log('Score:', score);

          const modeSelect = document.getElementById('difficulty-changer');
          const mode = modeSelect?.className as GameMode;
          console.log('Mode:', mode);

          return {
            score,
            mode,
          }
        },
      }, async (res) => {
        if (!res || res.length < 1) {
          return;
        }
        if (!spreadsheetClient) {
          setError(`Could not connect to spreadsheet ${settings.sheetId}`);
          return;
        }
        const { score, mode } = res[0].result;
        setIsSubmitting(true);
        setCurrentMode(mode);

        try {
          const sheetClient = spreadsheetClient.getSheet(mode);
          if (!sheetClient) {
            throw new Error(`Could not find sheet for mode ${mode}`);
          }

          const leaderboard = new Leaderboard(sheetClient, settings.teamName);
          await leaderboard.inputScore(score);

          const teamResults = await leaderboard.getScores();
          setScoreboard(teamResults);
        } catch (err) {
          setError((err as Error).message ?? err)
        } finally {
          setIsSubmitting(false);
        }
      });
    });
  }

  const followLink = () => {
    if (!spreadsheetClient) {
      setError(`Could not connect to spreadsheet ${settings.sheetId}`);
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (!tab.id) {
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const modeSelect = document.getElementById('difficulty-changer');
          return modeSelect?.className as GameMode;
        },
      }, (res) => {
        if (!res || res.length < 1) {
          return;
        }

        const mode = res[0].result;
        const currentSheetId = spreadsheetClient.getSheet(mode)?.sheetId;
        chrome.tabs.create({
          url: `https://docs.google.com/spreadsheets/d/${settings.sheetId}/edit#gid=${currentSheetId ?? 0}`
        });
      });
    });
  };

  return (
    <div style={{
      minWidth: '400px',
    }}>
      {editMode && (
        <EditSettings
          settings={settings}
          setSettings={onSaveSettings}
          onCancel={() => setEditMode(false)}
        /> 
      ) || (
        <DisplaySettings
          settings={settings}
          onEdit={() => setEditMode(true)}
          followLink={followLink}
        />
      )}
      {error && <p style={{color: "red"}}>{error}</p>}
      <hr />
      <button onClick={onClickUpdate} disabled={isSubmitting}>Update Spreadsheet</button>
      {currentMode && scoreboard && scoreboard.length > 0 && (
        <>
          <hr />
          <LeaderboardDisplay teamResults={scoreboard} mode={currentMode} />
        </>
      )}

    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
