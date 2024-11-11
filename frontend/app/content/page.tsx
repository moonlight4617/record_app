"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Film, Bookmark, LogOut } from 'lucide-react'
import { AddContentPage } from "@/features/content/pages/add_content_page"
import { ViewContentPage } from "@/features/content/pages/view_content_page"
import { BestContentPage } from "@/features/content/pages/best_content_page"
import { WatchListPage } from "@/features/content/pages/watch_list_page"

type User = {
  id: string
  name: string
}

export default function ContentManager() {
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState("add")

  const logout = () => {
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-pink-100 p-4">
      <div className="container mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        <Tabs defaultValue="add" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 gap-4 bg-gray-200 p-1">
            <TabsTrigger value="add" setTab={setTab} className={`flex items-center justify-center ${ tab == "add" ? "bg-white" : null}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              Add Content
            </TabsTrigger>
            <TabsTrigger value="view" setTab={setTab} className={`flex items-center justify-center ${ tab == "view" ? "bg-white" : null}`}>
              <Film className="mr-2 h-4 w-4" />
              View Content
            </TabsTrigger>
            <TabsTrigger value="best" setTab={setTab} className={`flex items-center justify-center ${ tab == "best" ? "bg-white" : null}`}>
              <Bookmark className="mr-2 h-4 w-4" />
              Best Content
            </TabsTrigger>
            <TabsTrigger value="watchlist" setTab={setTab} className={`flex items-center justify-center ${ tab == "watchlist" ? "bg-white" : null}`}>
              <Bookmark className="mr-2 h-4 w-4" />
              Watchlist
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
