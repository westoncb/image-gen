import { useEffect, useState } from "react";
import { isSaveShortcut } from "../lib/hotkeys.js";

export default function ImageModal({ isOpen, stage, onClose, onSave }) {
  const [saveStatus, setSaveStatus] = useState("idle");

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeydown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (isSaveShortcut(event)) {
        event.preventDefault();
        setSaveStatus("requested");
        onSave()
          .then(() => setSaveStatus("saved"))
          .catch(() => setSaveStatus("error"));
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen, onClose, onSave]);

  useEffect(() => {
    if (!isOpen) {
      setSaveStatus("idle");
      return undefined;
    }

    if (saveStatus === "idle") return undefined;

    const timeout = window.setTimeout(() => setSaveStatus("idle"), 1800);
    return () => window.clearTimeout(timeout);
  }, [isOpen, saveStatus]);

  if (!isOpen || !stage?.result?.imageDataUrl) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Image preview">
      <img src={stage.result.imageDataUrl} alt={`Fullscreen result for ${stage.label}`} />
      {saveStatus !== "idle" ? (
        <div className={`save-toast save-${saveStatus}`} role="status" aria-live="polite">
          {saveStatus === "requested" ? "Save requested..." : null}
          {saveStatus === "saved" ? "Saved to saved-images." : null}
          {saveStatus === "error" ? "Save failed." : null}
        </div>
      ) : null}
    </div>
  );
}
