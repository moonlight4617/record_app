"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/hooks/authService";
import { placeholders } from "@/features/content/constants/placeholders";
import { flashMessages } from "@/features/content/constants/flash_messages";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ContentManager() {
  const router = useRouter();

  const handleSignUp = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      if (password !== confirmPassword) {
        toast.error(flashMessages.CONFIRMATION_PASSWORD_INCORRECT);
        return;
      }

      const result = await signUp(email, password);
      result.$metadata.httpStatusCode === 200
        ? router.push("/confirm")
        : toast.error(`${flashMessages.FAILED_USER_REGISTRATION}: ${result}`);
    } catch (error) {
      toast.error(`${flashMessages.ERROR_OCCURRED}: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px] bg-white backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>ユーザー登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSignUp(
                formData.get("email") as string,
                formData.get("password") as string,
                formData.get("confirmPassword") as string
              );
            }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder={placeholders.EMAIL}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={placeholders.PASSWORD}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">パスワードの確認</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={placeholders.CONFIRMPASSWORD}
                />
              </div>
            </div>
            <Button type="submit" className="mt-4 w-full">
              登録
            </Button>
            <hr className="my-4 border-gray-400" />
            <Link className="text-blue-500 hover:text-blue-800" href="/">
              既に登録済みの方はこちら
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
