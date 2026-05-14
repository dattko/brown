import Link from "next/link";

export default function StockNotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16">
      <h1 className="text-lg font-semibold">종목을 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground">
        6자리 숫자 종목코드 형식이 아니거나 잘못된 주소입니다.
      </p>
      <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        홈으로
      </Link>
    </main>
  );
}
