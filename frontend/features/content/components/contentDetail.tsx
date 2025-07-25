import { ContentDataType } from "@/features/content/types/content_type";
import {
  BookOpen,
  Film,
  Bookmark,
  LinkIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
// import Image from 'next/image'
import { EditModal } from "@/features/content/components/modal";

interface ContentProps {
  content: ContentDataType;
  isRank?: boolean;
  onUpdate?: (updatedContent: ContentDataType) => void;
}

export const ContentDetail: React.FC<ContentProps> = ({
  content,
  isRank,
  onUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDisplayModal, setIsDisplayModal] = useState<boolean>(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getIcon = (type: ContentDataType["type"]) => {
    switch (type) {
      case "movie":
        return <Film className="w-4 h-4 flex-none" />;
      case "book":
        return <BookOpen className="w-4 h-4 flex-none" />;
      case "blog":
        return <Bookmark className="w-4 h-4 flex-none" />;
    }
  };

  const handleEdit = () => {
    setIsDisplayModal(!isDisplayModal);
  };

  // TODO: CSS修正予定　hoverで色付け
  return (
    <div className="flex items-center">
      {/* {isRank ? <Image src="/number-1.png" alt="number-1" width="32" height="32" className="mr-4" /> : null} */}
      {isRank ? content.rank : null}
      <div className="border rounded-lg p-4 transition-all duration-200 ease-in-out w-full">
        <button
          className="w-full text-left flex items-center justify-between p-0 cursor-pointer hover:bg-accent hover:text-accent-foreground"
          onClick={toggleExpand}
        >
          <div className="flex items-center space-x-2 truncate">
            {getIcon(content.type)}
            <span className="font-medium flex-none">
              {formatDate(content.date)}
            </span>
            <span className="truncate flex-initial">{content.title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {isExpanded && (
          <div className="mt-2 pl-6 space-y-2">
            <p className="text-sm text-gray-600">{content.notes}</p>
            {content.link && (
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
              >
                <LinkIcon className="w-4 h-4 mr-1" />
                リンク
              </a>
            )}
            {!isRank && (
              <>
                <button
                  onClick={() => handleEdit()}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                  data-testid={`edit-button-${content.contentId}`}
                >
                  編集
                </button>
                {isDisplayModal && onUpdate && (
                  <EditModal
                    isDisplayModal={isDisplayModal}
                    setIsDisplayModal={setIsDisplayModal}
                    content={content}
                    onUpdate={onUpdate}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
