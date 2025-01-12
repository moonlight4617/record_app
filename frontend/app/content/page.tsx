"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Film, Bookmark, LogOut } from 'lucide-react'
import { AddContentPage } from "@/features/content/pages/add_content_page"
import { ViewContentPage } from "@/features/content/pages/view_content_page"
import { BestContentPage } from "@/features/content/pages/best_content_page"
import { WatchListPage } from "@/features/content/pages/watch_list_page"
import { useLogout } from "@/features/content/hooks/logout"
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation'
import { flashMessages } from "@/features/content/constants/flash_messages"

export default function ContentManager() {
  const router = useRouter();
  const [tab, setTab] = useState("add")
  // TODO: 不要なようであれば後ほど削除
  const { logout, loading, error } = useLogout();
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success(flashMessages.SUCCESSFUL_LOGOUT);
      return router.push('/');
    } else {
      toast.error(`${flashMessages.FAILED_LOGOUT}: ${result.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-pink-100 p-4">
      <div className="container mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">ひとことメモ帳。</h1>
            <p className="text-gray-700 text-sm">感想をひとこと、記憶をひとまとめ。</p>
          </div>
          <Button variant="ghost" className="flex items-center" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
        <Tabs defaultValue="add" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 gap-4 bg-gray-200 p-1">
            <TabsTrigger value="add" setTab={setTab} className={`flex items-center justify-center ${ tab == "add" ? "bg-white" : null}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              メモ追加
            </TabsTrigger>
            <TabsTrigger value="view" setTab={setTab} className={`flex items-center justify-center ${ tab == "view" ? "bg-white" : null}`}>
              <Film className="mr-2 h-4 w-4" />
              振り返り
            </TabsTrigger>
            <TabsTrigger value="best" setTab={setTab} className={`flex items-center justify-center ${ tab == "best" ? "bg-white" : null}`}>
              <Bookmark className="mr-2 h-4 w-4" />
              年度別ベスト
            </TabsTrigger>
            <TabsTrigger value="watchlist" setTab={setTab} className={`flex items-center justify-center ${ tab == "watchlist" ? "bg-white" : null}`}>
              <Bookmark className="mr-2 h-4 w-4" />
              ウォッチリスト
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add" activeTab={tab} isActive={tab == "add"}>
            <AddContentPage />
          </TabsContent>
          <TabsContent value="view" activeTab={tab} isActive={tab == "view"}>
            <ViewContentPage />
          </TabsContent>
          <TabsContent value="best" activeTab={tab} isActive={tab == "best"}>
            <BestContentPage />
          </TabsContent>
          <TabsContent value="watchlist" activeTab={tab} isActive={tab == "watchlist"}>
            <WatchListPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
