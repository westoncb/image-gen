import { useEffect, useState } from "react";
import ImageModal from "./components/ImageModal.jsx";
import StageStrip from "./components/StageStrip.jsx";
import { checkHealth, saveImage, submitImageRequest } from "./lib/api.js";
import { promptSlug, resultToAttachment } from "./lib/image.js";

const DEFAULT_CONFIG = {
  model: "gpt-image-2",
  size: "1024x1024",
  quality: "high",
  outputFormat: "png",
  outputCompression: 100,
  background: "auto",
  moderation: "auto",
};

function createStage(index, parentStageId = null, attachment = null) {
  return {
    id: `stage_${index + 1}`,
    label: `Stage ${index + 1}`,
    parentStageId,
    request: {
      prompt: "",
      attachment,
      config: { ...DEFAULT_CONFIG },
    },
    status: "idle",
    error: null,
    warning: null,
    result: null,
  };
}

export default function App() {
  const [stages, setStages] = useState(() => [createStage(0)]);
  const [modal, setModal] = useState({ isOpen: false, stageId: null });
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    checkHealth()
      .then((health) => {
        if (!health.hasOpenAIKey) {
          setBanner("OPENAI_API_KEY is not set on the server. Image requests will fail until it is configured.");
        }
      })
      .catch(() => {
        setBanner("Server is unavailable. Start the Express server before submitting image requests.");
      });
  }, []);

  const modalStage = stages.find((stage) => stage.id === modal.stageId);

  function updateStageRequest(stageId, patch) {
    setStages((current) =>
      current.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              request: { ...stage.request, ...patch },
              error: null,
            }
          : stage,
      ),
    );
  }

  async function submitStage(stageId) {
    const stage = stages.find((item) => item.id === stageId);
    if (!stage) return;

    const prompt = stage.request.prompt.trim();
    if (!prompt) {
      setStages((current) =>
        current.map((item) =>
          item.id === stageId ? { ...item, error: "Prompt is required before submitting." } : item,
        ),
      );
      return;
    }

    const stageIndex = stages.findIndex((item) => item.id === stageId);
    setStages((current) =>
      current.slice(0, stageIndex + 1).map((item) =>
        item.id === stageId
          ? { ...item, status: "submitting", error: null, warning: null, result: null }
          : item,
      ),
    );

    try {
      const result = await submitImageRequest({
        prompt,
        attachment: stage.request.attachment,
        config: stage.request.config,
      });

      setStages((current) =>
        current.map((item) =>
          item.id === stageId
            ? {
                ...item,
                status: "success",
                result,
                warning: result.warning,
                error: null,
              }
            : item,
        ),
      );
    } catch (error) {
      setStages((current) =>
        current.map((item) =>
          item.id === stageId
            ? {
                ...item,
                status: "error",
                error: error.message,
              }
            : item,
        ),
      );
    }
  }

  function editFromStage(stageId) {
    setStages((current) => {
      const stageIndex = current.findIndex((stage) => stage.id === stageId);
      const sourceStage = current[stageIndex];
      const attachment = resultToAttachment(sourceStage);

      if (stageIndex < 0 || !attachment) return current;

      return [
        ...current.slice(0, stageIndex + 1),
        createStage(stageIndex + 1, sourceStage.id, attachment),
      ];
    });
  }

  function openModal(stageId) {
    setModal({ isOpen: true, stageId });
  }

  function closeModal() {
    setModal({ isOpen: false, stageId: null });
  }

  async function handleSaveCurrentImage() {
    if (!modalStage?.result?.imageDataUrl) return null;

    try {
      return await saveImage({
        imageDataUrl: modalStage.result.imageDataUrl,
        filenameHint: promptSlug(modalStage.request.prompt),
      });
    } catch (error) {
      setBanner(error.message);
      throw error;
    }
  }

  return (
    <main className="app-shell">
      {banner ? (
        <div className="global-banner" role="alert">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <StageStrip
        stages={stages}
        onRequestChange={updateStageRequest}
        onSubmit={submitStage}
        onEdit={editFromStage}
        onPreviewClick={openModal}
      />

      <ImageModal
        isOpen={modal.isOpen}
        stage={modalStage}
        onClose={closeModal}
        onSave={handleSaveCurrentImage}
      />
    </main>
  );
}
