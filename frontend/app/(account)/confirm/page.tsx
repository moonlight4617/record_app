"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { confirmSignUp } from '@/app/hooks/authService'
import { useRouter } from 'next/navigation'

export default function ContentManager() {
  const router = useRouter();

  const confirm = async (email: string, code: string) => {
    try {
      const result = await confirmSignUp(email, code);
      result.$metadata.httpStatusCode === 200 ? router.push('/add-content') : console.error("認証コードが違います:", result)
    } catch (error) {
      alert(`認証コードが違います: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-pink-100">
      <Card className="w-[350px] bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">認証コード送信</CardTitle>
          <CardDescription className="text-center">Confirm your code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            confirm(formData.get('email') as string, formData.get('code') as string)
          }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">email</Label>
                <Input id="email" name="email" placeholder="Enter your email" />
              </div>
              <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="code">認証コード</Label>
                  <Input id="code" name="code" placeholder="Enter your code" />
              </div>
            </div>
            <Button type="submit" className="mt-4 w-full">送信</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
