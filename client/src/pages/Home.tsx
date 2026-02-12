import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => name.trim().length > 0 && !submitting, [name, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createJob({ name: name.trim(), description: description.trim() });
      navigate('/requests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="cardInner">
          <h1 className="title">Analyze a person</h1>
          <p className="muted">
            Submit an async job. We’ll fetch sources and build a structured profile.
          </p>

          {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}

          <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Satya Nadella"
                autoComplete="off"
              />
            </div>

            <div className="field">
              <label htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Microsoft CEO"
              />
            </div>

            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="primary" type="submit" disabled={!canSubmit}>
                {submitting ? 'Submitting…' : 'Analyze'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

