import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import EntryCard from './EntryCard.jsx'
import Login from './Login.jsx'

const MY_ENTRIES = gql`
  query MyEntries($status: String!, $showAll: Boolean!) {
    me {
      username
    }

    myEntries @include(if: $showAll) {
      id
      title
      mediaType
      progress
      rating
      notes
    }

    entriesByStatus(status: $status) @skip(if: $showAll) {
      id
      title
      mediaType
      progress
      rating
      notes
    }
  }
`

const ADD_ENTRY = gql`
  mutation AddEntry($title: String!, $mediaType: String!) {
    addEntry(title: $title, mediaType: $mediaType) {
      id
      title
    }
  }
`

function App() {
  const [title, setTitle] = useState('')
  const [mediaType, setMediaType] = useState('anime')
  const [statusFilter, setStatusFilter] = useState('all')
  const client = useApolloClient()

  const { loading, error, data } = useQuery(MY_ENTRIES, {
    variables: {
      status: statusFilter,
      showAll: statusFilter === 'all'
    },
    fetchPolicy: 'network-only'
  })

  const [addEntry, { loading: adding, error: addError }] = useMutation(ADD_ENTRY, {
    refetchQueries: ['MyEntries']
  })

  async function handleAdd(event) {
    event.preventDefault()
    if (!title.trim()) return

    try {
      await addEntry({ variables: { title: title.trim(), mediaType } })
      setTitle('')
    } catch {
    }
  }

  function logout() {
    localStorage.removeItem('token')
    client.resetStore().catch(() => {})
  }

  if (loading) return <p>Loading...</p>

  if (error) {
    return error.message.includes('logged in')
       ? (
          <main className="login-panel">
            <h1>AniLog</h1>
            <p>Keep track of what you’re watching and reading.</p>
            <Login />
          </main>
        )
      : <p className="error">{error.message}</p>
  }

  const visibleEntries = data?.myEntries ?? data?.entriesByStatus ?? []

  return (
    <main className="container">
      <h1>AniLog</h1>
      <p>Logged in as {data?.me?.username}</p>
      <button type="button" onClick={logout}>Log out</button>

      <form className="card" onSubmit={handleAdd}>
        <input
          placeholder="Enter a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
          <option value="anime">Anime</option>
          <option value="manga">Manga</option>
        </select>

        <button type="submit" disabled={adding || !title.trim()}>
          {adding ? 'Saving...' : 'Add'}
        </button>
      </form>

      {addError && <p className="error">{addError.message}</p>}

      <label>
        Show:{' '}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On hold</option>
          <option value="dropped">Dropped</option>
        </select>
      </label>

      {visibleEntries.length === 0 && (
        <p>{statusFilter === 'all' ? 'No entries yet.' : 'No entries with this status.'}</p>
      )}

      {visibleEntries.map(entry => (
        <EntryCard
          key={entry.id}
          id={entry.id}
          title={entry.title}
          mediaType={entry.mediaType}
          progress={entry.progress}
          rating={entry.rating}
          notes={entry.notes}
        />
      ))}
    </main>
  )
}

export default App