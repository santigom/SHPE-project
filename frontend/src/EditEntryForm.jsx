import { statusLabels } from './statusLabels.js'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'

const GET_ENTRY = gql`
  query GetEntry($id: ID!) {
    entry(id: $id) {
      id
      title
      mediaType
      status
      rating
      progress
      notes
    }
  }
`

const UPDATE_ENTRY = gql`
  mutation UpdateEntry(
    $id: ID!
    $title: String
    $status: String
    $rating: Float
    $progress: Int
    $notes: String
  ) {
    updateEntry(
      id: $id
      title: $title
      status: $status
      rating: $rating
      progress: $progress
      notes: $notes
    ) {
      id
      title
      status
      rating
      progress
      notes
    }
  }
`

export default function EditEntryForm({ id, onCancel }) {
  const { data, loading, error } = useQuery(GET_ENTRY, {
    variables: { id }, fetchPolicy: 'network-only',
  })
  const [updateEntry, { loading: saving, error: saveError }] = useMutation(UPDATE_ENTRY, {
    refetchQueries: ['MyEntries'], awaitRefetchQueries: true,
  })
  const entry = data?.entry

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = form.get('title').trim()
    if (!title) return
    const rating = form.get('rating')
    const variables = {
      id, status: form.get('status'), progress: Number(form.get('progress')),
      notes: form.get('notes'), rating: rating === '' ? null : Number(rating),
    }
    if (title !== entry.title) variables.title = title
    try {
      await updateEntry({ variables })
      onCancel()
    } catch { /* Keep the form open and display the server error. */ }
  }
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
      >
        <div className="modal-kicker">Update your log</div>
        <h2 id="edit-title">Edit entry</h2>
        {loading || error || !entry ? (
          <>
            <p role="status">{loading ? "Loading entry…" : error?.message || "Entry not found."}</p>
            <button className="secondary-button" onClick={onCancel}>Close</button>
          </>
        ) : <form onSubmit={handleSubmit}>
          <label>
            <span>Title</span>
            <input name="title" defaultValue={entry.title} required pattern=".*\S.*" autoFocus />
          </label>
          <div className="form-grid">
            <label>
              <span>Status</span>
              <div className="select-wrap">
                <select name="status" defaultValue={entry.status}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </label>
            <label>
              <span>Rating</span>
              <div className="select-wrap">
                <select name="rating" defaultValue={entry.rating ?? ''}>
                  <option value="">Unrated</option>
                  {entry.rating != null && !Number.isInteger(entry.rating) &&
                    <option value={entry.rating}>{entry.rating} / 10</option>}
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                    <option key={value} value={value}>{value} / 10</option>
                  ))}
                </select>
              </div>
            </label>
          </div>
          <label>
            <span>Progress</span>
            <input name="progress" type="number" min="0" step="1" defaultValue={entry.progress} required />
          </label>
          <label>
            <span>Personal note</span>
            <textarea name="notes" rows={4} defaultValue={entry.notes ?? ''} placeholder="What did you think?" />
          </label>
          {saveError && <p className="error" role="alert">{saveError.message}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" disabled={saving} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="primary-button">
              Save changes
            </button>
          </div>
        </form>}
      </section>
    </div>
  );
}