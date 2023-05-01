import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSettings, saveSettings } from "./store";
import Settings from "./models/settings";
import EditSettings from "./components/editSettings";
import DisplaySettings from "./components/displaySettings";
import updateLeaderboard from "./spreadsheet";
import { GameMode } from "./leaderboard";

const defaultSettings = {
  teamName: "",
  sheetId: "",
};

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  const [editMode, setEditMode] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() });
  }, [count]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  useEffect(() => {
    getSettings().then(settings => {
      setSettings(settings);
    }).catch((err) => setError(err.message ?? err));
  }, []);

  const onSaveSettings = async (newSettings: Settings) => {
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
      setEditMode(false);
    } catch (err) {
      console.log('error saving settings', err);
      setError((err as Error).message ?? err);
    }
  }

  const login = () => {
    console.log('here');
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      console.log(token);
    });
  };

  const onClickUpdate = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (!tab.id) {
        return;
      }

      let score: string | undefined;
      let mode: GameMode | undefined;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          function byXpath(xp: string) {
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
          score = parsed[1];
          console.log('Score:', score);

          const modeSelect = document.getElementById('difficulty-changer');
          mode = modeSelect?.className as GameMode;
          console.log('Mode:', mode);

          return {
            score,
            mode,
          }
        },
      }, (res) => {
        if (!res || res.length < 1) {
          return;
        }
        const { score, mode } = res[0].result;
        updateLeaderboard(settings, score, mode);
      });
    });
  }

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
        />
      )}
      {error && <p color="red">{error}</p>}
      <hr />
      <button onClick={onClickUpdate}>Update Spreadsheet</button>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
