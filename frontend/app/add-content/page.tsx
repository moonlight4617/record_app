"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Film, Bookmark, LogOut } from 'lucide-react'

type ContentType = 'movie' | 'book' | 'blog'
type Content = {
  id: string
  type: ContentType
  title: string
  date: string
  notes: string
  link?: string
}

type User = {
  id: string
  name: string
}

export default function ContentManager() {
  const [user, setUser] = useState<User | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [watchlist, setWatchlist] = useState<Content[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  const logout = () => {
    setUser(null)
  }

  const addContent = (content: Omit<Content, 'id'>) => {
    setContents([...contents, { ...content, id: Date.now().toString() }])
  }

  const addToWatchlist = (content: Omit<Content, 'id' | 'date' | 'notes'>) => {
    setWatchlist([...watchlist, { ...content, id: Date.now().toString(), date: '', notes: '' }])
  }

  const getBestContent = (type: ContentType, year: string) => {
    return contents
      .filter(c => c.type === type && c.date.startsWith(year))
      .sort((a, b) => b.notes.length - a.notes.length)
      .slice(0, 3)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-pink-100 p-4">
      <div className="container mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        <Tabs defaultValue="add" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 gap-4">
            <TabsTrigger value="add" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Add Content
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center">
              <Film className="mr-2 h-4 w-4" />
              View Content
            </TabsTrigger>
            <TabsTrigger value="best" className="flex items-center">
              <Bookmark className="mr-2 h-4 w-4" />
              Best Content
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center">
              <Bookmark className="mr-2 h-4 w-4" />
              Watchlist
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Content</CardTitle>
                <CardDescription>Record a new movie, book, or blog post you've enjoyed.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  addContent({
                    type: formData.get('type') as ContentType,
                    title: formData.get('title') as string,
                    date: formData.get('date') as string,
                    notes: formData.get('notes') as string,
                    link: formData.get('link') as string,
                  })
                }}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="type">Type</Label>
                      <Select name="type">
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="movie">Movie</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" placeholder="Enter the title" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="notes">Notes</Label>
                      <Input id="notes" name="notes" placeholder="Enter your thoughts" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="link">Link (optional)</Label>
                      <Input id="link" name="link" placeholder="Enter a related link" />
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">Add Content</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>View Content</CardTitle>
                <CardDescription>Browse your recorded content by year and category.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Label htmlFor="year">Select Year:</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                          {new Date().getFullYear() - i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(['movie', 'book', 'blog'] as ContentType[]).map(type => (
                  <div key={type} className="mb-4">
                    <h3 className="text-lg font-semibold capitalize mb-2 flex items-center">
                      {type === 'movie' && <Film className="mr-2 h-5 w-5" />}
                      {type === 'book' && <BookOpen className="mr-2 h-5 w-5" />}
                      {type === 'blog' && <Bookmark className="mr-2 h-5 w-5" />}
                      {type}s
                    </h3>
                    <ul className="list-disc pl-5">
                      {contents
                        .filter(c => c.type === type && c.date.startsWith(selectedYear))
                        .map(content => (
                          <li key={content.id}>
                            {content.title} - {new Date(content.date).toLocaleDateString()}
                            {content.link && (
                              <a href={content.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                                Link
                              </a>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="best">
            <Card>
              <CardHeader>
                <CardTitle>Best Content</CardTitle>
                <CardDescription>View your top 3 picks for each category by year.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Label htmlFor="year">Select Year:</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                          {new Date().getFullYear() - i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(['movie', 'book', 'blog'] as ContentType[]).map(type => (
                  <div key={type} className="mb-4">
                    <h3 className="text-lg font-semibold capitalize mb-2 flex items-center">
                      {type === 'movie' && <Film className="mr-2 h-5 w-5" />}
                      {type === 'book' && <BookOpen className="mr-2 h-5 w-5" />}
                      {type === 'blog' && <Bookmark className="mr-2 h-5 w-5" />}
                      Top 3 {type}s
                    </h3>
                    <ol className="list-decimal pl-5">
                      {getBestContent(type, selectedYear).map((content, index) => (
                        <li key={content.id}>
                          {content.title}
                          {content.link && (
                            <a href={content.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                              Link
                            </a>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="watchlist">
            <Card>
              <CardHeader>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Manage your list of content to watch or read later.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  addToWatchlist({
                    type: formData.get('type') as ContentType,
                    title: formData.get('title') as string,
                    link: formData.get('link') as string,
                  })
                }} className="mb-4">
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="type">Type</Label>
                      <Select name="type">
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="movie">Movie</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" placeholder="Enter the title" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="link">Link (optional)</Label>
                      <Input id="link" name="link" placeholder="Enter a related link" />
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">Add to Watchlist</Button>
                </form>
                <h3 className="text-lg font-semibold mb-2">Your Watchlist</h3>
                <ul className="list-disc pl-5">
                  {watchlist.map(item => (
                    <li key={item.id} className="flex items-center">
                      {item.type === 'movie' && <Film className="mr-2 h-4 w-4" />}
                      {item.type === 'book' && <BookOpen className="mr-2 h-4 w-4" />}
                      {item.type === 'blog' && <Bookmark className="mr-2 h-4 w-4" />}
                      {item.title} ({item.type})
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                          Link
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
