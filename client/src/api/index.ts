import { ApiClient } from './ApiClient';

export const api = new ApiClient(
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
);

