import axios from 'axios'

const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return '/api'
  }
  return import.meta.env.VITE_API_URL || '/api'
}

export const api = axios.create({ baseURL: getBaseURL() })
