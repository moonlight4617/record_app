import React, { Dispatch, SetStateAction, useState } from "react";
import { InputContentArea } from "@/features/content/components/input_content_area"
import { useAddContent } from "../hooks/add_content"
import { ContentType, ContentDataType, RegisterContentDataType} from "../types/content_type"
import { toast } from 'react-toastify';

type EditModalProps = {
  content: ContentDataType | null;
  isDisplayModal: boolean;
  setIsDisplayModal: Dispatch<SetStateAction<boolean>>;
};

export const EditModal: React.FC<EditModalProps> = ({ content, isDisplayModal, setIsDisplayModal }) => {
  const [editedContent, setEditedContent] = useState(content);
  const { addContent, loading, error } = useAddContent();

  const handleSubmit = async (content: RegisterContentDataType) => {
    console.log("content", content)
    const result = {success: true, message: "成功"}
    // const result = await addContent(content);
    if (result.success) {
      toast.success("記録に成功しました");
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
