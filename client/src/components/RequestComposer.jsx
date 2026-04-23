import { useId, useRef, useState } from "react";
import AttachmentPreview from "./AttachmentPreview.jsx";
import ConfigModal from "./ConfigModal.jsx";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export default function RequestComposer({ stage, onRequestChange, onSubmit }) {
  const inputId = useId();
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const mode = stage.request.attachment ? "Edit" : "Generate";
  const isSubmitting = stage.status === "submitting";
  const config = stage.request.config;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.has(file.type)) {
      onRequestChange(stage.id, { attachment: null });
      setUploadError("Only PNG, JPEG, and WebP images are supported.");
      event.target.value = "";
      return;
    }

    setUploadError(null);
    onRequestChange(stage.id, {
      attachment: {
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file),
        file,
        source: "upload",
      },
    });
  }

  function removeAttachment() {
    setUploadError(null);
    onRequestChange(stage.id, { attachment: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(stage.id);
      }}
    >
      <div className="composer-topline">
        <span className={`mode-chip mode-${mode.toLowerCase()}`}>{mode}</span>
        <span className="composer-hint">
          {config.size} {config.outputFormat.toUpperCase()}, {config.quality} quality
        </span>
      </div>

      <label htmlFor={`${inputId}-prompt`}>Prompt</label>
      <textarea
        id={`${inputId}-prompt`}
        value={stage.request.prompt}
        placeholder={
          mode === "Edit"
            ? "Describe how this image should change..."
            : "Describe the image to generate..."
        }
        onChange={(event) => onRequestChange(stage.id, { prompt: event.target.value })}
      />

      <AttachmentPreview attachment={stage.request.attachment} onRemove={removeAttachment} />

      <div className="composer-actions">
        <input
          ref={fileInputRef}
          id={`${inputId}-file`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
        />
        <label className="attach-button" htmlFor={`${inputId}-file`}>
          Attach image
        </label>
        <button type="button" className="config-button" onClick={() => setIsConfigOpen(true)}>
          Config
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Send"}
        </button>
      </div>

      {uploadError ? <p className="inline-error">{uploadError}</p> : null}
      {stage.error ? <p className="inline-error">{stage.error}</p> : null}

      <ConfigModal
        isOpen={isConfigOpen}
        config={config}
        isEditMode={Boolean(stage.request.attachment)}
        onCancel={() => setIsConfigOpen(false)}
        onDone={(nextConfig) => {
          onRequestChange(stage.id, { config: nextConfig });
          setIsConfigOpen(false);
        }}
      />
    </form>
  );
}
