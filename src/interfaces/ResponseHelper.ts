export interface ResponseHelper<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  status: number;
  timestamp: Date;
}
