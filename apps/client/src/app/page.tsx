export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-xl border border-[var(--border,#e9eaf0)] shadow-xs">
      <h1 className="text-2xl font-bold text-[#393245] mb-2">
        Chào mừng đến với MatureX LMS
      </h1>
      <p className="text-sm text-[#737381] max-w-md">
        Sidebar chuẩn Shadcn UI đã được tích hợp thành công vào layout chính.
      </p>
    </div>
  );
}
