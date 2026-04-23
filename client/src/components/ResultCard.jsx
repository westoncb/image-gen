import { formatUsage } from "../lib/image.js";

export default function ResultCard({ stage, onEdit, onPreviewClick }) {
  if (stage.status === "idle") {
    return <div className="empty-result">Result preview will appear here.</div>;
  }

  if (stage.status === "submitting") {
    return (
      <div className="loading-result">
        <div className="pulse-orb" />
        <p>Working on image request. Complex prompts can take a while.</p>
      </div>
    );
  }

  if (stage.status === "error") {
    return (
      <div className="result-card error-card">
        <h3>Request failed</h3>
        <p>{stage.error}</p>
      </div>
    );
  }

  const result = stage.result;

  return (
    <div className="result-card">
      {result.imageDataUrl ? (
        <button type="button" className="preview-button" onClick={onPreviewClick}>
          <img src={result.imageDataUrl} alt={`Result for ${stage.label}`} />
        </button>
      ) : (
        <div className="empty-result">No image payload returned.</div>
      )}

      <div className="metadata-grid">
        <span>Mode</span>
        <strong>{result.mode}</strong>
        <span>Requested model</span>
        <strong>{result.requestedModel}</strong>
        <span>Executed model</span>
        <strong>{result.executedModel || "not provided by API"}</strong>
        <span>Format</span>
        <strong>{result.outputFormat}</strong>
        {result.outputCompression !== undefined ? (
          <>
            <span>Compression</span>
            <strong>{result.outputCompression}</strong>
          </>
        ) : null}
        <span>Quality</span>
        <strong>{result.quality}</strong>
        <span>Size</span>
        <strong>{result.size}</strong>
        <span>Background</span>
        <strong>{result.background}</strong>
        <span>Usage</span>
        <strong>{formatUsage(result.usage)}</strong>
      </div>

      {stage.warning ? <p className="inline-warning">{stage.warning}</p> : null}

      {result.revisedPrompt ? (
        <details className="api-details">
          <summary>Revised prompt</summary>
          <p>{result.revisedPrompt}</p>
        </details>
      ) : null}

      <details className="api-details">
        <summary>Raw API response</summary>
        <pre>{JSON.stringify(result.raw, null, 2)}</pre>
      </details>

      <button type="button" className="edit-next-button" onClick={onEdit} disabled={!result.imageDataUrl}>
        Edit
      </button>
    </div>
  );
}
