import { useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation, useApolloClient } from '@apollo/client/react'

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`
const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password)
  }
`

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const client = useApolloClient()
  const [submit, { loading, error }] = useMutation(
  isRegistering ? REGISTER : LOGIN,
  {
    onCompleted: (data) => {
      const token = isRegistering ? data.register : data.login
      localStorage.setItem('token', token)
      client.resetStore()
    },
  }
)

const handleSubmit = (e) => {
  e.preventDefault()

  if (isRegistering) {
    submit({ variables: { username, email, password } })
  } else {
    submit({ variables: { username, password } })
  }
}
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
    {isRegistering && (
        <label>
            Email
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        </label>
    )}
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : isRegistering ? 'Register' : 'Log in'}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? 'Back to login' : 'Create an account'}
      </button>

      {error && <p className = "error">{error.message}</p>}
    </form>
  )
}