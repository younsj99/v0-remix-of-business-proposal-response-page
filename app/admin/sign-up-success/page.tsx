import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Team Sparta" width={200} height={40} className="h-10 w-auto" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">이메일을 확인해주세요</CardTitle>
              <CardDescription>회원가입이 거의 완료되었습니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                입력하신 이메일 주소로 확인 링크를 보내드렸습니다. 이메일의 링크를 클릭하여 계정을 활성화해주세요.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/login">로그인 페이지로 이동</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
