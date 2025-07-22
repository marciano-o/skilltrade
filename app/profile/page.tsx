"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/ui/file-upload"
import { ImageUpload } from "@/components/ui/image-upload"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth"
import { X, Award, FileText, Calendar, Clock, CheckCircle, AlertCircle, Sparkles } from "lucide-react"

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateUser, calculateProfileCompletion } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  // Check for welcome parameter (from registration)
  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true)
      setIsEditing(true) // Start in edit mode for new users
      // Remove the welcome parameter from URL
      router.replace("/profile", { scroll: false })
    }
  }, [searchParams, router])

  // Initialize state from authenticated user data
  const [skills, setSkills] = useState<{ offering: string[]; seeking: string[] }>({
    offering: user?.skills?.offering || [],
    seeking: user?.skills?.seeking || [],
  })

  const [newSkill, setNewSkill] = useState({ offering: "", seeking: "" })
  const [documents, setDocuments] = useState<{ name: string; type: string; date: string }[]>([
    { name: "Web Development Certificate.pdf", type: "certification", date: "2023-05-15" },
    { name: "JavaScript Course Completion.pdf", type: "certification", date: "2023-03-10" },
    { name: "Portfolio Project.pdf", type: "achievement", date: "2023-06-22" },
  ])

  const [profileImage, setProfileImage] = useState<string>(user?.avatar || "/placeholder.svg?height=200&width=200")

  // User profile data from authenticated user
  const [userProfile, setUserProfile] = useState({
    name: user?.name || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    bio: user?.bio || "",
    timeCredits: user?.timeCredits || 5,
    location: user?.location || "",
    occupation: user?.occupation || "",
    website: user?.website || "",
  })

  // Sync with user data when user changes
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bio: user.bio || "",
        timeCredits: user.timeCredits || 5,
        location: user.location || "",
        occupation: user.occupation || "",
        website: user.website || "",
      })

      if (user.skills) {
        setSkills(user.skills)
      }

      if (user.avatar) {
        setProfileImage(user.avatar)
      }
    }
  }, [user])

  const profileCompletion = calculateProfileCompletion()

  const handleAddSkill = (type: "offering" | "seeking") => {
    if (newSkill[type].trim() !== "") {
      const updatedSkills = {
        ...skills,
        [type]: [...skills[type], newSkill[type].trim()],
      }
      setSkills(updatedSkills)

      // Update auth context immediately
      updateUser({ skills: updatedSkills })

      setNewSkill((prev) => ({ ...prev, [type]: "" }))
    }
  }

  const handleRemoveSkill = (type: "offering" | "seeking", index: number) => {
    const updatedSkills = {
      ...skills,
      [type]: skills[type].filter((_, i) => i !== index),
    }
    setSkills(updatedSkills)

    // Update auth context immediately
    updateUser({ skills: updatedSkills })
  }

  const handleProfileImageUpload = (file: File) => {
    // In a real app, you would upload this to your server/storage
    const url = URL.createObjectURL(file)
    setProfileImage(url)

    // Update auth context immediately
    updateUser({ avatar: url })
  }

  const handleDocumentUpload = (file: File) => {
    // In a real app, you would upload this to your server/storage
    const newDocument = {
      name: file.name,
      type: "document", // Default type
      date: new Date().toISOString().split("T")[0],
    }

    setDocuments((prev) => [...prev, newDocument])
  }

  const handleCertificationUpload = (file: File) => {
    // In a real app, you would upload this to your server/storage
    const newCertification = {
      name: file.name,
      type: "certification",
      date: new Date().toISOString().split("T")[0],
    }

    setDocuments((prev) => [...prev, newCertification])
  }

  const handleAchievementUpload = (file: File) => {
    // In a real app, you would upload this to your server/storage
    const newAchievement = {
      name: file.name,
      type: "achievement",
      date: new Date().toISOString().split("T")[0],
    }

    setDocuments((prev) => [...prev, newAchievement])
  }

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveProfile = () => {
    // Update the auth context with new profile data
    updateUser({
      name: userProfile.name,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      bio: userProfile.bio,
      location: userProfile.location,
      occupation: userProfile.occupation,
      website: userProfile.website,
      avatar: profileImage,
      skills: skills,
    })

    setIsEditing(false)
    setShowWelcome(false)
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getCompletionIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (percentage >= 50) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="container py-12 animate-fade-in">
      {/* Welcome Message for New Users */}
      {showWelcome && (
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Welcome to SkillTrade, {user?.firstName}! 🎉</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Your account has been created successfully! Let's complete your profile to help you find the best skill
              matches.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getCompletionIcon(profileCompletion)}
                <span className={`font-medium ${getCompletionColor(profileCompletion)}`}>
                  Profile {profileCompletion}% complete
                </span>
              </div>
              <Button onClick={() => setShowWelcome(false)} variant="outline" size="sm">
                Got it!
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="hover-lift">
            <CardContent className="p-6 text-center">
              <div className="mb-6 mt-2">
                <ImageUpload
                  defaultImage={profileImage}
                  onImageSelect={handleProfileImageUpload}
                  className="h-32 w-32 mx-auto"
                />
              </div>
              <h2 className="text-2xl font-bold">{userProfile.name || "Complete your profile"}</h2>
              <p className="text-muted-foreground mb-2">{userProfile.email}</p>
              {userProfile.location && userProfile.occupation && (
                <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1">
                  <span>{userProfile.location}</span> • <span>{userProfile.occupation}</span>
                </p>
              )}
              <div className="bg-primary/10 text-primary font-medium rounded-full px-4 py-2 inline-block mb-4 animate-pulse-subtle">
                <Clock className="h-4 w-4 inline mr-1" />
                {userProfile.timeCredits} Time Credits
              </div>

              {/* Profile Completion Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className={`text-sm font-medium ${getCompletionColor(profileCompletion)}`}>
                    {profileCompletion}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      profileCompletion >= 80
                        ? "bg-green-500"
                        : profileCompletion >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-2">
                <Button
                  className="w-full transition-all duration-300 hover:bg-primary/90"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Skills Offered</span>
                  <span className="font-medium">{skills.offering.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Skills Seeking</span>
                  <span className="font-medium">{skills.seeking.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Certifications</span>
                  <span className="font-medium">{documents.filter((d) => d.type === "certification").length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Achievements</span>
                  <span className="font-medium">{documents.filter((d) => d.type === "achievement").length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="font-medium">
                    {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : "Today"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="transition-all duration-300">
                Profile
              </TabsTrigger>
              <TabsTrigger value="skills" className="transition-all duration-300">
                Skills
              </TabsTrigger>
              <TabsTrigger value="documents" className="transition-all duration-300">
                Documents
              </TabsTrigger>
              <TabsTrigger value="history" className="transition-all duration-300">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 animate-slide-up">
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                  <CardDescription>
                    {!userProfile.bio && isEditing && "Tell others about yourself and your interests"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <textarea
                      value={userProfile.bio}
                      onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Tell others about yourself, your experience, and what you're passionate about..."
                    />
                  ) : (
                    <p>{userProfile.bio || "No bio added yet. Click 'Edit Profile' to add one!"}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">
                          First name
                        </label>
                        <Input
                          id="firstName"
                          value={userProfile.firstName}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              firstName: e.target.value,
                              name: `${e.target.value} ${userProfile.lastName}`,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">
                          Last name
                        </label>
                        <Input
                          id="lastName"
                          value={userProfile.lastName}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              lastName: e.target.value,
                              name: `${userProfile.firstName} ${e.target.value}`,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={userProfile.email}
                        disabled={!isEditing}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium">
                          Location
                        </label>
                        <Input
                          id="location"
                          value={userProfile.location}
                          disabled={!isEditing}
                          placeholder="San Francisco, CA"
                          onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="occupation" className="text-sm font-medium">
                          Occupation
                        </label>
                        <Input
                          id="occupation"
                          value={userProfile.occupation}
                          disabled={!isEditing}
                          placeholder="Software Engineer"
                          onChange={(e) => setUserProfile({ ...userProfile, occupation: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">
                        Website
                      </label>
                      <Input
                        id="website"
                        value={userProfile.website}
                        disabled={!isEditing}
                        placeholder="https://yourwebsite.com"
                        onChange={(e) => setUserProfile({ ...userProfile, website: e.target.value })}
                      />
                    </div>
                    {isEditing && (
                      <Button onClick={handleSaveProfile} className="transition-all duration-300 hover:bg-primary/90">
                        Save Changes
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6 animate-slide-up">
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Skills I&apos;m Offering</CardTitle>
                  <CardDescription>These are the skills you can teach to others</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.offering.length > 0 ? (
                      skills.offering.map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-primary/10 hover:bg-primary/20 text-primary text-sm px-3 py-1 skill-tag"
                        >
                          {skill}
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveSkill("offering", index)}
                              className="ml-1 text-primary hover:text-primary/80"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove skill</span>
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No skills added yet.{" "}
                        {isEditing ? "Add some skills you can teach!" : "Click 'Edit Profile' to add skills."}
                      </p>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new skill..."
                        value={newSkill.offering}
                        onChange={(e) => setNewSkill({ ...newSkill, offering: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSkill("offering")
                          }
                        }}
                      />
                      <Button onClick={() => handleAddSkill("offering")}>Add</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Skills I&apos;m Seeking</CardTitle>
                  <CardDescription>These are the skills you want to learn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.seeking.length > 0 ? (
                      skills.seeking.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-muted/50 hover:bg-muted text-muted-foreground text-sm px-3 py-1 skill-tag"
                        >
                          {skill}
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveSkill("seeking", index)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove skill</span>
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No skills added yet.{" "}
                        {isEditing ? "Add some skills you want to learn!" : "Click 'Edit Profile' to add skills."}
                      </p>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill you want to learn..."
                        value={newSkill.seeking}
                        onChange={(e) => setNewSkill({ ...newSkill, seeking: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSkill("seeking")
                          }
                        }}
                      />
                      <Button onClick={() => handleAddSkill("seeking")}>Add</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 animate-slide-up">
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Resume/CV</CardTitle>
                  <CardDescription>Upload your resume or CV</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    label="Upload Resume/CV"
                    description="PDF, DOC, or DOCX files up to 5MB"
                    accept=".pdf,.doc,.docx"
                    onFileSelect={handleDocumentUpload}
                  />
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                  <CardDescription>Upload certificates from courses or programs you've completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {documents
                      .filter((doc) => doc.type === "certification")
                      .map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(doc.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDocument(documents.indexOf(doc))}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove document</span>
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>

                  <FileUpload
                    label="Upload Certification"
                    description="PDF files up to 5MB"
                    accept=".pdf"
                    onFileSelect={handleCertificationUpload}
                  />
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Upload documents showcasing your achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {documents
                      .filter((doc) => doc.type === "achievement")
                      .map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center">
                            <Award className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(doc.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDocument(documents.indexOf(doc))}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove document</span>
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>

                  <FileUpload
                    label="Upload Achievement"
                    description="PDF files up to 5MB"
                    accept=".pdf"
                    onFileSelect={handleAchievementUpload}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="animate-slide-up">
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Skill Exchange History</CardTitle>
                  <CardDescription>
                    {user?.joinDate && new Date(user.joinDate).toDateString() === new Date().toDateString()
                      ? "Welcome! Your exchange history will appear here as you start trading skills."
                      : "Your skill exchange history"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.joinDate && new Date(user.joinDate).toDateString() === new Date().toDateString() ? (
                    <div className="text-center py-8">
                      <div className="inline-block p-4 rounded-full bg-muted mb-4">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Start Your Skill Trading Journey!</h3>
                      <p className="text-muted-foreground mb-6">
                        Complete your profile and start discovering skills to begin your exchange history.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => router.push("/discover")}>Discover Skills</Button>
                        <Button variant="outline" onClick={() => router.push("/matchmaking")}>
                          Find Matches
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Web Development Session</h4>
                            <p className="text-sm text-muted-foreground">Taught JavaScript basics to Sarah Williams</p>
                          </div>
                          <div className="text-right">
                            <span className="text-green-600 font-medium">+2 credits</span>
                            <p className="text-xs text-muted-foreground">May 15, 2023</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">UI Design Session</h4>
                            <p className="text-sm text-muted-foreground">Learned Figma basics from Michael Brown</p>
                          </div>
                          <div className="text-right">
                            <span className="text-red-600 font-medium">-1 credit</span>
                            <p className="text-xs text-muted-foreground">May 10, 2023</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">React Workshop</h4>
                            <p className="text-sm text-muted-foreground">Group session teaching React hooks</p>
                          </div>
                          <div className="text-right">
                            <span className="text-green-600 font-medium">+3 credits</span>
                            <p className="text-xs text-muted-foreground">April 28, 2023</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Node.js Tutorial</h4>
                            <p className="text-sm text-muted-foreground">Taught backend development to Emily Davis</p>
                          </div>
                          <div className="text-right">
                            <span className="text-green-600 font-medium">+2 credits</span>
                            <p className="text-xs text-muted-foreground">April 15, 2023</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Photography Basics</h4>
                            <p className="text-sm text-muted-foreground">
                              Learned composition techniques from David Wilson
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-red-600 font-medium">-2 credits</span>
                            <p className="text-xs text-muted-foreground">March 22, 2023</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute feature="profile">
      <ProfileContent />
    </ProtectedRoute>
  )
}
