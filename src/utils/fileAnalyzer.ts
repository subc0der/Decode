import CryptoJS from 'crypto-js';
import type { AnalysisResult } from '../types';

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const result: AnalysisResult = {
    fileName: file.name,
    type: 'text',
    data: '',
  };

  try {
    if (file.type.startsWith('image/')) {
      result.type = 'image';
      result.data = await analyzeImage(file);
    } else if (file.type.startsWith('audio/')) {
      result.type = 'audio';
      result.data = await analyzeAudio(file);
    } else {
      const content = await readFileAsText(file);
      if (isEncrypted(content)) {
        result.type = 'encrypted';
        result.data = await attemptDecryption(content);
      } else {
        result.type = 'text';
        result.data = await analyzeTextContent(content);
      }
    }
  } catch (error) {
    result.type = 'error';
    result.data = `Analysis failed: ${error.message}`;
  }

  return result;
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

async function analyzeImage(file: File): Promise<Record<string, unknown>> {
  const buffer = await readFileAsArrayBuffer(file);
  const array = new Uint8Array(buffer);
  
  return {
    size: file.size,
    type: file.type,
    metadata: extractImageMetadata(array),
    hiddenData: searchForHiddenData(array),
  };
}

async function analyzeAudio(file: File): Promise<Record<string, unknown>> {
  const buffer = await readFileAsArrayBuffer(file);
  const array = new Uint8Array(buffer);
  
  return {
    size: file.size,
    type: file.type,
    metadata: extractAudioMetadata(array),
    hiddenData: searchForHiddenData(array),
  };
}

function isEncrypted(content: string): boolean {
  // Basic check for common encryption patterns
  const encryptionPatterns = [
    /^[A-Za-z0-9+/]{32,}={0,2}$/,  // Base64
    /^U2F|^[0-9a-fA-F]{32,}$/,     // Common encryption headers
  ];
  
  return encryptionPatterns.some(pattern => pattern.test(content));
}

async function attemptDecryption(content: string): Promise<Record<string, unknown>> {
  const commonKeys = ['password', 'secret', 'key'];
  const results: Record<string, string> = {};

  for (const key of commonKeys) {
    try {
      const decrypted = CryptoJS.AES.decrypt(content, key).toString(CryptoJS.enc.Utf8);
      if (decrypted) {
        results[key] = decrypted;
      }
    } catch {
      // Failed with this key
    }
  }

  return {
    possibleDecryptions: results,
    originalLength: content.length,
  };
}

function extractImageMetadata(data: Uint8Array): Record<string, unknown> {
  // Basic image format detection and metadata extraction
  const header = Array.from(data.slice(0, 8))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  const metadata: Record<string, unknown> = {
    header,
    possibleFormat: detectImageFormat(header),
  };

  return metadata;
}

function extractAudioMetadata(data: Uint8Array): Record<string, unknown> {
  // Basic audio format detection and metadata extraction
  const header = Array.from(data.slice(0, 8))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return {
    header,
    possibleFormat: detectAudioFormat(header),
  };
}

function searchForHiddenData(data: Uint8Array): Record<string, unknown> {
  const results: Record<string, unknown> = {
    strings: extractStrings(data),
    patterns: findPatterns(data),
  };

  return results;
}

function extractStrings(data: Uint8Array): string[] {
  const strings: string[] = [];
  let currentString = '';
  
  for (const byte of data) {
    if (byte >= 32 && byte <= 126) {  // Printable ASCII
      currentString += String.fromCharCode(byte);
    } else if (currentString.length >= 4) {  // Min string length
      strings.push(currentString);
      currentString = '';
    } else {
      currentString = '';
    }
  }

  return [...new Set(strings)];  // Remove duplicates
}

function findPatterns(data: Uint8Array): Record<string, unknown> {
  return {
    nullSequences: countSequences(data, 0),
    repeatingBytes: findRepeatingBytes(data),
  };
}

function countSequences(data: Uint8Array, byte: number): number {
  let count = 0;
  let sequences = 0;
  
  for (const current of data) {
    if (current === byte) {
      count++;
    } else if (count >= 4) {
      sequences++;
      count = 0;
    } else {
      count = 0;
    }
  }
  
  return sequences;
}

function findRepeatingBytes(data: Uint8Array): Record<number, number> {
  const repetitions: Record<number, number> = {};
  let count = 1;
  let lastByte = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] === lastByte) {
      count++;
    } else {
      if (count > 4) {
        repetitions[lastByte] = count;
      }
      count = 1;
      lastByte = data[i];
    }
  }
  
  return repetitions;
}

async function analyzeTextContent(content: string): Promise<Record<string, unknown>> {
  return {
    length: content.length,
    lines: content.split('\n').length,
    patterns: findTextPatterns(content),
    possibleEncodings: detectEncodings(content),
  };
}

function findTextPatterns(content: string): Record<string, unknown> {
  return {
    urls: content.match(/https?:\/\/[^\s]+/g) || [],
    emails: content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
    ipAddresses: content.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || [],
    base64Strings: content.match(/[A-Za-z0-9+/]{32,}={0,2}/g) || [],
  };
}

function detectEncodings(content: string): string[] {
  const encodings: string[] = [];
  
  if (/^[A-Za-z0-9+/]*={0,2}$/.test(content)) {
    encodings.push('base64');
  }
  if (/^[0-9a-fA-F]+$/.test(content)) {
    encodings.push('hex');
  }
  if (/^%[0-9a-fA-F]{2}/.test(content)) {
    encodings.push('url-encoded');
  }
  
  return encodings;
}

function detectImageFormat(header: string): string {
  const signatures: Record<string, string> = {
    '89504e47': 'PNG',
    'ffd8ffe0': 'JPEG',
    '47494638': 'GIF',
  };

  for (const [signature, format] of Object.entries(signatures)) {
    if (header.startsWith(signature)) {
      return format;
    }
  }

  return 'Unknown';
}

function detectAudioFormat(header: string): string {
  const signatures: Record<string, string> = {
    '52494646': 'WAV',
    '494433': 'MP3',
    '4f676753': 'OGG',
  };

  for (const [signature, format] of Object.entries(signatures)) {
    if (header.startsWith(signature)) {
      return format;
    }
  }

  return 'Unknown';
}