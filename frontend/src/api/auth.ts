import client from './client'
import type { LoginRequest, SignupRequest, TokenResponse, User } from '../types'

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<TokenResponse>('/auth/login', data),

  signup: (data: SignupRequest) =>
    client.post<{ message: string }>('/auth/signup', data),

  me: () => client.get<User>('/auth/me'),

  refresh: (refreshToken: string) =>
    client.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken }),

  forgotPassword: (email: string) =>
    client.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    client.post('/auth/reset-password', { token, new_password: password }),

  verifyOtp: (email: string, otp: string) =>
    client.post('/auth/verify-otp', { email, otp }),

  logout: () => client.post('/auth/logout'),
}
