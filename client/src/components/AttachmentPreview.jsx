export default function AttachmentPreview({ attachment, onRemove }) {
  if (!attachment) return null;

  return (
    <div className="attachment-card">
      <img src={attachment.previewUrl} alt="" />
      <div>
        <strong>{attachment.source === "result" ? "Previous result attached" : attachment.name}</strong>
        <span>{attachment.mimeType}</span>
      </div>
      <button type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}
