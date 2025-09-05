export interface PingResult {
  id: string;
  timestamp: number;
  latency: number;
  server: string;
  status: 'success' | 'failed';
}

export interface Server {
  id: string;
  name: string;
  host: string;
  location: string;
  flag: string;
}

export interface OptimizationSettings {
  autoOptimize: boolean;
  selectedServer: string;
  bufferSize: number;
  timeout: number;
}