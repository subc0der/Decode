import React, { useCallback } from 'react';
import { Upload, Loader } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (files: FileList) => void;
  isAnalyzing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isAnalyzing }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files) {
        onUpload(e.dataTransfer.files);
      }
    },
    [onUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(e.target.files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-cyan-700 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors"
    >
      {isAnalyzing ? (
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin" />
          <p>Analyzing files...</p>
        </div>
      ) : (
        <>
          <Upload className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
          <p className="mb-4">Drag and drop files here or click to select</p>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded cursor-pointer transition-colors"
          >
            Select Files
          </label>
        </>
      )}
    </div>
  );
};

export default FileUploader;