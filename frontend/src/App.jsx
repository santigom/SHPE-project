import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import EntryCard from './EntryCard.jsx'

const GET_HELLO = gql`
  query GetHello {
    hello
  }
`

function App() {
  const { loading, error, data } = useQuery(GET_HELLO)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <main>
      <h1>My Anime & Manga Tracker</h1>
      <p>{data.hello}</p>

      <EntryCard title="One Piece" mediaType="anime" />
      <EntryCard title="Berserk" mediaType="manga" />
    </main>
  )
}

export default App