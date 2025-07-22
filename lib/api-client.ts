// Frontend API client for making requests to backend
class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl

    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("skilltrade_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("skilltrade_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("skilltrade_token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
  }) {
    const result = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (result.token) {
      this.setToken(result.token)
    }

    return result
  }

  async login(email: string, password: string) {
    const result = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (result.token) {
      this.setToken(result.token)
    }

    return result
  }

  async getMe() {
    return this.request("/auth/me")
  }

  // Profile endpoints
  async getProfile() {
    return this.request("/profile")
  }

  async updateProfile(updates: any) {
    return this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  // Skills endpoints
  async getSkills() {
    return this.request("/skills")
  }

  async addSkill(skill: any) {
    return this.request("/skills", {
      method: "POST",
      body: JSON.stringify(skill),
    })
  }

  async updateSkills(skills: { offering: string[]; seeking: string[] }) {
    return this.request("/skills", {
      method: "PUT",
      body: JSON.stringify(skills),
    })
  }

  async deleteSkill(skillId: number) {
    return this.request(`/skills/${skillId}`, {
      method: "DELETE",
    })
  }

  // Discovery endpoints
  async discoverSkills(
    params: {
      q?: string
      category?: string
      limit?: number
      offset?: number
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request(`/discover?${searchParams}`)
  }

  // Matching endpoints
  async getMatches(limit = 10) {
    return this.request(`/matches?limit=${limit}`)
  }

  async createMatch(targetUserId: number, action: "like" | "pass") {
    return this.request("/matches", {
      method: "POST",
      body: JSON.stringify({ targetUserId, action }),
    })
  }

  // Messaging endpoints
  async getConversations() {
    return this.request("/messages")
  }

  async getMessages(userId: number, limit = 50, offset = 0) {
    return this.request(`/messages/${userId}?limit=${limit}&offset=${offset}`)
  }

  async sendMessage(receiverId: number, content: string) {
    return this.request("/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, content }),
    })
  }

  // Time credits endpoints
  async getTimeCredits(limit = 20, offset = 0) {
    return this.request(`/time-credits?limit=${limit}&offset=${offset}`)
  }
}

export const apiClient = new ApiClient()
