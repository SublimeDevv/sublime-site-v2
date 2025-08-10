import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError, HttpClientOptions, RequestConfig } from '@/types/api';
import { BaseModel, PaginationParams, PaginatedResponse } from '@/types/models';

export class HttpClient {
  private instance: AxiosInstance;

  constructor(options: HttpClientOptions = {}) {
    this.instance = axios.create({
      baseURL: options.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api',
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'Network error',
          status: error.response?.status,
          code: error.response?.data?.code || error.code,
          details: error.response?.data,
        };
        return Promise.reject(apiError);
      }
    );
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const axiosConfig: AxiosRequestConfig = {
      method,
      url,
      data,
      headers: config?.headers,
      params: config?.params,
      timeout: config?.timeout,
      validateStatus: () => true,
    };

    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.instance.request(axiosConfig);
      return response.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  async getById<T extends BaseModel>(endpoint: string, id: string | number): Promise<T> {
    return this.get<T>(`${endpoint}/${id}`);
  }

  async getAll<T extends BaseModel>(
    endpoint: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, { params });
  }

  async create<T extends BaseModel>(endpoint: string, data: Omit<T, 'id'>): Promise<T> {
    return this.post<T>(endpoint, data);
  }

  async update<T extends BaseModel>(
    endpoint: string,
    id: string | number,
    data: Partial<Omit<T, 'id'>>
  ): Promise<T> {
    return this.put<T>(`${endpoint}/${id}`, data);
  }

  async remove<T = any>(endpoint: string, id: string | number): Promise<T> {
    return this.delete<T>(`${endpoint}/${id}`);
  }

  setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
  }

  setDefaultHeaders(headers: Record<string, string>): void {
    Object.assign(this.instance.defaults.headers, headers);
  }
}

export const httpClient = new HttpClient();
