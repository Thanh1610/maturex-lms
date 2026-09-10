# Kế Hoạch Chuyển Đổi Toàn Bộ CSS Sang Tailwind CSS (Giữ Nguyên 100% Giao Diện UI)

## Mục tiêu
Chuyển đổi toàn bộ ~6,600 dòng CSS thuần (`styles.css` và các file `src/live/*.css`) sang hệ thống **Tailwind CSS v4** một cách an toàn, có hệ thống, không làm vỡ hoặc thay đổi dù chỉ 1 pixel giao diện người dùng.

---

## Thực trạng mã nguồn CSS
- `src/styles.css`: 5,015 dòng (chứa tokens màu, biến CSS `:root`, reset, layout shell, sidebar, dashboard, catalog, courses, quiz, modals, dark mode).
- `src/live/live.css`: 823 dòng (layout và các module cho app kết nối server).
- `src/live/cohorts.css`: 150 dòng.
- `src/live/integrations.css`: 226 dòng.
- `src/live/organization.css`: 191 dòng.
- `src/live/social.css`: 206 dòng.
- `src/live/learning-tools.css`: 52 dòng.

---

## Nguyên tắc chuyển đổi để UI KHÔNG thay đổi
1. **Zero Visual Regression**: Không viết lại bừa bãi hay xóa class khi chưa map xong.
2. **Khởi tạo Design Tokens chuẩn trong `@theme` (Tailwind v4)**: Đưa toàn bộ biến màu sắc, shadow, font-size, border-radius tùy biến vào Tailwind theme.
3. **Chiến lược lai (Hybrid Migration)**:
   - **Giai đoạn 1**: Ánh xạ token và các base UI components cốt lõi (`ui.jsx`: Button, Badge, Avatar, Modal, Field, Card, etc.).
   - **Giai đoạn 2**: Chuyển đổi các layout shell và navigation (Sidebar, Topbar, AppShell).
   - **Giai đoạn 3**: Chuyển đổi các module con theo tính năng (`Learning.jsx`, `Management.jsx`, `Cohorts`, `Courses`, `Admin`, `Social`).
   - **Giai đoạn 4**: Tối ưu xóa bỏ các file CSS truyền thống tương ứng sau khi test trực quan.

---

## Danh sách Task Thực Hiện (Max 8 Tasks)

- [x] **Task 1: Thiết lập Theme & Design Tokens trong `globals.css`**
  - Khai báo các biến CSS token của MatureX vào `@theme` (`--color-purple`, `--color-lavender`, `--color-surface`, `--shadow-card`, etc.) để Tailwind hiểu chính xác mã màu hex/hsl nguyên bản.
  - *Verify:* Đã verify với `pnpm build` thành công, các token màu ánh xạ 100%.

- [x] **Task 2: Refactor UI Components cơ bản (`src/ui.jsx`)**
  - Thay thế các class CSS thuần (`.btn`, `.badge`, `.avatar`, `.progress`, `.modal`, `.field`, `.empty`) trong `src/ui.jsx` sang Tailwind utility classes.
  - *Verify:* Đã refactor toàn bộ component cốt lõi trong `ui.jsx`, giữ nguyên visual styling.

- [x] **Task 3: Refactor Layout Shell & Header/Sidebar (`src/App.jsx`, `src/live/LiveApp.jsx`)**
  - Thay thế `.app-shell`, `.sidebar`, `.brand`, `.nav-item`, `.topbar`, `.live-sidebar`, `.live-topbar` bằng Tailwind classes tương đương.
  - *Verify:* Cả bản live (`LiveApp.jsx`) và bản demo (`App.jsx`) đều đã refactor shell & sidebar sang Tailwind flex/grid.

- [ ] **Task 4: Chuyển đổi các trang học viên (`src/Learning.jsx`)**
  - Chuyển đổi Dashboard, Course Viewer, Lesson Player, Quiz, Assignment cards sang Tailwind.
  - *Verify:* Mở giao diện xem khóa học và bài tập, các thẻ card và thanh tiến độ hiển thị đúng chuẩn.

- [ ] **Task 5: Chuyển đổi các trang quản trị (`src/Management.jsx`)**
  - Chuyển đổi Studio, Reviews, Team list, Reports sang Tailwind.
  - *Verify:* Mở trang Quản lý đào tạo (Studio) và Báo cáo, bảng dữ liệu và form nhập liệu không bị lệch layout.

- [ ] **Task 6: Chuyển đổi module Live (`src/live/*.jsx` & các file css con)**
  - Thay thế CSS của `cohorts.css`, `integrations.css`, `organization.css`, `social.css` trực tiếp vào JSX của các component tương ứng.
  - *Verify:* Mở các tab Lớp học, Tích hợp, Cộng đồng, Cài đặt và kiểm tra.

- [ ] **Task 7: Loại bỏ dần `styles.css` và các file CSS cũ**
  - Gỡ bỏ import `styles.css` khỏi `layout.tsx`, chỉ giữ lại Tailwind utility và `@layer` cần thiết trong `globals.css`.
  - *Verify:* Xóa file/bỏ import mà không có bất kỳ thành phần nào bị mất style.

- [ ] **Task 8: Kiểm tra Linter & Build tổng thể**
  - Chạy `pnpm lint` (Biome) và `pnpm build` để đảm bảo mã nguồn sạch sẽ, không lỗi type hay parser.
  - *Verify:* Lệnh `pnpm lint` và `pnpm build` trả về mã 0 (thành công).

---

## Tiêu chí Hoàn thành (Done When)
- [ ] Toàn bộ class CSS thuần trong dự án được thay thế bằng Tailwind CSS v4.
- [ ] Tất cả các file `.css` cũ (`styles.css`, `live/*.css`) được loại bỏ hoàn toàn.
- [ ] Giao diện (màu sắc, khoảng cách, font, responsive, dark mode, hover states) giữ nguyên 100%.
- [ ] `pnpm lint` và `pnpm build` thành công không có lỗi.
