import React, { useState } from 'react';
import Header from './components/Header';
import LeadFinderPage from './pages/LeadFinderPage';
import StartupsPage from './pages/StartupsPage';
import EmailVerifierPage from './pages/EmailVerifierPage';
import Toast from './components/Toast';

type Tab = 'leads' | 'startups' | 'emailVerifier';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string, isError: boolean = false) => {
    setToastMessage(message); // For now, we only have one toast type
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'leads' && <LeadFinderPage showToast={showToast} />}
        {activeTab === 'startups' && <StartupsPage showToast={showToast} />}
        {activeTab === 'emailVerifier' && <EmailVerifierPage showToast={showToast} />}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Developed by code.serve</p>
      </footer>
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
};

export default App;
