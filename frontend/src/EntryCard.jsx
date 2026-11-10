import { statusLabels } from './statusLabels.js'

export default function EntryCard({ entry, index, onIncrement, onEdit, onDelete, busy }) {
  const unit = entry.mediaType === "anime" ? "episode" : "chapter";
  const progressLabel = entry.mediaType === "anime" ? "Episodes watched" : "Chapters read";

  return (
    <article className="entry-card">
      <div className="entry-index" aria-hidden="true">
        {String(index).padStart(2, "0")}
      </div>
      <div className="entry-content">
        <div className="entry-heading">
          <div>
            <div className="entry-meta-top">
              <span className="media-pill">{entry.mediaType}</span>
              <span className="status-dot" aria-hidden="true" />
              <span>{statusLabels[entry.status]}</span>
            </div>
            <h3>{entry.title}</h3>
          </div>
          <div className={`rating ${entry.rating === null ? "unrated" : ""}`}>
            <span>{entry.rating ?? "—"}</span>
            <small>{entry.rating === null ? "Unrated" : "/ 10"}</small>
          </div>
        </div>

        <div className="entry-details">
          <div className="progress-stat">
            <span>{progressLabel}</span>
            <strong>{entry.progress}</strong>
          </div>
          <div className={`entry-note ${!entry.notes ? "empty-note" : ""}`}>
            <span>Personal note</span>
            <p>{entry.notes || "No note added yet."}</p>
          </div>
        </div>

        <div className="card-actions">
          <button className="increment-button" disabled={busy} onClick={onIncrement}>
            <span aria-hidden="true">＋</span>1 {unit}
          </button>
          <div className="quiet-actions">
            <button onClick={onEdit}>Edit</button>
            <button className="delete-link" onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}