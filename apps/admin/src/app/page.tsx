import { Button } from "@maturex/ui";

export default function AdminPage() {
  return (
    <main className="p-10 flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-[#393245] mb-4">
        MatureX Admin Management
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Không gian quản trị đào tạo, thống kê người dùng và khóa học. Phân hệ sẵn sàng để phát triển.
      </p>
      <div className="flex gap-4">
        <a href="http://localhost:3000">
          <Button variant="outline">Sang Client (Port 3000)</Button>
        </a>
        <a href="http://localhost:3001">
          <Button variant="secondary">Sang Demo (Port 3001)</Button>
        </a>
      </div>
    </main>
  );
}
