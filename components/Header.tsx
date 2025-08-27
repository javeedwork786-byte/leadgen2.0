
import React from 'react';

type Tab = 'leads' | 'startups' | 'emailVerifier';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const getTabClass = (tab: Tab) => {
    return activeTab === tab
      ? 'border-cyan-400 text-white'
      : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200';
  };

  return (
    <header className="bg-slate-900/70 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 14 4-4"/>
                    <path d="m3.34 19.34 3.42-1.28a2 2 0 0 1 1.01-.22l2.32.7a2 2 0 0 0 .96 0l2.32-.7a2 2 0 0 1 1.01.22l3.42 1.28a2 2 0 0 0 2.16-2.16l-1.28-3.42a2 2 0 0 1 .22-1.01l.7-2.32a2 2 0 0 0 0-.96l-.7-2.32a2 2 0 0 1-.22-1.01l1.28-3.42a2 2 0 0 0-2.16-2.16l-3.42 1.28a2 2 0 0 1-1.01.22l-2.32-.7a2 2 0 0 0-.96 0l-2.32.7a2 2 0 0 1-1.01-.22L4.66 3.34a2 2 0 0 0-2.16 2.16l1.28 3.42a2 2 0 0 1-.22 1.01l-.7 2.32a2 2 0 0 0 0 .96l.7 2.32a2 2 0 0 1 .22 1.01l-1.28 3.42a2 2 0 0 0 2.16 2.16Z"/>
                    <path d="m12 14 4-4"/>
                    <path d="M12 18v-2"/>
                    <path d="M12 8V6"/>
                 </svg>
                <h1 className="text-2xl font-bold text-white tracking-tight">Local Lead Finder</h1>
            </div>
        </div>
        <nav className="flex space-x-4" aria-label="Tabs">
            <button 
                onClick={() => setActiveTab('leads')}
                className={`px-3 py-2 font-medium text-sm rounded-t-md border-b-2 transition-colors ${getTabClass('leads')}`}
            >
                Lead Finder
            </button>
            <button 
                onClick={() => setActiveTab('startups')}
                className={`px-3 py-2 font-medium text-sm rounded-t-md border-b-2 transition-colors ${getTabClass('startups')}`}
            >
                Startups
            </button>
            <button 
                onClick={() => setActiveTab('emailVerifier')}
                className={`px-3 py-2 font-medium text-sm rounded-t-md border-b-2 transition-colors ${getTabClass('emailVerifier')}`}
            >
                Email Verifier
            </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
