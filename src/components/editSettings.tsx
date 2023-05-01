import React from 'react';
import { useForm } from 'react-hook-form';
import Settings from '../models/settings';

interface Props {
  settings: Settings;
  setSettings: (settings: Settings) => Promise<void>;
  onCancel: () => void;
}

const EditSettings = ({ settings, setSettings, onCancel }: Props) => {
  const { register, handleSubmit } = useForm<Settings>({
    defaultValues: settings,
  });

  return (
    <form onSubmit={handleSubmit(setSettings)}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '300px',
      }}>
        <label>
          Team Name:
        </label>
        <input type="text" {...register('teamName', { required: true })} />
      </div>
      <br />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '300px',
      }}>
        <label>
          Sheet ID:
        </label>
        <input type="text" {...register('sheetId', { required: true })} />
      </div>
      <br />
      <div style={{
        display: 'flex',
      }}>
        <button type="submit">Submit</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default EditSettings;
