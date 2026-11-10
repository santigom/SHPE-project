import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import { statusLabels } from './statusLabels.js'
import EditEntryForm from './EditEntryForm.jsx'
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
      status
      progress
      rating
      notes
    }

    entriesByStatus(status: $status) @skip(if: $showAll) {
      id
      title
      mediaType
      status
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


export default function App() {
  const [signedIn, setSignedIn] = useState(() => Boolean(localStorage.getItem('token')))
  const client = useApolloClient()

  async function logout() {
    localStorage.removeItem('token')
    setSignedIn(false)
    await client.clearStore()
  }

  if (!signedIn) return <Login onLogin={() => setSignedIn(true)} />
  return <Collection onLogout={logout} />
}

function Collection({ onLogout }) {
  const [title, setTitle] = useState('')
  const [mediaType, setMediaType] = useState('anime')
  const [filter, setFilter] = useState('all')
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)
  const { data, loading, error } = useQuery(MY_ENTRIES, {
    variables: { status: filter, showAll: filter === 'all' },
    fetchPolicy: 'network-only',
  })
  const refresh = { refetchQueries: ['MyEntries'], awaitRefetchQueries: true }
  const [addEntry, add] = useMutation(ADD_ENTRY, refresh)
  const [increment, bump] = useMutation(INCREMENT_PROGRESS, refresh)
  const [remove, del] = useMutation(DELETE_ENTRY, refresh)
  const visibleEntries = data?.myEntries ?? data?.entriesByStatus ?? []

  async function handleAdd(event) {
    event.preventDefault()
    if (!title.trim() || add.loading) return
    try {
      await addEntry({ variables: { title: title.trim(), mediaType } })
      setTitle('')
      setFilter('all')
    } catch { /* Apollo exposes the error below the form. */ }
  }

  async function handleDelete() {
    if (!deletingEntry || del.loading) return
    try {
      await remove({ variables: { id: deletingEntry.id } })
      setDeletingEntry(null)
    } catch { /* Leave the dialog open and show the error. */ }
  }

  if (error) return <main className="collection-page" role="alert">
    <p>{error.message}</p>
    <button className="secondary-button" onClick={onLogout}>Back to sign in</button>
  </main>
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#" aria-label="AniLog home">
          AniLog
        </a>
        <div className="account-actions">
          <span>@{data?.me?.username}</span>
          <button className="logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="collection-page">
        <section className="add-section" aria-labelledby="add-heading">
          <div className="eyebrow">Your next obsession</div>
          <h1 id="add-heading">Add a series</h1>
          <p className="section-intro">
            Keep every story you’re watching and reading in one place.
          </p>
          <form className="add-form" onSubmit={handleAdd}>
            <label className="sr-only" htmlFor="series-title">
              Series title
            </label>
            <input
              id="series-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a title"
              autoComplete="off"
            />
            <label className="sr-only" htmlFor="media-type">
              Media type
            </label>
            <div className="select-wrap">
              <select
                id="media-type"
                value={mediaType}
                onChange={(event) => setMediaType(event.target.value)}
              >
                <option value="anime">Anime</option>
                <option value="manga">Manga</option>
              </select>
            </div>
            <button className="primary-button add-button" type="submit" disabled={add.loading || !title.trim()}>
              {add.loading ? "Adding…" : "Add to collection"}
            </button>
          </form>
          {add.error && <p className="error" role="alert">{add.error.message}</p>}
        </section>

        <section className="collection-section" aria-labelledby="collection-heading">
          <div className="collection-header">
            <div>
              <div className="eyebrow">{filter === "all" ? "Library" : "Filtered"} · {loading && !data ? "…" : visibleEntries.length} series</div>
              <h2 id="collection-heading">My collection</h2>
            </div>
            <div className="filter-control">
              <label htmlFor="status-filter">Show</label>
              <div className="select-wrap">
                <select
                  id="status-filter"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && !data && <p role="status">Loading collection…</p>}
          {bump.error && <p className="error" role="alert">{bump.error.message}</p>}
          <div className="entry-list">
            {visibleEntries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={index + 1}
                busy={bump.loading}
                onIncrement={() => increment({ variables: { id: entry.id } }).catch(() => {})}
                onEdit={() => setEditingEntry(entry)}
                onDelete={() => { del.reset(); setDeletingEntry(entry) }}
              />
            ))}
          </div>

          {!loading && visibleEntries.length === 0 && (
            <div className="empty-state">
              <p>No series here yet.</p>
              {filter !== "all" && <button className="text-button" onClick={() => setFilter("all")}>
                View the full collection
              </button>}
            </div>
          )}
        </section>
      </main>

      {editingEntry && (
        <EditEntryForm
          id={editingEntry.id}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      {deletingEntry && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div className="modal-kicker">Remove series</div>
            <h2 id="delete-title">Delete {deletingEntry.title}?</h2>
            <p>This will remove its rating, progress, and notes from your collection.</p>
            {del.error && <p className="error" role="alert">{del.error.message}</p>}
            <div className="modal-actions">
              <button className="secondary-button" disabled={del.loading} onClick={() => setDeletingEntry(null)}>
                Cancel
              </button>
              <button className="danger-button" disabled={del.loading} onClick={handleDelete}>
                Delete entry
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}