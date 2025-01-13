"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { confirmSignUp } from "@/app/hooks/authService";
import { placeholders } from "@/features/content/constants/placeholders";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { flashMessages } from "@/features/content/constants/flash_messages";

export default function ContentManager() {
  const router = useRouter();

  const confirm = async (email: string, code: string) => {
    try {
      const result = await confirmSignUp(email, code);
      result.$metadata.httpStatusCode === 200
        ? router.push("/content")
        : toast.error(`${flashMessages.CODE_INCORRECT}: ${result}`);
    } catch (error) {
      toast.error(`${flashMessages.ERROR_OCCURRED}: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px] bg-white backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            認証コードの確認
          </CardTitle>
          <CardDescription>
            メールに届いた認証コードを入力して下さい
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              confirm(
                formData.get("email") as string,
                formData.get("code") as string
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
                <Label htmlFor="code">認証コード</Label>
                <Input id="code" name="code" placeholder={placeholders.CODE} />
              </div>
            </div>
            <Button type="submit" className="mt-4 w-full">
              送信
            </Button>
            <hr className="my-4 border-gray-400" />
            <Link className="text-blue-500 hover:text-blue-800" href="/sign-up">
              新規登録はこちら
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
