import React from 'react';
import Settings from '../models/settings';

interface Props {
  settings: Settings;
  onEdit: () => void;
  followLink: () => void;
}

const DisplaySettings = ({ settings, onEdit, followLink }: Props) => {
  return (
    <div>
      <h2>Team Name: {settings.teamName}</h2>
      <br />
      <h2>
        Sheet ID: {settings.sheetId && 
        <a href="#" onClick={followLink}>
          {settings.sheetId}
        </a> ||
        ''
        }
      </h2>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

export default DisplaySettings;
