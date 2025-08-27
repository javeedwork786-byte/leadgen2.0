
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 ring-1 ring-white/10 rounded-lg shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Gemini API Key Required</h2>
        <p className="text-slate-400 text-center mb-6">
          Please enter your API key to use this application. Your key is stored only in your browser's session storage and is not sent anywhere else.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="apiKey" className="sr-only">API Key</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full px-4 py-3 rounded-md bg-slate-900 border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-200 text-slate-100 placeholder-slate-400"
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-md transition duration-200"
            disabled={!apiKey.trim()}
          >
            Save and Continue
          </button>
        </form>
         <p className="text-slate-500 text-xs text-center mt-4">
            You can get an API key from Google AI Studio.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
