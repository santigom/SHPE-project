import { useState } from 'react'

function EntryCard({ title, mediaType }) {
  const [hasLiked, setHasLiked] = useState(false)

  return (
    <div>
      <h2>{title}</h2>
      <p>Type: {mediaType}</p>

      <button onClick={() => setHasLiked(!hasLiked)}>
        {hasLiked ? 'Liked!' : 'Like'}
      </button>
    </div>
  )
}

export default EntryCard