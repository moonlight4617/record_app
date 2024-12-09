import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { RegisterContentDataType } from "@/features/content/types/content_type"

interface InputContentAreaProps {
  content?: RegisterContentDataType
}

export const InputContentArea: React.FC<InputContentAreaProps> = ({content}) => {
  const [type, setType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    const jstDate = new Date();
    jstDate.setHours(jstDate.getHours() + 9); // UTCから日本時間に変換
    setDate(jstDate.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (!content) return;
    setType(content.type);
    setTitle(content.title)
    setDate(content.date)
    if (content.notes) setNotes(content.notes)
    if (content.link) setLink(content.link)
  }, [])

  return (
    <div className="grid w-full items-center gap-4">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="type">種類</Label>
        <Select name="type" value={type} setValue={setType}>
          <option value="movie">映画</option>
          <option value="book">書籍</option>
          <option value="blog">ブログ</option>
        </Select>
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          placeholder="対象のタイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
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
        <Textarea id="notes" name="notes" placeholder="メモ欄" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="link">リンク</Label>
        <Input id="link" name="link" placeholder="リンク添付する場合は入力" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>
    </div>
  )
}