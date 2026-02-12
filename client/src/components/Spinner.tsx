import './Spinner.css';

export default function Spinner() {
  return (
    <div className="spinnerWrap">
      <div className="spinner" />
      <div className="spinnerText">Fetching results...</div>
    </div>
  );
}

