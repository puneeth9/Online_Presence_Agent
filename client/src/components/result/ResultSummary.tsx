type Props = {
  summary?: string;
};

export default function ResultSummary({ summary }: Props) {
  const text = summary?.trim();

  return (
    <div className="resultSection card">
      <div className="cardInner">
        <div className="resultSectionTitle">Summary</div>
        <p className="resultParagraph">{text ? text : 'No data'}</p>
      </div>
    </div>
  );
}

