import { useEffect, useState } from "react";

const sizes = ["1024x1024", "1536x1024", "1024x1536"];
const qualities = ["high", "medium", "low", "auto"];
const formats = ["png", "jpeg", "webp"];
const backgrounds = ["auto", "opaque"];
const moderationModes = ["auto", "low"];

export default function ConfigModal({ isOpen, config, onCancel, onDone }) {
  const [draft, setDraft] = useState(config);

  useEffect(() => {
    if (isOpen) {
      setDraft(config);
    }
  }, [config, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeydown(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  function updateConfig(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="config-backdrop" role="dialog" aria-modal="true" aria-label="Image API configuration">
      <div className="config-panel">
        <header>
          <div>
            <p className="eyebrow">Request config</p>
            <h2>Image API parameters</h2>
          </div>
        </header>

        <div className="config-grid">
          <label>
            <span>Model</span>
            <input
              type="text"
              value={draft.model}
              onChange={(event) => updateConfig({ model: event.target.value })}
            />
          </label>

          <label>
            <span>Size</span>
            <select value={draft.size} onChange={(event) => updateConfig({ size: event.target.value })}>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Quality</span>
            <select value={draft.quality} onChange={(event) => updateConfig({ quality: event.target.value })}>
              {qualities.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Output format</span>
            <select
              value={draft.outputFormat}
              onChange={(event) => updateConfig({ outputFormat: event.target.value })}
            >
              {formats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </label>

          {["jpeg", "webp"].includes(draft.outputFormat) ? (
            <label>
              <span>Output compression</span>
              <input
                type="number"
                min="0"
                max="100"
                value={draft.outputCompression}
                onChange={(event) =>
                  updateConfig({
                    outputCompression: Number(event.target.value),
                  })
                }
              />
            </label>
          ) : null}

          <label>
            <span>Background</span>
            <select value={draft.background} onChange={(event) => updateConfig({ background: event.target.value })}>
              {backgrounds.map((background) => (
                <option key={background} value={background}>
                  {background}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Moderation</span>
            <select value={draft.moderation} onChange={(event) => updateConfig({ moderation: event.target.value })}>
              {moderationModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
        </div>

        <footer>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={() => onDone(draft)}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
