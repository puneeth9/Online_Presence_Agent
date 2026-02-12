export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | string;

export type JobListItem = {
  id: string;
  name: string;
  description: string | null;
  status: JobStatus;
  created_at: string;
};

export type JobStatusResponse = {
  jobId: string;
  name: string;
  description: string | null;
  status: JobStatus;
  created_at: string;
};

export type JobResultResponse = {
  jobId: string;
  result: unknown;
};

export type CreateJobRequest = {
  name: string;
  description?: string;
};

export type CreateJobResponse = {
  jobId: string;
  status: JobStatus;
};

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private url(path: string) {
    return `${this.baseUrl}${path}`;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(this.url(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    const text = await res.text();
    const data = text ? (JSON.parse(text) as unknown) : null;

    if (!res.ok) {
      const message =
        typeof data === 'object' && data && 'error' in data
          ? String((data as any).error)
          : `Request failed (${res.status})`;
      throw new Error(message);
    }

    return data as T;
  }

  async createJob(payload: CreateJobRequest): Promise<CreateJobResponse> {
    return this.request<CreateJobResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAllJobs(): Promise<JobListItem[]> {
    return this.request<JobListItem[]>('/analyze', { method: 'GET' });
  }

  async getJobStatus(id: string): Promise<JobStatusResponse> {
    return this.request<JobStatusResponse>(`/analyze/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  }

  async getJobResult(id: string): Promise<JobResultResponse> {
    return this.request<JobResultResponse>(
      `/analyze/result/${encodeURIComponent(id)}`,
      { method: 'GET' }
    );
  }
}

