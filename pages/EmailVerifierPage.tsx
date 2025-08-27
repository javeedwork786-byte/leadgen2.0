
import React, { useState, useCallback } from 'react';
import { VerificationResult } from '../types';
import { verifyEmails } from '../services/geminiService';
import Spinner from '../components/Spinner';
import VerificationResultTable from '../components/VerificationResultTable';
import ExportButtons from '../components/ExportButtons';

// This lets TypeScript know that XLSX is available on the window object from the CDN script
declare const XLSX: any;

interface EmailVerifierPageProps {
  showToast: (message: string, isError?: boolean) => void;
}

const EmailVerifierPage: React.FC<EmailVerifierPageProps> = ({ showToast }) => {
    const [file, setFile] = useState<File | null>(null);
    const [emails, setEmails] = useState<string[]>([]);
    const [results, setResults] = useState<VerificationResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.xlsx')) {
                setFile(selectedFile);
                setFileName(selectedFile.name);
                setError(null);
                setResults([]);
                
                // Parse the file and extract emails
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target?.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        
                        if (json.length === 0) {
                            setError("The uploaded file is empty.");
                            return;
                        }

                        // Find the email column
                        const header = json[0];
                        let emailIndex = header.findIndex((h: string) => typeof h === 'string' && h.toLowerCase().includes('email'));
                        
                        if (emailIndex === -1) {
                             // If no 'email' header, find the first column with an '@'
                             for (let i = 1; i < json.length; i++) {
                                for(let j = 0; j < json[i].length; j++) {
                                    if(typeof json[i][j] === 'string' && json[i][j].includes('@')) {
                                        emailIndex = j;
                                        break;
                                    }
                                }
                                if(emailIndex !== -1) break;
                             }
                        }

                        if (emailIndex === -1) {
                            setError("Could not find an email column in the uploaded file.");
                            return;
                        }

                        const extractedEmails = json
                            .slice(1) // skip header
                            .map((row) => row[emailIndex])
                            .filter((email): email is string => typeof email === 'string' && email.includes('@'));

                        if (extractedEmails.length === 0) {
                            setError("No valid email addresses were found in the file.");
                            return;
                        }
                        
                        setEmails(extractedEmails);

                    } catch (err) {
                        setError("Failed to parse the uploaded file. Please ensure it's a valid CSV or XLSX file.");
                        console.error(err);
                    }
                };
                reader.readAsBinaryString(selectedFile);

            } else {
                setError("Please upload a valid .csv or .xlsx file.");
                setFile(null);
                setFileName('');
            }
        }
    };

    const handleVerify = async () => {
        if (emails.length === 0) {
            setError("No emails to verify. Please upload a file with emails.");
            return;
        }
        
        // Let's process in chunks to be safe with API limits
        const CHUNK_SIZE = 100;
        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const allResults: VerificationResult[] = [];
            for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
                const chunk = emails.slice(i, i + CHUNK_SIZE);
                const chunkResults = await verifyEmails(chunk);
                allResults.push(...chunkResults);
                setResults([...allResults]); // Update UI progressively
            }
        } catch(err) {
            console.error(err);
            showToast("An error occurred during verification.", true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Email List Verifier</h1>
                <p className="text-slate-400 mb-6">
                    Upload your CSV or Excel file to clean, validate, and categorize your email list using AI.
                </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 ring-1 ring-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 px-4 rounded-md transition-colors w-full flex items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                           <span>{fileName || 'Upload CSV or Excel File'}</span>
                        </label>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                    </div>
                     <button
                        onClick={handleVerify}
                        disabled={isLoading || emails.length === 0}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
                    >
                         {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Verifying...
                            </>
                         ) : `Verify ${emails.length > 0 ? emails.length : ''} Emails`}
                    </button>
                </div>
                 {error && (
                    <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm" role="alert">
                      <p>{error}</p>
                    </div>
                )}
            </div>

            {(isLoading || results.length > 0) && (
                <div className="mt-10 bg-slate-800/50 rounded-lg shadow-lg p-1 ring-1 ring-white/10">
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-semibold text-white">Verification Results</h2>
                            {isLoading && <Spinner />}
                        </div>
                        {/* The existing ExportButtons component needs to be adapted or replaced for this data structure */}
                        {/* <ExportButtons leads={results} /> */}
                    </div>
                    <VerificationResultTable results={results} />
                </div>
            )}
        </div>
    );
};

export default EmailVerifierPage;
