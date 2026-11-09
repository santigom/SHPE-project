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

export default function EditEntryForm({ id, onClose }) {
  const { data, loading, error } = useQuery(GET_ENTRY, {
    variables: { id }
  })

  const [updateEntry, { loading: saving, error: saveError }] = useMutation(
    UPDATE_ENTRY,
    { refetchQueries: ['MyEntries'] }
  )

  if (loading) return <p>Loading entry...</p>

  if (error || !data?.entry) {
    return (
      <div>
        <p className="error">{error?.message || 'Entry not found'}</p>
        <button type="button" onClick={onClose}>Back</button>
      </div>
    )
  }

  const entry = data.entry

  async function handleSave(event) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const title = form.get('title').trim()
    const rating = form.get('rating')

    const variables = {
      id,
      status: form.get('status'),
      rating: rating === '' ? null : Number(rating),
      progress: Number(form.get('progress')),
      notes: form.get('notes')
    }

    if (title !== entry.title) {
      variables.title = title
    }

    try {
      await updateEntry({ variables })
      onClose()
    } catch {
    }
  }

  return (
    <form onSubmit={handleSave}>
      <h2>Edit {entry.title}</h2>

      <p>
        <label>
          Title: <input name="title" defaultValue={entry.title} required />
        </label>
      </p>

      <p>
        <label>
          Status: <select name="status" defaultValue={entry.status}>
            <option value="planned">Planned</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On hold</option>
            <option value="dropped">Dropped</option>
          </select>
        </label>
      </p>

      <p>
        <label>
          Rating (1–10): <input name="rating" type="number" min="1" max="10"
            step="any" defaultValue={entry.rating ?? ''} />
        </label>
      </p>

      <p>
        <label>
          {entry.mediaType === 'anime' ? 'Episodes watched: ' : 'Chapters read: '}
          <input name="progress" type="number" min="0" step="1"
            defaultValue={entry.progress} required />
        </label>
      </p>

      <p>
        <label>
          Notes: <textarea name="notes" defaultValue={entry.notes ?? ''} />
        </label>
      </p>

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      <button type="button" onClick={onClose} disabled={saving}>Cancel</button>

      {saveError && <p className="error">{saveError.message}</p>}
    </form>
  )
}