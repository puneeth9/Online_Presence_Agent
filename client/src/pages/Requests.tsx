import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { JobListItem } from '../api/ApiClient';

const REFRESH_INTERVAL = 5000;
function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function Requests() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sorted = useMemo(() => jobs, [jobs]);

  async function load() {
    try {
      setError(null);
      const data = await api.getAllJobs();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = window.setInterval(load, REFRESH_INTERVAL);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="cardInner">
          <h1 className="title">Requests</h1>
          <p className="muted">Auto-refreshes every {REFRESH_INTERVAL / 1000} seconds.</p>

          {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}

          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {loading ? (
              <div className="muted">Loading…</div>
            ) : sorted.length === 0 ? (
              <div className="muted">No jobs yet. Create one from “New request”.</div>
            ) : (
              sorted.map((j) => (
                <Link
                  key={j.id}
                  to={`/requests/${j.id}`}
                  className="card"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="cardInner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ fontWeight: 800 }}>{j.name}</div>
                      <div className="muted" style={{ fontWeight: 700 }}>
                        {String(j.status).toUpperCase()}
                      </div>
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {j.description || '—'}
                    </div>
                    <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
                      Created: {formatTime(j.created_at)}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

