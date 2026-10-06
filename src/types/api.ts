export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

export interface FieldErrorItem {
  field: string;
  code: string;
  message: string;
}

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  code?: string;
  detail: string;
  instance?: string;
  requestId?: string;
  errors?: FieldErrorItem[];
  invalidParams?: FieldErrorItem[];
}
