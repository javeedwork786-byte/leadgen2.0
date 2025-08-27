
import React from 'react';
import Spinner from './Spinner';

interface AnalyticsBoxProps {
    content: string | null;
    isLoading: boolean;
}

const AnalyticsBox: React.FC<AnalyticsBoxProps> = ({ content, isLoading }) => {
    if (!isLoading && !content) {
        return null; // Don't render anything if there's no loading or content
    }

    return (
        <div className="bg-slate-800/50 rounded-lg p-5 ring-1 ring-white/10">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Market Insights</h3>
            {isLoading ? (
                <div className="flex items-center gap-3">
                    <Spinner />
                    <p className="text-slate-400">Generating analysis...</p>
                </div>
            ) : (
                <p className="text-slate-300 whitespace-pre-wrap">{content}</p>
            )}
        </div>
    );
}

export default AnalyticsBox;
