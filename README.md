# Learning Platform (Next.js 15 App Router)

Một nền tảng học trực tuyến hiện đại, mượt mà và tối ưu hóa SEO được xây dựng bằng **Next.js 15 App Router**, **React 19**, và **Tailwind CSS**. Dự án này không chỉ tập trung vào trải nghiệm người dùng (UI/UX) với các hiệu ứng bắt mắt mà còn áp dụng sâu rộng các chiến lược Render tiên tiến của Next.js để đạt hiệu năng tối đa.

## Hướng dẫn cài đặt và chạy máy Local

Để chạy dự án này trên máy tính của bạn, vui lòng thực hiện các bước sau:

1. **Cài đặt các gói phụ thuộc (Dependencies):**
   Mở terminal tại thư mục gốc của dự án và chạy:
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường (.env):**
   Tạo một file `.env` ở thư mục gốc của dự án (cùng cấp với `package.json`). Dự án hiện tại sử dụng mock data, nhưng bạn có thể thiết lập các biến môi trường nền tảng nếu cần:
   ```env
   # .env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Khởi động Server Dev:**
   Chạy lệnh sau để khởi động môi trường phát triển:
   ```bash
   npm run dev
   ```
   Sau đó mở trình duyệt và truy cập vào [http://localhost:3000](http://localhost:3000).

---

## Các Chiến Lược Render (Render Strategies) Được Sử Dụng

Phần cốt lõi tạo nên sức mạnh và tốc độ của dự án này chính là việc áp dụng đúng đắn các chiến lược Render của Next.js App Router cho từng bài toán cụ thể. Dưới đây là phân tích chi tiết:

### 1. ISR (Incremental Static Regeneration) - Trang Danh Sách Khóa Học (`/courses`)
- **Triển khai:** Tại `src/app/courses/page.tsx`, dự án sử dụng cấu hình `export const revalidate = 60`.
- **Lý do lựa chọn:** Trang danh sách khóa học là một trang cần SEO tốt và tốc độ tải trang cực nhanh (vì đây là trang "mặt tiền"). Tuy nhiên, dữ liệu khóa học có thể thỉnh thoảng được cập nhật (thêm khóa mới, sửa mô tả, tìm kiếm). ISR cho phép Next.js **phục vụ một trang tĩnh (HTML) ngay lập tức** cho người dùng từ cache, nhưng sau 60 giây, nếu có request mới, Next.js sẽ tự động **tái tạo lại trang ở background** để cập nhật dữ liệu mới nhất mà không bắt người dùng phải đợi quá trình fetch.
- **Lợi ích:** Đạt điểm 10/10 cho Performance (nhanh như SSG) và vẫn giữ được dữ liệu tương đối mới (như SSR).

### 2. SSG (Static Site Generation) - Trang Chi Tiết Khóa Học (`/courses/[id]`)
- **Triển khai:** Tại `src/app/courses/[id]/page.tsx`, dự án sử dụng hàm `generateStaticParams()` để trả về các mảng ID phổ biến (ví dụ `c1`, `c2`, `c3`).
- **Lý do lựa chọn:** Đối với các khóa học "hot" hoặc có lượng truy cập lớn, chúng ta biết trước ID của chúng. Dùng `generateStaticParams` báo cho Next.js biết hãy pre-render toàn bộ HTML của các trang khóa học này ngay trong lúc **Build Time**.
- **Lợi ích:** Khi người dùng truy cập vào khóa học `c1`, trang sẽ load ngay lập tức mà không cần tốn bất kỳ một mili-giây nào để gọi API hay query Database. Tối ưu cực độ cho trải nghiệm người dùng và bot quét SEO.

### 3. SSR (Server-Side Rendering) & Middleware - Luồng Xác Thực (Auth) và Tiến độ
- **Triển khai:** 
  - Trang Login (`/auth/login`) và các Server Actions (`src/actions/auth.ts`, `src/actions/progress.ts`).
  - Middleware (`src/middleware.ts`) chặn và điều hướng request dựa trên Cookies.
- **Lý do lựa chọn:** Authentication (Đăng nhập/Đăng xuất) và Tiến độ học tập là các luồng dữ liệu **cá nhân hóa hoàn toàn** (Highly Personalized) và luôn thay đổi (Dynamic). Chúng không bao giờ được phép cache tĩnh.
  - **Middleware** chạy trên môi trường Edge để kiểm tra Cookie của mỗi Request trước khi nó chạm tới Page. Nếu người dùng chưa đăng nhập, họ bị chặn lại và redirect ngay lập tức rất an toàn.
  - Khi hoàn thành bài học, **Server Action** thực hiện lưu Cookie và gọi hàm lệnh tối thượng **`revalidatePath('/courses', 'layout')`**. Lệnh này thông báo cho Next.js chủ động xóa sạch bộ nhớ đệm (cả Server Cache và Client Router Cache), buộc trang phải SSR (Render lại từ đầu) trong lần truy cập tiếp theo để tính toán lại % Tiến độ học tập cá nhân mới nhất.
- **Lợi ích:** Đảm bảo bảo mật tuyệt đối, tính chính xác của dữ liệu real-time (tiến độ khóa học) mà vẫn không phá hỏng kiến trúc caching của toàn dự án.
