import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import Spinner from '../components/Spinner';
import type { JobStatusResponse } from '../api/ApiClient';

import ResultSummary from '../components/result/ResultSummary';
import ResultMeta from '../components/result/ResultMeta';
import ResultLinks from '../components/result/ResultLinks';
import '../components/result/result.css';

type ProfileResult = {
  summary?: string;
  roles?: string[];
  companies?: string[];
  confidence?: number;
  sourcesCollected?: number;
  key_links?: string[];
};

function toProfileResult(value: unknown): ProfileResult {
  if (!value || typeof value !== 'object') return {};
  const v = value as any;

  const roles = Array.isArray(v.roles) ? v.roles.filter((x: any) => typeof x === 'string') : [];
  const companies = Array.isArray(v.companies)
    ? v.companies.filter((x: any) => typeof x === 'string')
    : [];
  const key_links = Array.isArray(v.key_links)
    ? v.key_links.filter((x: any) => typeof x === 'string')
    : [];

  return {
    summary: typeof v.summary === 'string' ? v.summary : undefined,
    roles,
    companies,
    confidence: typeof v.confidence === 'number' ? v.confidence : undefined,
    sourcesCollected: typeof v.sourcesCollected === 'number' ? v.sourcesCollected : undefined,
    key_links,
  };
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = id ?? '';

  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isPending = useMemo(() => {
    const s = job?.status;
    return s === 'pending' || s === 'processing';
  }, [job?.status]);

  const profile = useMemo(() => toProfileResult(result), [result]);

  async function loadStatus() {
    if (!jobId) return;
    const data = await api.getJobStatus(jobId);
    setJob(data);
    return data.status;
  }

  async function loadResult() {
    if (!jobId) return;
    const data = await api.getJobResult(jobId);
    setResult(data.result);
  }

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      try {
        setError(null);
        setLoading(true);
        const status = await loadStatus();
        if (!alive) return;

        if (status === 'completed') {
          await loadResult();
        }
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Failed to load job');
      } finally {
        if (alive) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    if (!isPending) return;

    const intervalId = window.setInterval(async () => {
      try {
        setError(null);
        const status = await loadStatus();
        if (status === 'completed') {
          await loadResult();
          window.clearInterval(intervalId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Polling failed');
      }
    }, 30_000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, isPending]);

  return (
    <div className="container">
      <div className="card">
        <div className="cardInner">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <h1 className="title" style={{ marginBottom: 0 }}>
              Job detail
            </h1>
            <Link to="/requests" className="muted" style={{ fontWeight: 800 }}>
              Back to list
            </Link>
          </div>

          {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}

          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <div className="card">
              <div className="cardInner">
                <div style={{ fontWeight: 900 }}>{job?.name ?? '—'}</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  {job?.description || '—'}
                </div>
                <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
                  Status:{' '}
                  <span style={{ fontWeight: 900 }}>
                    {job?.status ? String(job.status).toUpperCase() : '—'}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="muted">Loading…</div>
            ) : isPending ? (
              <div className="card">
                <div className="cardInner">
                  <Spinner />
                  <div className="muted" style={{ textAlign: 'center' }}>
                    Polling every 30 seconds…
                  </div>
                </div>
              </div>
            ) : job?.status === 'completed' ? (
              <div className="card">
                <div className="cardInner">
                  <div style={{ fontWeight: 900, marginBottom: 10 }}>Result</div>

                  <div className="resultGrid">
                    <ResultMeta
                      confidence={profile.confidence}
                      sourcesCollected={profile.sourcesCollected}
                    />

                    <ResultSummary summary={profile.summary} />

                    <div className="resultTwoCol">
                      <div className="resultSection card">
                        <div className="cardInner">
                          <div className="resultSectionTitle">Roles</div>
                          {profile.roles && profile.roles.length > 0 ? (
                            <ul className="resultList">
                              {profile.roles.map((r) => (
                                <li key={r}>{r}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="muted">No data</div>
                          )}
                        </div>
                      </div>

                      <div className="resultSection card">
                        <div className="cardInner">
                          <div className="resultSectionTitle">Companies</div>
                          {profile.companies && profile.companies.length > 0 ? (
                            <ul className="resultList">
                              {profile.companies.map((c) => (
                                <li key={c}>{c}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="muted">No data</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <ResultLinks links={profile.key_links ?? []} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="cardInner">
                  <div style={{ fontWeight: 900 }}>No result available</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    This job is in status: {job?.status ?? 'unknown'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

