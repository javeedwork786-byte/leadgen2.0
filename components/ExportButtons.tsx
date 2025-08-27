
import React from 'react';
import type { Lead } from '../types';
import CsvIcon from './icons/CsvIcon';
import ExcelIcon from './icons/ExcelIcon';

// This lets TypeScript know that XLSX is available on the window object from the CDN script
declare const XLSX: any;

interface ExportButtonsProps {
  leads: Lead[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ leads }) => {

  const dataToExport = leads.map(lead => ({
    Company: lead.company,
    Email: lead.email,
    Phone: lead.phone,
    Location: lead.location,
    Website: lead.website,
    Priority: lead.priority,
    Social: lead.social.join(', '),
  }));
  
  const handleExportCSV = () => {
    if (dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => {
            const value = (row as any)[header];
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (dataToExport.length === 0 || typeof XLSX === 'undefined') {
        alert('Excel export functionality is not available.');
        return;
    };
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'leads.xlsx');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportCSV}
        disabled={leads.length === 0}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <CsvIcon />
        <span>Export CSV</span>
      </button>
      <button
        onClick={handleExportExcel}
        disabled={leads.length === 0}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ExcelIcon />
        <span>Export Excel</span>
      </button>
    </div>
  );
};

export default ExportButtons;
