"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Briefcase, Plus, X, Save, Edit } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import ProtectedRoute from "@/components/auth/protected-route"

interface UserSkill {
  id: number
  name: string
  category: string
  proficiencyLevel?: number
  description?: string
  createdAt: string
}

interface Skills {
  offering: UserSkill[]
  seeking: UserSkill[]
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<Skills>({ offering: [], seeking: [] })
  const [newSkill, setNewSkill] = useState("")
  const [skillType, setSkillType] = useState<"offering" | "seeking">("offering")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    occupation: "",
    website: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        location: user.location || "",
        occupation: user.occupation || "",
        website: "",
      })
    }
    fetchSkills()
  }, [user])

  const fetchSkills = async () => {
    try {
      const response = await apiClient.getSkills()
      if (response.success) {
        setSkills(response.skills)
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.updateProfile(formData)

      if (response.success) {
        updateUser(response.user)
        setEditing(false)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return

    try {
      const response = await apiClient.addSkill({
        name: newSkill.trim(),
        type: skillType,
        category: "General",
      })

      if (response.success) {
        await fetchSkills()
        setNewSkill("")
      }
    } catch (error) {
      console.error("Failed to add skill:", error)
    }
  }

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await apiClient.deleteSkill(skillId)
      await fetchSkills()
    } catch (error) {
      console.error("Failed to remove skill:", error)
    }
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-gray-600">{user.email}</p>
                    {user.occupation && (
                      <div className="flex items-center text-gray-500 mt-1">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {user.occupation}
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {user.location}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>

            {editing && (
              <CardContent className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <Input
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      placeholder="Your job title"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Manage the skills you're offering and seeking</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="offering" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="offering">Skills I Offer</TabsTrigger>
                  <TabsTrigger value="seeking">Skills I Want</TabsTrigger>
                </TabsList>

                <TabsContent value="offering" className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill you can teach..."
                      value={skillType === "offering" ? newSkill : ""}
                      onChange={(e) => {
                        setNewSkill(e.target.value)
                        setSkillType("offering")
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                    />
                    <Button onClick={handleAddSkill} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skills.offering.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="secondary"
                        className="px-3 py-1 bg-green-100 text-green-800 border border-green-200"
                      >
                        {skill.name}
                        <button
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="seeking" className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill you want to learn..."
                      value={skillType === "seeking" ? newSkill : ""}
                      onChange={(e) => {
                        setNewSkill(e.target.value)
                        setSkillType("seeking")
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                    />
                    <Button onClick={handleAddSkill} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skills.seeking.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="secondary"
                        className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {skill.name}
                        <button
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.timeCredits || 0}</div>
                  <div className="text-sm text-gray-600">Time Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{skills.offering.length}</div>
                  <div className="text-sm text-gray-600">Skills Offered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{skills.seeking.length}</div>
                  <div className="text-sm text-gray-600">Skills Seeking</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
