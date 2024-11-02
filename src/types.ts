export interface AnalysisResult {
  fileName: string;
  type: 'text' | 'image' | 'audio' | 'encrypted' | 'error';
  data: string | Record<string, unknown>;
}