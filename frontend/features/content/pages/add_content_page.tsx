import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputContentArea } from "@/features/content/components/input_content_area"
import { useAddContent } from "../hooks/add_content"
import { ContentType, ContentDataType, RegisterContentDataType} from "../types/content_type"
import { toast } from 'react-toastify';

export const AddContentPage = () => {
  const { addContent, loading, error } = useAddContent();

  const handleSubmit = async (content: RegisterContentDataType) => {
    const result = await addContent(content);
    if (result.success) {
      toast.success("記録に成功しました");
    } else {
      toast.error(`記録に失敗しました: ${result.message}`);
    }
  }

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>メモ登録</CardTitle>
        <CardDescription>Record a new movie, book, or blog post you've enjoyed.</CardDescription>
      </CardHeader> */}
      <CardContent>
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
          <InputContentArea />
          {error && <p>{error}</p>}
          <Button type="submit" className="mt-4" disabled={loading}>追加</Button>
        </form>
      </CardContent>
    </Card>
  )
}
