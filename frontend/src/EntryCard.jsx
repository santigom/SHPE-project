import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import EditEntryForm from './EditEntryForm.jsx'

const INCREMENT_PROGRESS = gql`
  mutation IncrementProgress($id: ID!) {
    incrementProgress(id: $id) {
      id
      progress
      status
    }
  }
`
const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: ID!) {
    deleteEntry(id: $id)
  }
`

export default function EntryCard({ id, title, mediaType, progress, rating, notes }) {
  const [isEditing, setIsEditing] = useState(false)
  const [incrementProgress, { loading, error }] = useMutation(INCREMENT_PROGRESS, {
    refetchQueries: ['MyEntries']
  })

  async function handleIncrement() {
    try {
      await incrementProgress({ variables: { id } })
    } catch {
    }
  }

  const [deleteEntry, { loading: deleting, error: deleteError }] = useMutation(
  DELETE_ENTRY,
  { refetchQueries: ['MyEntries'] }
  )

  async function handleDelete() {
    if (!window.confirm(`Delete "${title}" from your list?`)) return

    try {
      await deleteEntry({ variables: { id } })
    } catch {
    }
  }

  if (isEditing) {
    return <EditEntryForm id={id} onClose={() => setIsEditing(false)} />
  }

  return (
    <div className="card">
      <div>
        <h2>{title}</h2>
        <p>{rating != null ? `★ ${rating}/10` : 'Not rated yet'}</p>
        {notes?.trim() && <p><em>{notes}</em></p>}
      </div>
      <p>Type: {mediaType}</p>
      <p>{mediaType === 'anime' ? 'Episodes watched' : 'Chapters read'}: {progress}</p>

      <button type="button" onClick={handleIncrement} disabled={loading}>
        {mediaType === 'anime' ? '+1 episode' : '+1 chapter'}
      </button>

      <button type="button" onClick={handleDelete} disabled={deleting}>
        {deleting ? 'Deleting...' : 'Delete'}
      </button>

      {deleteError && <p className="error">{deleteError.message}</p>}

      <button type="button" onClick={() => setIsEditing(true)}>
        Edit
      </button>

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}