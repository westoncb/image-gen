import { useEffect } from "react";
import { isSaveShortcut } from "../lib/hotkeys.js";

export default function ImageModal({ isOpen, stage, onClose, onSave }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeydown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (isSaveShortcut(event)) {
        event.preventDefault();
        onSave().catch(() => {});
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen, onClose, onSave]);

  if (!isOpen || !stage?.result?.imageDataUrl) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Image preview">
      <img src={stage.result.imageDataUrl} alt={`Fullscreen result for ${stage.label}`} />
    </div>
  );
}
