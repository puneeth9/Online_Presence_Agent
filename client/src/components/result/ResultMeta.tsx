type Props = {
  confidence?: number;
  sourcesCollected?: number;
};

function formatConfidence(v?: number) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  const pct = v <= 1 ? v * 100 : v;
  return `${Math.round(pct)}%`;
}

export default function ResultMeta({ confidence, sourcesCollected }: Props) {
  return (
    <div className="resultMetaRow">
      <div className="pill">Confidence: {formatConfidence(confidence)}</div>
      <div className="pill">
        Sources: {typeof sourcesCollected === 'number' ? sourcesCollected : '—'}
      </div>
    </div>
  );
}

