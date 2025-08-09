import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource conflict",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
  INVALID_CREDENTIALS: "Invalid credentials",
  EMAIL_EXISTS: "Email already exists",
  USERNAME_EXISTS: "Username already exists",
  INVALID_FORMAT: "Invalid request format",
  MISSING_FIELDS: "All required fields must be provided",
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  LOGIN_SUCCESS: "Login successful",
  REGISTER_SUCCESS: "Registration successful",
  LOGOUT_SUCCESS: "Logout successful",
  FETCHED: "Data retrieved successfully",
} as const;

export function createSuccessResponse<T>(
  data: T,
  message: string = SUCCESS_MESSAGES.FETCHED,
  status: number = HTTP_STATUS.OK
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

export function createErrorResponse(
  message: string = ERROR_MESSAGES.INTERNAL_ERROR,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error?: string
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    status,
    message,
    error: error || message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}


export const ResponseHelper = {
  ok: <T>(data: T, message?: string) => 
    createSuccessResponse(data, message, HTTP_STATUS.OK),
  
  created: <T>(data: T, message?: string) => 
    createSuccessResponse(data, message || SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED),
  
  noContent: () => 
    NextResponse.json(null, { status: HTTP_STATUS.NO_CONTENT }),

  badRequest: (message?: string, error?: string) => 
    createErrorResponse(message || ERROR_MESSAGES.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST, error),
  
  unauthorized: (message?: string, error?: string) => 
    createErrorResponse(message || ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED, error),
  
  forbidden: (message?: string, error?: string) => 
    createErrorResponse(message || ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN, error),
  
  notFound: (message?: string, error?: string) => 
    createErrorResponse(message || ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, error),
  
  conflict: (message?: string, error?: string) => 
    createErrorResponse(message || ERROR_MESSAGES.CONFLICT, HTTP_STATUS.CONFLICT, error),
  
  validationError: (message?: string, error?: string) => 
    createErrorResponse(message || ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.UNPROCESSABLE_ENTITY, error),
  
  internalError: (message?: string, error?: string) => 
    createErrorResponse(message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, error),

  emailExists: () => 
    createErrorResponse(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT),
  
  usernameExists: () => 
    createErrorResponse(ERROR_MESSAGES.USERNAME_EXISTS, HTTP_STATUS.CONFLICT),
  
  missingFields: () => 
    createErrorResponse(ERROR_MESSAGES.MISSING_FIELDS, HTTP_STATUS.BAD_REQUEST),
  
  invalidFormat: () => 
    createErrorResponse(ERROR_MESSAGES.INVALID_FORMAT, HTTP_STATUS.BAD_REQUEST),
};

export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<SuccessResponse<T> | ErrorResponse>>,
  customErrorMessage?: string
): Promise<NextResponse<SuccessResponse<T> | ErrorResponse>> {
  try {
    return await handler();
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return ResponseHelper.conflict("Resource already exists");
      }
      
      if (error.message.includes("JSON")) {
        return ResponseHelper.invalidFormat();
      }
      
      if (error.message.includes("Validation")) {
        return ResponseHelper.validationError(error.message);
      }
    }
    
    return ResponseHelper.internalError(customErrorMessage);
  }
}

export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

export function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
}
