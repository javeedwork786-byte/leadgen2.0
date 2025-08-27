import React, { useState, useCallback } from 'react';
import { Lead } from '../types';
import { generateLeadsStream, generateAnalytics, generateLeadAnalysis } from '../services/geminiService';
import SearchForm from '../components/SearchForm';
import LeadTable from '../components/LeadTable';
import ExportButtons from '../components/ExportButtons';
import Spinner from '../components/Spinner';
import AnalyticsBox from '../components/AnalyticsBox';
import LeadDetailModal from '../components/LeadDetailModal';

interface LeadFinderPageProps {
  showToast: (message: string) => void;
}

const LeadFinderPage: React.FC<LeadFinderPageProps> = ({ showToast }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<string | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadAnalysis, setLeadAnalysis] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);


  const handleSearch = useCallback(async (query: string, count: number) => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setIsLoading(true);
    setIsAnalyticsLoading(true);
    setError(null);
    setLeads([]);
    setAnalytics(null);

    // Fetch analytics in parallel
    try {
        const analysisResult = await generateAnalytics(query);
        setAnalytics(analysisResult);
    } catch (err) {
        console.error(err);
        showToast('Could not generate market analysis.');
    } finally {
        setIsAnalyticsLoading(false);
    }

    // Stream in leads
    generateLeadsStream(
      query,
      count,
      (newLead) => {
        setLeads(prevLeads => [...prevLeads, newLead]);
      },
      () => { // onComplete
        setIsLoading(false);
        // This check runs after the stream is complete
        setLeads(currentLeads => {
            if (currentLeads.length === 0) {
                setError('No verified leads found for your query. Try a different search.');
            }
            return currentLeads;
        });
      },
      (err) => { // onError
        console.error('Error during search stream:', err);
        showToast('Failed to call the Gemini API. Please try again.');
        setIsLoading(false);
      }
    );
  }, [showToast]);
  
  const handleSelectLead = useCallback(async (lead: Lead) => {
    setSelectedLead(lead);
    setLeadAnalysis(null);
    setIsAnalysisLoading(true);
    try {
        const analysis = await generateLeadAnalysis(lead);
        setLeadAnalysis(analysis);
    } catch (err) {
        console.error("Error generating lead analysis:", err);
        showToast("Could not generate analysis for this lead.");
    } finally {
        setIsAnalysisLoading(false);
    }
  }, [showToast]);

  const handleCloseModal = () => {
    setSelectedLead(null);
    setLeadAnalysis(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <p className="text-center text-slate-400 mb-6">
        Enter a query like "Real Estate in Hyderabad" to find verified business leads.
      </p>
      <SearchForm 
        onSearch={handleSearch} 
        isLoading={isLoading} 
        buttonText="Find Leads"
        suggestionContext="leads" 
      />
      
      {error && (
        <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8">
         <AnalyticsBox content={analytics} isLoading={isAnalyticsLoading} />
      </div>

      {(isLoading || leads.length > 0) && (
        <div className="mt-10 bg-slate-800/50 rounded-lg shadow-lg p-1 ring-1 ring-white/10">
          <div className="flex justify-between items-center p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
                 <h2 className="text-xl font-semibold text-white">Generated Leads</h2>
                 {isLoading && <Spinner />}
            </div>
            <ExportButtons leads={leads} />
          </div>
          <LeadTable leads={leads} onLeadSelect={handleSelectLead} />
        </div>
      )}
      
      {selectedLead && (
        <LeadDetailModal 
            lead={selectedLead} 
            onClose={handleCloseModal} 
            analysis={leadAnalysis}
            isAnalysisLoading={isAnalysisLoading}
        />
      )}
    </div>
  );
};

export default LeadFinderPage;