import React, { useState } from 'react';
import { FileSearch, Lock, Image, Music, FileText, AlertCircle } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ResultsPanel from './components/ResultsPanel';
import Converter from './components/Converter';
import { analyzeFile } from './utils/fileAnalyzer';
import type { AnalysisResult } from './types';

function App() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    setIsAnalyzing(true);
    const analysisResults: AnalysisResult[] = [];

    for (const file of Array.from(files)) {
      try {
        const result = await analyzeFile(file);
        analysisResults.push(result);
      } catch (error) {
        analysisResults.push({
          fileName: file.name,
          type: 'error',
          data: `Error analyzing file: ${error.message}`,
        });
      }
    }

    setResults(analysisResults);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-cyan-300">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileSearch className="w-8 h-8" />
            <h1 className="text-3xl font-bold">File Analysis & Steganography Tool</h1>
          </div>
          <p className="text-cyan-400">Detect hidden data, decrypt files, and analyze file contents</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-cyan-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload Files
              </h2>
              <FileUploader onUpload={handleFileUpload} isAnalyzing={isAnalyzing} />
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4" />
                    <span>Images</span>
                  </div>
                  <p className="text-sm text-cyan-400">Supports PNG, JPG, GIF</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4" />
                    <span>Audio</span>
                  </div>
                  <p className="text-sm text-cyan-400">Supports MP3, WAV</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" />
                    <span>Encrypted</span>
                  </div>
                  <p className="text-sm text-cyan-400">Common encryption formats</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>Text/Binary</span>
                  </div>
                  <p className="text-sm text-cyan-400">All file types</p>
                </div>
              </div>
            </div>

            <Converter />
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-cyan-800">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Analysis Results
            </h2>
            <ResultsPanel results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;