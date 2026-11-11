export interface AttemptFailureResult {
  locked: boolean;
  attempts: number;
  remaining: number;
}
