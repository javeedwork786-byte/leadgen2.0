
import React from 'react';
import type { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onLeadSelect }) => {
    
  const getPriorityClass = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-300';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'Low':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const renderCell = (text: string) => (
    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-300">
      {text || <span className="text-slate-500">N/A</span>}
    </td>
  );

  return (
    <div className="overflow-x-auto">
      <div className="align-middle inline-block min-w-full">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Company</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Verified</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Website</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/50 divide-y divide-slate-800">
              {leads.map((lead, index) => (
                <tr key={index} className="hover:bg-slate-800/60 transition-colors duration-150">
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-white">
                    <button onClick={() => onLeadSelect(lead)} className="text-left hover:text-cyan-400 transition-colors">
                        {lead.company || <span className="text-slate-500">N/A</span>}
                    </button>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-green-400">✅ Verified</td>
                   <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  {renderCell(lead.email)}
                  {renderCell(lead.phone)}
                  {renderCell(lead.location)}
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-300 max-w-xs truncate">
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline">
                        {lead.website}
                      </a>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;
