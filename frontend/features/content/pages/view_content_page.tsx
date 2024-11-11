import { useState,useEffect  } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetYears } from '@/features/content/hooks/get_years';
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

export const ViewContentPage = () => {
  const [contents, setContents] = useState<Content[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  const { years, loading, error } = useGetYears();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Content</CardTitle>
        <CardDescription>Browse your recorded content by year and category.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Label htmlFor="year">Select Year:</Label>
          <Select name="selectedYear">
          {/* <Select value={selectedYear} onValueChange={setSelectedYear}> */}
            {/* <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                  {new Date().getFullYear() - i}
                </SelectItem>
              ))}
            </SelectContent> */}
          {years.map((year, index) => (
            <option key={index} value={year}>{year}</option>
          ))}
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
  )
}