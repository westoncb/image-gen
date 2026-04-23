import RequestComposer from "./RequestComposer.jsx";
import ResultCard from "./ResultCard.jsx";

export default function StageColumn({
  stage,
  onRequestChange,
  onSubmit,
  onEdit,
  onPreviewClick,
}) {
  return (
    <article className="stage-column">
      <div className="stage-heading">
        <div>
          <p>{stage.label}</p>
          <h2>{stage.request.attachment ? "Edit" : "Generate"}</h2>
        </div>
        {stage.parentStageId ? <span className="parent-pill">from {stage.parentStageId}</span> : null}
      </div>

      <RequestComposer
        stage={stage}
        onRequestChange={onRequestChange}
        onSubmit={onSubmit}
      />

      <ResultCard
        stage={stage}
        onEdit={() => onEdit(stage.id)}
        onPreviewClick={() => onPreviewClick(stage.id)}
      />
    </article>
  );
}
