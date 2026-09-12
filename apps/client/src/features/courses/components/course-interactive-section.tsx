"use client";

import { useMemo, useState } from "react";
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
import { CourseCard } from "./course-card";
import type { ClientCourseListItem } from "../services/course-service";

interface CourseInteractiveSectionProps {
  initialCourses?: ClientCourseListItem[];
}

export function CourseInteractiveSection({
  initialCourses = [],
}: CourseInteractiveSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả");
  const [levelFilter, setLevelFilter] = useState<string>("Tất cả cấp độ");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Danh mục tabs trích xuất động theo dữ liệu thực tế
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    initialCourses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["Tất cả", ...Array.from(set)];
  }, [initialCourses]);

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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExploreAI = () => {
    setActiveCategory("AI & Dữ liệu");
    setSearchQuery("");
  };

  return (
    <>
      {/* Dynamic Category Tabs using Shadcn UI / Radix Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
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

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger
            className="h-11 min-w-[160px] max-[900px]:min-w-0 max-[900px]:max-w-[145px] bg-white border-[var(--border,#e9eaf0)] text-xs text-[#6c5980] rounded-lg px-3"
            aria-label="Cấp độ khóa học"
          >
            <SelectValue placeholder="Chọn cấp độ" />
          </SelectTrigger>
          <SelectContent align="end">
            {["Tất cả cấp độ", "Nền tảng", "Ứng dụng", "Nâng cao"].map((lvl) => (
              <SelectItem key={lvl} value={lvl} className="text-xs cursor-pointer">
                {lvl}
              </SelectItem>
            ))}
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
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </Empty>
      )}
    </>
  );
}
