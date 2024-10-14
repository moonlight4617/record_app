"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'

export default function ContentManager() {
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      })

      console.log(result.status)
      if (result.status == 200) return router.push('/add-content');

      const resultJson = await result.json();
      // TODO: 後ほどフラッシュメッセージに
      alert(resultJson.detail)
    } catch (error) {
      alert(`Sign in failed: ${error}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-pink-100">
      <Card className="w-[350px] bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ログイン</CardTitle>
          <CardDescription className="text-center">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            login(formData.get('email') as string, formData.get('password') as string)
          }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">email</Label>
                <Input id="email" name="email" placeholder="Enter your email" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter your password" />
              </div>
            </div>
            <Button type="submit" className="mt-4 w-full">ログイン</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
