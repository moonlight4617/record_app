"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify';
import { useState } from "react"
import Link from "next/link"
import  { redirectToCognito } from "@/app/hooks/send_google"

// TODO: 後ほどログインボタンのデザイン、ログイン中の挙動制御
export default function ContentManager() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false); // ログイン処理中かどうか

  const login = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          // email: email,
          password: password,
        }),
        mode: "cors",
        credentials: "include"
      })
      if (result.status == 200) {
        toast.success("ログインに成功しました");
        // TODO: URLは定数化
        return router.push('/content');
      }
      const resultJson = await result.json();
      toast.error(`ログイン失敗しました: ${resultJson.detail}`)
    } catch (error) {
      toast.error(`ログイン失敗しました: ${error}`)
    }
     finally {
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // await fetch('api/auth/google-sign-in')
      const returnUrl = await redirectToCognito()
      window.location.href = returnUrl
    } catch (error) {
      toast.error(`エラーが発生しました: ${error}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-pink-100">
      <Card className="w-[350px] bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            login(formData.get('email') as string, formData.get('password') as string)
          }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" name="email" placeholder="Enter your email" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">パスワード</Label>
                <Input id="password" name="password" type="password" placeholder="Enter your password" />
              </div>
            </div>
            {
              isSubmitting ? (
                <Button disabled type="submit" className="mt-4 w-full !bg-blue-300">Logging in...</Button>
              ) : (
                <Button type="submit" className="mt-4 w-full">ログイン</Button>
              )
            }
            <hr className="my-4 border-gray-400" />
            <Link className="text-blue-500 hover:text-blue-800" href="/sign-up">新規登録はこちら</Link>
          </form>
        <Button className="text-blue-500 hover:text-blue-800" onClick={handleGoogleLogin}>Googleログイン</Button>
        </CardContent>
      </Card>
    </div>
  )
}
