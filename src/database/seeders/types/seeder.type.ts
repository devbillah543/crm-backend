import type { DataSource } from 'typeorm';

export interface SeedExecutionResult {
  created: boolean;
  updated: boolean;
  skipped: boolean;
  reason?: string;
}

export interface SeederDefinition {
  name: string;
  run: (dataSource: DataSource) => Promise<SeedExecutionResult>;
}
