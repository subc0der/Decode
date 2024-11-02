import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface ConversionResult {
  binary: string;
  decimal: string;
  hexadecimal: string;
  ascii: string;
  text: string;
}

const Converter: React.FC = () => {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'binary' | 'decimal' | 'hex'>('text');
  const [result, setResult] = useState<ConversionResult | null>(null);

  const convert = () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }

    try {
      let decimal: number;

      switch (inputType) {
        case 'binary':
          decimal = parseInt(input.replace(/[^01]/g, ''), 2);
          break;
        case 'decimal':
          decimal = parseInt(input);
          break;
        case 'hex':
          decimal = parseInt(input.replace(/[^0-9A-Fa-f]/g, ''), 16);
          break;
        case 'text':
          decimal = input.charCodeAt(0);
          break;
      }

      if (isNaN(decimal)) throw new Error('Invalid input');

      const result: ConversionResult = {
        binary: decimal.toString(2).padStart(8, '0'),
        decimal: decimal.toString(),
        hexadecimal: decimal.toString(16).toUpperCase(),
        ascii: String.fromCharCode(decimal),
        text: String.fromCharCode(decimal),
      };

      if (inputType === 'text' && input.length > 1) {
        result.binary = Array.from(input)
          .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
          .join(' ');
        result.decimal = Array.from(input)
          .map(char => char.charCodeAt(0).toString())
          .join(' ');
        result.hexadecimal = Array.from(input)
          .map(char => char.charCodeAt(0).toString(16).toUpperCase())
          .join(' ');
        result.text = input;
      }

      setResult(result);
    } catch (error) {
      setResult(null);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <RefreshCw className="w-5 h-5" />
        Format Converter
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input Type</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value as any)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="text">Text</option>
            <option value="binary">Binary</option>
            <option value="decimal">Decimal</option>
            <option value="hex">Hexadecimal</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Input Value</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && convert()}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            placeholder={`Enter ${inputType} value...`}
          />
        </div>
      </div>

      <button
        onClick={convert}
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-md transition-colors mb-4"
      >
        Convert
      </button>

      {result && (
        <div className="space-y-3">
          <div className="bg-gray-800 p-3 rounded-md">
            <span className="text-sm font-medium text-cyan-400">Binary:</span>
            <pre className="mt-1 font-mono text-sm">{result.binary}</pre>
          </div>
          <div className="bg-gray-800 p-3 rounded-md">
            <span className="text-sm font-medium text-cyan-400">Decimal:</span>
            <pre className="mt-1 font-mono text-sm">{result.decimal}</pre>
          </div>
          <div className="bg-gray-800 p-3 rounded-md">
            <span className="text-sm font-medium text-cyan-400">Hexadecimal:</span>
            <pre className="mt-1 font-mono text-sm">{result.hexadecimal}</pre>
          </div>
          <div className="bg-gray-800 p-3 rounded-md">
            <span className="text-sm font-medium text-cyan-400">ASCII/Text:</span>
            <pre className="mt-1 font-mono text-sm">{result.text}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Converter;