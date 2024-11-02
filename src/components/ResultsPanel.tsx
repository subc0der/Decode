import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import type { AnalysisResult } from '../types';

interface ResultsPanelProps {
  results: AnalysisResult[];
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <FileText className="w-12 h-12 mx-auto mb-4" />
        <p>Upload files to see analysis results</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {results.map((result, index) => (
        <div
          key={index}
          className="bg-gray-700 rounded-lg p-4 border-l-4 border-cyan-500"
        >
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            {result.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {result.fileName}
          </h3>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-800 p-3 rounded">
            {typeof result.data === 'string'
              ? result.data
              : JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default ResultsPanel;