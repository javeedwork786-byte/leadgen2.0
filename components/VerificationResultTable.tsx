
import React from 'react';
import type { VerificationResult } from '../types';

interface VerificationResultTableProps {
  results: VerificationResult[];
}

const VerificationResultTable: React.FC<VerificationResultTableProps> = ({ results }) => {
    
  const getStatusClass = (status: 'Valid' | 'Invalid') => {
    switch (status) {
      case 'Valid':
        return 'bg-green-500/20 text-green-300';
      case 'Invalid':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const getTypeClass = (type: 'Business' | 'Support' | 'Personal' | 'Unknown') => {
      switch(type) {
          case 'Business':
              return 'bg-blue-500/20 text-blue-300';
          case 'Support':
              return 'bg-yellow-500/20 text-yellow-300';
          case 'Personal':
              return 'bg-purple-500/20 text-purple-300';
          default:
              return 'bg-slate-700 text-slate-300';
      }
  }


  return (
    <div className="overflow-x-auto">
      <div className="align-middle inline-block min-w-full">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/50 divide-y divide-slate-800">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-slate-800/60 transition-colors duration-150">
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-white">{result.email}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(result.status)}`}>
                      {result.status}
                    </span>
                  </td>
                   <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClass(result.type)}`}>
                      {result.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-normal text-sm text-slate-400 max-w-sm">{result.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerificationResultTable;
