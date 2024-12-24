import React, { Dispatch, SetStateAction } from "react";
import { InputContentArea } from "@/features/content/components/input_content_area"
import { useEditContent } from "../hooks/edit_content"
import { ContentType, ContentDataType, RegisterContentDataType} from "../types/content_type"
import { toast } from 'react-toastify';

type EditModalProps = {
  content: ContentDataType | null;
  isDisplayModal: boolean;
  setIsDisplayModal: Dispatch<SetStateAction<boolean>>;
  onUpdate: (updatedContent: ContentDataType) => void
};

export const EditModal: React.FC<EditModalProps> = ({ content, isDisplayModal, setIsDisplayModal, onUpdate }) => {
  const { editContent, loading, error } = useEditContent();

  const handleSubmit = async (content: RegisterContentDataType) => {
    const result = await editContent(content);
    if (result.success && result.content) {
      toast.success("記録に成功しました");
      onUpdate(result.content)
    } else {
      toast.error(`記録に失敗しました: ${result.message}`);
    }
    setIsDisplayModal(!isDisplayModal);
  }

  const handleClose = () => {
    setIsDisplayModal(!isDisplayModal)
  }

  if (!content) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md md:w-1/2 w-11/12">
        <h2 className="text-xl font-bold mb-4">メモ編集</h2>

        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          handleSubmit({
            contentId: content.contentId,
            type: formData.get('type') as ContentType,
            title: formData.get('title') as string,
            date: formData.get('date') as string,
            notes: formData.get('notes') as string,
            link: formData.get('link') as string,
          })
        }}>
          <InputContentArea content={content} />
          <div className="flex justify-end mt-4">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded mr-4">
              保存
            </button>
            <button onClick={handleClose} className="mr-2 px-4 py-2 bg-gray-300 rounded">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
