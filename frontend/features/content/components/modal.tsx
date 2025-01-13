import React, { Dispatch, SetStateAction } from "react";
import { InputContentArea } from "@/features/content/components/input_content_area";
import { useEditContent } from "../hooks/edit_content";
import {
  ContentType,
  ContentDataType,
  RegisterContentDataType,
  WatchlistDataType,
} from "../types/content_type";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { flashMessages } from "@/features/content/constants/flash_messages";

type EditModalProps = {
  content: ContentDataType | WatchlistDataType | null;
  isDisplayModal: boolean;
  isWatchllist?: boolean;
  setIsDisplayModal: Dispatch<SetStateAction<boolean>>;
  onUpdate: (updatedContent: ContentDataType) => void;
};

export const EditModal: React.FC<EditModalProps> = ({
  content,
  isDisplayModal,
  isWatchllist,
  setIsDisplayModal,
  onUpdate,
}) => {
  const { editContent, loading, error } = useEditContent();

  const handleSubmit = async (content: RegisterContentDataType) => {
    const result = await editContent(content);
    if (result.success && result.content) {
      toast.success(flashMessages.SUCCESSFUL_NOTE_REGISTRATION);
      onUpdate(result.content);
    } else {
      toast.error(
        `${flashMessages.FAILED_NOTE_REGISTRATION}: ${result.message}`
      );
    }
    setIsDisplayModal(!isDisplayModal);
  };

  const handleClose = () => {
    setIsDisplayModal(!isDisplayModal);
  };

  if (!content) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md md:w-1/2 w-11/12">
        <h2 className="text-xl font-bold mb-4">メモ編集</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit({
              contentId: content.contentId,
              type: formData.get("type") as ContentType,
              title: formData.get("title") as string,
              date: formData.get("date") as string,
              notes: formData.get("notes") as string,
              link: formData.get("link") as string,
            });
          }}
        >
          <InputContentArea content={content as RegisterContentDataType} />
          <div className="flex justify-end mt-4">
            <Button type="submit" className="mr-4">
              {isWatchllist ? "閲覧済に更新" : "保存"}
            </Button>
            <Button onClick={handleClose} variant="cancel" className="mr-2">
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
