import { useState } from 'react'
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

export const BestContentPage = () => {
  const [contents, setContents] = useState<Content[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  const getBestContent = (type: ContentType, year: string) => {
    return contents
      .filter(c => c.type === type && c.date.startsWith(year))
      .sort((a, b) => b.notes.length - a.notes.length)
      .slice(0, 3)
  }

  return (
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
  )
}
