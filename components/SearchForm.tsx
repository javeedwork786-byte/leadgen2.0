import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSearchSuggestions } from '../services/geminiService';

interface SearchFormProps {
  onSearch: (query: string, count: number) => void;
  isLoading: boolean;
  placeholder?: string;
  buttonText?: string;
  suggestionContext?: 'leads' | 'startups';
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, placeholder, buttonText, suggestionContext = 'leads' }) => {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState<number | ''>(10);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedFetchSuggestions = useCallback((searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSuggesting(true);
    generateSearchSuggestions(searchQuery, suggestionContext)
      .then(newSuggestions => {
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
      })
      .finally(() => {
        setIsSuggesting(false);
      });
  }, [suggestionContext]);

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedFetchSuggestions(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debouncedFetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query, Number(count) || 10);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, Number(count) || 10);
  };
  
  const inputClass = "w-full px-4 py-3 rounded-md bg-slate-800 border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-200 text-slate-100 placeholder-slate-400";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-2">
      <div className="md:col-span-9 relative" ref={searchContainerRef}>
        <label htmlFor="query" className="sr-only">Search Query</label>
        <div className="relative">
             <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              placeholder={placeholder || 'Search (e.g., "Real Estate in Hyderabad")'}
              className={inputClass}
              disabled={isLoading}
              required
              autoComplete="off"
            />
            {isSuggesting && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
            )}
        </div>
       
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg">
            {suggestions.map((s, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
       <div className="md:col-span-1">
        <label htmlFor="count" className="sr-only">Number of Leads</label>
        <input
          id="count"
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 0))}
          min="1"
          max="50"
          className={`${inputClass} text-center`}
          disabled={isLoading}
        />
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
              <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Searching...
              </>
          ) : (buttonText || 'Find Leads')}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;