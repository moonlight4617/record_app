import { ContentDataType } from "@/features/content/types/content_type"
import { BookOpen, Film, Bookmark, LinkIcon, ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from "react"
import Image from 'next/image'

interface ContentProps {
  content: ContentDataType;
  isRank?: boolean;
}

export const ContentDetail: React.FC<ContentProps>  = ({content, isRank}) => {
  const [isExpanded , setIsExpanded ] = useState<boolean>(false)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" })
  }

  const getIcon = (type: ContentDataType["type"]) => {
    switch (type) {
      case "movie":
        return <Film className="w-4 h-4" />
      case "book":
        return <BookOpen className="w-4 h-4" />
      case "blog":
        return <Bookmark className="w-4 h-4" />
    }
  }


  // TODO: CSS修正予定　hoverで色付け
  return (
    <div className="flex items-center">
      {/* {isRank ? <Image src="/number-1.png" alt="number-1" width="32" height="32" className="mr-4" /> : null} */}
      {isRank ? content.rank : null}
      <div className="border rounded-lg p-4 transition-all duration-200 ease-in-out hover:bg-black w-full">
        <button
          // variant="ghost"
          className="w-full text-left flex items-center justify-between p-0 cursor-pointer hover:bg-accent hover:text-accent-foreground"
          onClick={toggleExpand}
        >
          <div className="flex items-center space-x-2">
            {getIcon(content.type)}
            <span className="font-medium">{formatDate(content.date)}</span>
            <span className="truncate">{content.title}</span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {isExpanded && (
          <div className="mt-2 pl-6 space-y-2">
            <p className="text-sm text-gray-600">{content.notes}</p>
            {content.link && (
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline flex items-center"
              >
                <LinkIcon className="w-4 h-4 mr-1" />
                リンク
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}