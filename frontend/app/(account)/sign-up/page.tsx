"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'

export default function ContentManager() {
  const router = useRouter();

  const handleSignUp = async (email: string, password: string, confirmPassword: string) => {
    // TODO: フラッシュメッセージに変更
    if (password !== confirmPassword) {
      alert('確認用パスワードが違います');
      return;
    }
    try {
      // await signUp(email, password);
      router.push('/confirm');
      console.log("sign up!")
    } catch (error) {
      alert(`Sign up failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-pink-100">
      <Card className="w-[350px] bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ユーザー登録</CardTitle>
          <CardDescription className="text-center">Sign up your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            handleSignUp(formData.get('email') as string, formData.get('password') as string, formData.get('confirmPassword') as string)
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
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Enter your password for confirm" />
              </div>
            </div>
            <Button type="submit" className="mt-4 w-full">登録</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
