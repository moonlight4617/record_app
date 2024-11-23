import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useAddContent } from "../hooks/add_content"
import { ContentType, ContentDataType, RegisterContentDataType} from "../types/content_type"
import { toast } from 'react-toastify';

export const AddContentPage = () => {
  const [date, setDate] = useState('');
  const { addContent, loading, error } = useAddContent();

  const handleSubmit = async (content: RegisterContentDataType) => {
    const result = await addContent(content);
    if (result.success) {
      toast.success("記録に成功しました");
    } else {
      toast.error(`記録に失敗しました: ${result.message}`);
    }
  }

  useEffect(() => {
    const jstDate = new Date();
    jstDate.setHours(jstDate.getHours() + 9); // UTCから日本時間に変換
    setDate(jstDate.toISOString().split("T")[0]);
  }, []);

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
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="type">種類</Label>
              <Select name="type">
                <option value="movie">映画</option>
                <option value="book">書籍</option>
                <option value="blog">ブログ</option>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title">タイトル</Label>
              <Input id="title" name="title" placeholder="対象のタイトルを入力" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">メモ</Label>
              <Textarea id="notes" name="notes" placeholder="メモ欄" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">リンク</Label>
              <Input id="link" name="link" placeholder="リンク添付する場合は入力" />
            </div>
          </div>
          {error && <p>{error}</p>}
          <Button type="submit" className="mt-4" disabled={loading}>追加</Button>
        </form>
      </CardContent>
    </Card>
  )
}
