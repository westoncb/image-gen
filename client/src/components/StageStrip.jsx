import StageColumn from "./StageColumn.jsx";

export default function StageStrip({
  stages,
  onRequestChange,
  onSubmit,
  onEdit,
  onPreviewClick,
}) {
  return (
    <section className="stage-strip" aria-label="Image generation stages">
      {stages.map((stage) => (
        <StageColumn
          key={stage.id}
          stage={stage}
          onRequestChange={onRequestChange}
          onSubmit={onSubmit}
          onEdit={onEdit}
          onPreviewClick={onPreviewClick}
        />
      ))}
    </section>
  );
}
