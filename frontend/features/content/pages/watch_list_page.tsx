import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Film, Bookmark } from 'lucide-react'

type ContentType = 'movie' | 'book' | 'blog'
type Content = {
  id: string
  type: ContentType
  title: string
  date: string
  notes: string
  link?: string
}

export const WatchListPage = () => {
  const [watchlist, setWatchlist] = useState<Content[]>([])
  const addToWatchlist = (content: Omit<Content, 'id' | 'date' | 'notes'>) => {
    setWatchlist([...watchlist, { ...content, id: Date.now().toString(), date: '', notes: '' }])
  }

  return (
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
  )
}
