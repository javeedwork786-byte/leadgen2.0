
import React from 'react';
import type { Lead } from '../types';
import Spinner from './Spinner';
import { marked } from 'https://esm.sh/marked@13.0.2';


interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  analysis: string | null;
  isAnalysisLoading: boolean;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, analysis, isAnalysisLoading }) => {

  const parsedAnalysis = analysis ? marked.parse(analysis) : '';

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-details-title"
    >
      <div 
        className="bg-slate-900 ring-1 ring-cyan-500/30 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
            <div>
                <h2 id="lead-details-title" className="text-2xl font-bold text-white">{lead.company}</h2>
                <p className="text-slate-400">{lead.location}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal">
                <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="mt-6 border-t border-slate-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong className="text-slate-400 block mb-1">Email:</strong> <a href={`mailto:${lead.email}`} className="text-cyan-400 hover:underline">{lead.email}</a></div>
            <div><strong className="text-slate-400 block mb-1">Phone:</strong> <span className="text-slate-300">{lead.phone}</span></div>
            <div className="md:col-span-2"><strong className="text-slate-400 block mb-1">Website:</strong> <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{lead.website}</a></div>
            {lead.social && lead.social.length > 0 && (
                 <div className="md:col-span-2"><strong className="text-slate-400 block mb-1">Social Media:</strong> 
                    <div className="flex flex-wrap gap-2 mt-1">
                        {lead.social.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-cyan-400 text-xs bg-slate-800 px-2 py-1 rounded">{new URL(link).hostname}</a>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        <div className="mt-6 border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">AI-Generated Insights</h3>
             {isAnalysisLoading ? (
                <div className="flex items-center gap-3 text-slate-400">
                    <Spinner />
                    <p>Analyzing for opportunities...</p>
                </div>
            ) : (
                <div 
                    className="prose prose-invert prose-sm text-slate-300 max-w-none prose-headings:text-slate-200 prose-strong:text-slate-200 prose-a:text-cyan-400"
                    dangerouslySetInnerHTML={{ __html: parsedAnalysis as string }} 
                />
            )}
        </div>
      </div>
       <style>{`
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .prose-invert {
                --tw-prose-body: #d1d5db;
                --tw-prose-headings: #f9fafb;
                --tw-prose-lead: #a1a1aa;
                --tw-prose-links: #22d3ee;
                --tw-prose-bold: #f9fafb;
                --tw-prose-counters: #a1a1aa;
                --tw-prose-bullets: #71717a;
                --tw-prose-hr: #3f3f46;
                --tw-prose-quotes: #f9fafb;
                --tw-prose-quote-borders: #3f3f46;
                --tw-prose-captions: #a1a1aa;
                --tw-prose-code: #f9fafb;
                --tw-prose-pre-code: #d1d5db;
                --tw-prose-pre-bg: #1f2937;
                --tw-prose-th-borders: #3f3f46;
                --tw-prose-td-borders: #3f3f46;
            }
       `}</style>
    </div>
  );
};

export default LeadDetailModal;
