import axios from 'axios'

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api` })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

api.interceptors.response.use(
  res => res,
  async err => {
    const config = err.config
    const status = err.response?.status
    const isRetryable = !err.response || status === 502 || status === 503

    if (isRetryable && (config._retryCount || 0) < 3) {
      config._retryCount = (config._retryCount || 0) + 1
      await sleep(3000)
      return api(config)
    }

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
