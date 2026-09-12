"use client";

import * as React from "react";
import Link from "next/link";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@maturex/ui";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableFilter {
  id: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: DataTableColumn<T>[];
  // Search
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  // Filters
  filters?: DataTableFilter[];
  // Create New Action
  createAction?: {
    label: string;
    href: string;
    icon?: string;
  };
  // Selection & Bulk Actions
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  bulkDeleteLabel?: string;
  // Empty State
  emptyMessage?: string;
  // Loading
  isLoading?: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
  createAction,
  selectable = true,
  selectedIds = [],
  onSelectionChange,
  onBulkDelete,
  bulkDeleteLabel = "Xóa",
  emptyMessage = "Không tìm thấy dữ liệu nào phù hợp.",
  isLoading = false,
}: DataTableProps<T>) {
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = React.useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = React.useState(false);

  // O(1) lookup set for selection
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const isAllSelected =
    data.length > 0 && data.every((item) => selectedSet.has(item.id));
  const isSomeSelected =
    !isAllSelected && data.some((item) => selectedSet.has(item.id));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      const dataIdSet = new Set(data.map((item) => item.id));
      onSelectionChange(selectedIds.filter((id) => !dataIdSet.has(id)));
    } else {
      const merged = new Set(selectedIds);
      data.forEach((item) => merged.add(item.id));
      onSelectionChange(Array.from(merged));
    }
  };

  const handleSelectOne = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedSet.has(id)
        ? selectedIds.filter((itemId) => itemId !== id)
        : [...selectedIds, id]
    );
  };

  const handleConfirmBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      await onBulkDelete(selectedIds);
      setShowBulkDeleteDialog(false);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const totalColumns = columns.length + (selectable ? 1 : 0);

  return (
    <Card className="p-5 sm:p-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {onSearchChange !== undefined && (
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#968ca2]"
              />
              <Input
                type="text"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={searchTerm || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          )}

          {filters.map((filter) => (
            <Select
              key={filter.id}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className={`text-xs h-9 ${filter.width || "w-[150px]"}`}>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {selectable && onBulkDelete && selectedIds.length > 0 ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingBulk}
              onClick={() => setShowBulkDeleteDialog(true)}
              className="text-xs h-9 flex items-center gap-1.5 px-3 bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all animate-in fade-in"
            >
              <Icon name="Trash2" size={15} />
              <span>
                {bulkDeleteLabel} ({selectedIds.length})
              </span>
            </Button>
          ) : null}

          {createAction ? (
            <Button
              asChild
              className="bg-[#71548e] text-white hover:bg-[#5f447a] text-xs flex items-center gap-1.5 h-9 shrink-0 cursor-pointer"
            >
              <Link href={createAction.href}>
                <Icon name={createAction.icon || "Plus"} size={16} />
                <span>{createAction.label}</span>
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#eee8f5] bg-[#faf8fc]/60 hover:bg-[#faf8fc]">
            {selectable && (
              <TableHead className="w-10 px-3 text-center">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#71548e] focus:ring-[#71548e] cursor-pointer accent-[#71548e]"
                />
              </TableHead>
            )}

            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`text-xs font-semibold text-[#66547a] ${
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left"
                } ${col.headerClassName || ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={totalColumns} className="text-center py-10 text-xs text-[#8c8297]">
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} className="text-center py-10 text-xs text-[#8c8297]">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const isChecked = selectedSet.has(item.id);
              return (
                <TableRow
                  key={item.id}
                  className={`border-b border-[#f4edf8] hover:bg-[#faf7fd] transition-colors ${
                    isChecked ? "bg-[#f8f3fc]/60" : ""
                  }`}
                >
                  {selectable ? (
                    <TableCell className="w-10 px-3 text-center py-3.5">
                      <input
                        type="checkbox"
                        aria-label={`Chọn mục ${item.id}`}
                        checked={isChecked}
                        onChange={() => handleSelectOne(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#71548e] focus:ring-[#71548e] cursor-pointer accent-[#71548e]"
                      />
                    </TableCell>
                  ) : null}

                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`text-xs py-3.5 ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      } ${col.className || ""}`}
                    >
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Bulk Delete Confirm Dialog */}
      {selectable && onBulkDelete && (
        <Dialog
          open={showBulkDeleteDialog}
          onOpenChange={(open) => !open && setShowBulkDeleteDialog(false)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
                <Icon name="AlertTriangle" size={20} />
              </div>
              <DialogTitle className="text-base font-semibold text-[#2d223c]">
                Xác nhận xóa {selectedIds.length} mục đã chọn
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6e617d] leading-relaxed">
                Bạn có chắc chắn muốn xóa toàn bộ{" "}
                <strong className="text-red-600 font-semibold">
                  {selectedIds.length}
                </strong>{" "}
                mục đã chọn này không? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeletingBulk}
                onClick={() => setShowBulkDeleteDialog(false)}
                className="text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeletingBulk}
                onClick={handleConfirmBulkDelete}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeletingBulk ? "Đang xóa..." : `Xác nhận xóa (${selectedIds.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
