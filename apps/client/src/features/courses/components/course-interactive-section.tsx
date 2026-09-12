"use client";

import {
  Button,
  Empty,
  Icon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@maturex/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { findFromSlug, slugify } from "@/lib/slug-helper";
import type { ClientCourseListItem } from "../services/course-service";
import { CourseCard } from "./course-card";

interface CourseInteractiveSectionProps {
  initialCourses?: ClientCourseListItem[];
}

const LEVEL_OPTIONS = [
  "Tất cả cấp độ",
  "Nền tảng",
  "Ứng dụng",
  "Nâng cao",
] as const;

export function CourseInteractiveSection({
  initialCourses = [],
}: CourseInteractiveSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Danh mục tabs trích xuất động theo dữ liệu thực tế
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    initialCourses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["Tất cả", ...Array.from(set)];
  }, [initialCourses]);

  // Read initial states from URL query params (hỗ trợ cả slug đẹp lẫn chuỗi thô để tương thích ngược)
  const categoryParam = searchParams.get("category");
  const categoryFromUrl = useMemo(
    () => findFromSlug(categoryParam, dynamicCategories, "Tất cả"),
    [categoryParam, dynamicCategories],
  );

  const levelParam = searchParams.get("level");
  const levelFromUrl = useMemo(
    () => findFromSlug(levelParam, LEVEL_OPTIONS, "Tất cả cấp độ"),
    [levelParam],
  );

  const searchFromUrl = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl);
  const [levelFilter, setLevelFilter] = useState<string>(levelFromUrl);
  const [searchQuery, setSearchQuery] = useState<string>(searchFromUrl);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Sync state if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setActiveCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setLevelFilter(levelFromUrl);
  }, [levelFromUrl]);

  useEffect(() => {
    setSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  // Helper to push updated query parameters to URL with clean slugs
  const updateUrlParams = useCallback(
    (updates: { category?: string; level?: string; q?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.category !== undefined) {
        if (updates.category === "Tất cả" || !updates.category) {
          params.delete("category");
        } else {
          params.set("category", slugify(updates.category));
        }
      }

      if (updates.level !== undefined) {
        if (updates.level === "Tất cả cấp độ" || !updates.level) {
          params.delete("level");
        } else {
          params.set("level", slugify(updates.level));
        }
      }

      if (updates.q !== undefined) {
        const trimmed = updates.q.trim();
        if (!trimmed) {
          params.delete("q");
        } else {
          params.set("q", trimmed);
        }
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    },
    [searchParams, pathname, router],
  );

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    updateUrlParams({ category });
  };

  // Handle level change
  const handleLevelChange = (level: string) => {
    setLevelFilter(level);
    updateUrlParams({ level });
  };

  // Debounce search query to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchFromUrl) {
        updateUrlParams({ q: searchQuery });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFromUrl, updateUrlParams]);

  // Bộ lọc dữ liệu theo Danh mục, Cấp độ và Từ khóa tìm kiếm
  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return initialCourses.filter((course) => {
      const matchCategory =
        activeCategory === "Tất cả" || course.category === activeCategory;
      const matchLevel =
        levelFilter === "Tất cả cấp độ" || course.level === levelFilter;
      const matchSearch =
        query === "" ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.teacher.toLowerCase().includes(query);

      return matchCategory && matchLevel && matchSearch;
    });
  }, [initialCourses, activeCategory, levelFilter, searchQuery]);

  const toggleBookmark = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <>
      {/* Dynamic Category Tabs using Shadcn UI / Radix Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <TabsList className="mb-5 flex-wrap h-auto">
          {dynamicCategories.map((category) => {
            const count =
              category === "Tất cả"
                ? initialCourses.length
                : initialCourses.filter((c) => c.category === category).length;

            return (
              <TabsTrigger key={category} value={category}>
                <span>{category}</span>
                <span className="bg-[#f0eaf7] text-[#9477b8] text-[10px] px-1.5 py-0.5 rounded-[5px] ml-1">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Filter Row with Search input and Level select from Shadcn UI */}
      <div className="filter-row flex gap-3 max-[900px]:gap-2 items-center mb-[19px]">
        <div className="relative flex-1 min-w-0">
          <Icon
            name="Search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#afa5b8] pointer-events-none"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm khóa học, chủ đề, giảng viên…"
            aria-label="Tìm khóa học"
            className="pl-9 h-11 bg-white border-[var(--border,#e9eaf0)] text-xs text-[#56515f] placeholder:text-[#afa5b8] rounded-lg focus-visible:border-[#cbb8e0] focus-visible:ring-[#cbb8e0]/30"
          />
        </div>

        <Select value={levelFilter} onValueChange={handleLevelChange}>
          <SelectTrigger
            className="h-11 min-w-[160px] max-[900px]:min-w-0 max-[900px]:max-w-[145px] bg-white border-[var(--border,#e9eaf0)] text-xs text-[#6c5980] rounded-lg px-3"
            aria-label="Cấp độ khóa học"
          >
            <SelectValue placeholder="Chọn cấp độ" />
          </SelectTrigger>
          <SelectContent align="end">
            {["Tất cả cấp độ", "Nền tảng", "Ứng dụng", "Nâng cao"].map(
              (lvl) => (
                <SelectItem
                  key={lvl}
                  value={lvl}
                  className="text-xs cursor-pointer"
                >
                  {lvl}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Course Count Display */}
      <div className="between catalog-count flex items-center justify-between m-[0_0_17px]">
        <p className="muted small text-[10px] text-[var(--muted,#9b91ab)] m-0">
          {filteredCourses.length} khóa học dành cho bạn
        </p>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="course-grid three grid grid-cols-3 max-md:grid-cols-1 gap-[18px]">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isSaved={savedIds.includes(course.id)}
              onToggleBookmark={() => toggleBookmark(course.id)}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Chưa có khóa học phù hợp"
          description="Thử thay đổi từ khóa tìm kiếm, danh mục hoặc bộ lọc cấp độ."
        >
          <Button
            variant="outline"
            onClick={() => {
              setActiveCategory("Tất cả");
              setLevelFilter("Tất cả cấp độ");
              setSearchQuery("");
              updateUrlParams({
                category: "Tất cả",
                level: "Tất cả cấp độ",
                q: "",
              });
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </Empty>
      )}
    </>
  );
}
