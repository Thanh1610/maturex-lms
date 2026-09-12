"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, Card, Icon, toast } from "@maturex/ui";
import type { LessonItem } from "../services/lesson-service";
import {
  createLessonAction,
  updateLessonAction,
  deleteLessonAction,
  reorderLessonsAction,
} from "../actions/lesson-actions";
import { LessonDialog } from "./lesson-dialog";
import { SortableLessonItem } from "./sortable-lesson-item";
import { VideoPreviewModal } from "./video-preview-modal";

interface CourseLessonsManagerProps {
  courseId: string;
  initialLessons: LessonItem[];
}

export function CourseLessonsManager({
  courseId,
  initialLessons,
}: CourseLessonsManagerProps) {
  const [lessons, setLessons] = useState<LessonItem[]>(initialLessons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [previewLesson, setPreviewLesson] = useState<LessonItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Cấu hình Sensor cho Drag & Drop (PointerSensor + KeyboardSensor)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // Di chuyển chuột tối thiểu 4px mới tính là drag, tránh click nhầm
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mở Dialog thêm mới
  const handleOpenCreate = () => {
    setSelectedLesson(null);
    setDialogOpen(true);
  };

  // Mở Dialog chỉnh sửa
  const handleOpenEdit = (lesson: LessonItem) => {
    setSelectedLesson(lesson);
    setDialogOpen(true);
  };

  // Lưu bài học (Tạo mới hoặc Sửa)
  const handleSaveLesson = async (data: {
    title: string;
    content: string;
    videoUrl?: string | null;
  }) => {
    if (selectedLesson) {
      // Update
      const res = await updateLessonAction({
        id: selectedLesson.id,
        courseId,
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
      });

      if (res.success && res.data) {
        setLessons((prev) =>
          prev.map((item) => (item.id === selectedLesson.id ? res.data! : item))
        );
        toast.success("Đã cập nhật bài học", { description: data.title });
      } else {
        toast.error("Lỗi khi cập nhật", { description: res.error });
        throw new Error(res.error);
      }
    } else {
      // Create
      const res = await createLessonAction({
        courseId,
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
      });

      if (res.success && res.data) {
        setLessons((prev) => [...prev, res.data!]);
        toast.success("Đã thêm bài học mới", { description: data.title });
      } else {
        toast.error("Lỗi khi tạo bài học", { description: res.error });
        throw new Error(res.error);
      }
    }
  };

  // Xóa bài học
  const handleDeleteLesson = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài học "${title}"?`)) return;

    try {
      setIsDeletingId(id);
      const res = await deleteLessonAction({ id, courseId });
      if (res.success) {
        setLessons((prev) => {
          const filtered = prev.filter((item) => item.id !== id);
          return filtered.map((item, index) => ({
            ...item,
            position: index + 1,
          }));
        });
        toast.success("Đã xóa bài học", { description: title });
      } else {
        toast.error("Không thể xóa bài học", { description: res.error });
      }
    } finally {
      setIsDeletingId(null);
    }
  };

  // Kéo thả bài học xong (DragEndEvent)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isReordering) return;

    const oldIndex = lessons.findIndex((item) => item.id === active.id);
    const newIndex = lessons.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Di chuyển mảng với arrayMove
    const newLessons = arrayMove(lessons, oldIndex, newIndex);

    // Cập nhật state lạc quan (Optimistic Update)
    const updatedPositions = newLessons.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));
    setLessons(updatedPositions);

    try {
      setIsReordering(true);
      const orderedIds = updatedPositions.map((item) => item.id);
      const res = await reorderLessonsAction({ courseId, orderedIds });
      if (!res.success) {
        toast.error("Lỗi khi cập nhật thứ tự", { description: res.error });
        setLessons(lessons); // Revert nếu lỗi
      }
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-[#e9eaf0]">
        <div>
          <h3 className="text-sm font-semibold text-[#322741] m-0">
            Chương trình đào tạo ({lessons.length} bài học)
          </h3>
          <p className="text-xs text-[#7d708f] mt-1 m-0">
            Kéo thả icon chấm dọc ở đầu mỗi bài học để sắp xếp lại thứ tự bài giảng.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleOpenCreate}
          className="bg-[#71548e] hover:bg-[#5f4479] text-white text-xs h-8 flex items-center gap-1.5"
        >
          <Icon name="Plus" size={14} />
          <span>Thêm bài học</span>
        </Button>
      </div>

      {/* Danh sách bài học với DnD Kit */}
      {lessons.length === 0 ? (
        <Card className="p-8 text-center bg-[#faf9fc] border border-dashed border-[#dcd3e6] flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#eee7f5] text-[#71548e] flex items-center justify-center mb-3">
            <Icon name="BookOpen" size={20} />
          </div>
          <h4 className="text-sm font-medium text-[#433753] mb-1">
            Chưa có bài học nào
          </h4>
          <p className="text-xs text-[#8c809d] max-w-sm mb-4">
            Khóa học này hiện chưa có bài giảng nào. Hãy bấm nút dưới đây để tạo bài học đầu tiên.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenCreate}
            className="text-xs h-8 text-[#71548e] border-[#d8cae6] hover:bg-[#faf7fd]"
          >
            Thêm bài học ngay
          </Button>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <SortableLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isDeleting={isDeletingId === lesson.id}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteLesson}
                  onPreviewVideo={setPreviewLesson}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Dialog Thêm/Sửa */}
      <LessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lesson={selectedLesson}
        onSave={handleSaveLesson}
      />

      {/* Modal Xem trước Video (Hỗ trợ cả Cloudflare R2, Google Drive, YouTube, Vimeo) */}
      <VideoPreviewModal
        open={Boolean(previewLesson)}
        onOpenChange={(open) => {
          if (!open) setPreviewLesson(null);
        }}
        title={previewLesson?.title || ""}
        videoUrl={previewLesson?.videoUrl || null}
      />
    </div>
  );
}
