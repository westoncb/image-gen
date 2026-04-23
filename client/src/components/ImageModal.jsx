import { useEffect, useState } from "react";
import { isSaveShortcut } from "../lib/hotkeys.js";

export default function ImageModal({ isOpen, stage, onClose, onSave }) {
  const [saveStatus, setSaveStatus] = useState("idle");
  const [savedPath, setSavedPath] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeydown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (isSaveShortcut(event)) {
        event.preventDefault();
        setSaveStatus("saving");
        onSave()
          .then((result) => {
            setSavedPath(result?.path || null);
            setSaveStatus("saved");
          })
          .catch(() => setSaveStatus("error"));
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen, onClose, onSave]);

  useEffect(() => {
    if (isOpen) {
      setSaveStatus("idle");
      setSavedPath(null);
    }
  }, [isOpen, stage?.id]);

  if (!isOpen || !stage?.result?.imageDataUrl) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Image preview">
      <button type="button" className="modal-scrim" onClick={onClose} aria-label="Close preview" />
      <div className="modal-panel">
        <div className="modal-toolbar">
          <div>
            <strong>{stage.label}</strong>
            <span>Esc closes. Cmd+S or Ctrl+S saves to saved-images.</span>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <img src={stage.result.imageDataUrl} alt={`Fullscreen result for ${stage.label}`} />
        <p className={`save-status save-${saveStatus}`}>
          {saveStatus === "idle" ? "Ready to save." : null}
          {saveStatus === "saving" ? "Saving..." : null}
          {saveStatus === "saved" ? `Saved ${savedPath}` : null}
          {saveStatus === "error" ? "Save failed." : null}
        </p>
      </div>
    </div>
  );
}
