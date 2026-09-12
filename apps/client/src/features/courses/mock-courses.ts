export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  teacher: string;
  duration: string;
  level: string;
  color: string;
  icon: string;
  label?: string;
  students: number;
  scope?: string;
  lessons: string[];
  skill?: string;
  status: "draft" | "published" | "archived";
  progress?: number;
}

export const mockCourses: Course[] = [
  {
    id: "ai",
    title: "Làm việc cùng AI: từ câu hỏi đến kết quả",
    category: "AI & Dữ liệu",
    description:
      "Biến AI thành người cộng sự. Học cách giao việc rõ ràng, kiểm chứng đầu ra và ứng dụng vào công việc mỗi ngày.",
    teacher: "Ngọc Linh",
    duration: "2 giờ 20 phút",
    level: "Nền tảng",
    color: "lavender",
    icon: "Sparkles",
    label: "AI IN PRACTICE",
    students: 24,
    scope: "Toàn MatureX",
    lessons: [
      "AI trong công việc tại MatureX",
      "Viết đề bài rõ ràng cho AI",
      "Kiểm chứng: đừng dừng ở câu trả lời",
      "Thực hành nghiên cứu khách hàng",
    ],
    skill: "ai",
    status: "published",
    progress: 45,
  },
  {
    id: "culture",
    title: "MatureX & hành trình trưởng thành",
    category: "Văn hoá MatureX",
    description:
      "Hiểu môi trường MatureX, cách phối hợp và thực hành trách nhiệm qua những tình huống gần gũi.",
    teacher: "Đức An",
    duration: "1 giờ 30 phút",
    level: "Nền tảng",
    color: "green",
    icon: "Sprout",
    label: "GROW TOGETHER",
    students: 36,
    scope: "Toàn MatureX",
    lessons: [
      "Môi trường để cùng phát triển",
      "Làm rõ trách nhiệm và cam kết",
      "Phản hồi để cùng tốt hơn",
      "Học từ một điều chưa như ý",
    ],
    skill: "responsibility",
    status: "published",
    progress: 100,
  },
  {
    id: "research",
    title: "Thấu hiểu khách hàng bằng bằng chứng",
    category: "Chuyên môn",
    description:
      "Từ tín hiệu nhu cầu đến giả thuyết sản phẩm. Tạo nghiên cứu có nguồn và đủ rõ để ra quyết định.",
    teacher: "Ngọc Linh",
    duration: "3 giờ 10 phút",
    level: "Ứng dụng",
    color: "peach",
    icon: "ScanSearch",
    label: "CUSTOMER FIRST",
    students: 18,
    scope: "EcomCreate",
    lessons: [
      "Bắt đầu từ vấn đề khách hàng",
      "Tìm và đánh giá nguồn",
      "Từ quan sát đến giả thuyết",
      "Thiết kế thử nghiệm nhỏ",
    ],
    skill: "research",
    status: "published",
  },
  {
    id: "thinking",
    title: "Tư duy phản biện trong công việc",
    category: "Tư duy",
    description:
      "Nhận diện ngụy biện, kiểm chứng lập luận và đưa ra quyết định vững chắc dựa trên dữ liệu thực chứng.",
    teacher: "Thành Đạt",
    duration: "2 giờ",
    level: "Nền tảng",
    color: "blue",
    icon: "Brain",
    label: "CRITICAL THINKING",
    students: 29,
    scope: "Toàn MatureX",
    lessons: [
      "Bẫy tư duy thường gặp",
      "Đặt câu hỏi đào sâu nguyên nhân",
      "Phân biệt ý kiến và sự thật",
      "Tổng hợp góc nhìn đa chiều",
    ],
    skill: "thinking",
    status: "published",
  },
  {
    id: "leadership",
    title: "Phát triển đội ngũ & trao quyền hiệu quả",
    category: "Lãnh đạo",
    description:
      "Nghệ thuật 1-on-1, phản hồi mang tính xây dựng và xây dựng niềm tin trong nhóm tự chủ.",
    teacher: "Minh Quân",
    duration: "2 giờ 45 phút",
    level: "Nâng cao",
    color: "pink",
    icon: "Users",
    label: "PEOPLE & TRUST",
    students: 15,
    scope: "Quản lý",
    lessons: [
      "Tâm lý an toàn trong nhóm",
      "Cách thực hiện 1-on-1 hiệu quả",
      "Trao quyền đi kèm trách nhiệm",
      "Khen ngợi và góp ý đúng lúc",
    ],
    skill: "leadership",
    status: "published",
  },
  {
    id: "builder",
    title: "Tư duy Company Builder: Từ ý tưởng đến vận hành",
    category: "Company Builder",
    description:
      "Hiểu cách một mô hình kinh doanh vận hành, tối ưu nguồn lực và xây dựng hệ thống bền vững.",
    teacher: "Đức An",
    duration: "4 giờ",
    level: "Nâng cao",
    color: "sand",
    icon: "Layers",
    label: "SCALE & OPERATE",
    students: 12,
    scope: "Toàn MatureX",
    lessons: [
      "Bản đồ giá trị cốt lõi",
      "Tối ưu quy trình & tự động hóa",
      "Tài chính căn bản cho Builder",
      "Đo lường tác động thực tế",
    ],
    skill: "business",
    status: "published",
  },
];

export const topicDetails: Record<string, string[]> = {
  ai: [
    "Một đề bài tốt giúp AI hiểu kết quả bạn cần.",
    "Nêu bối cảnh, mục tiêu, đầu vào và tiêu chí đầu ra.",
    "Đối chiếu câu trả lời với nguồn. Ghi rõ điều chưa chắc chắn.",
    "Thử trên một nhiệm vụ nhỏ và tự giải thích lựa chọn của bạn.",
  ],
  culture: [
    "Môi trường học tập được tạo nên từ cách chúng ta làm việc với nhau.",
    "Làm rõ cam kết: ai làm gì, kết quả nào, khi nào hoàn thành.",
    "Khi có sai lệch, trao đổi sớm và giữ căn cứ để cùng tìm cách xử lý.",
    "Nhìn lại một hành động cụ thể và chọn điều muốn làm tốt hơn.",
  ],
  research: [
    "Bắt đầu bằng vấn đề khách hàng, chưa vội chọn giải pháp.",
    "Thu thập quan sát có nguồn và thời điểm. Phân biệt dữ kiện với diễn giải.",
    "Một giả thuyết cần có cách kiểm chứng và giới hạn áp dụng.",
    "Thiết kế thử nghiệm nhỏ: người phụ trách, bằng chứng cần thu, điều kiện dừng.",
  ],
  thinking: [
    "Điều gì đã được quan sát? Điều gì là suy luận của bạn?",
    "Đặt câu hỏi về nguồn, bối cảnh và những cách giải thích khác.",
    "Tìm bằng chứng có thể bác bỏ giả định, không chỉ bằng chứng ủng hộ.",
    "Nêu giới hạn trước khi đưa khuyến nghị hành động.",
  ],
  leadership: [
    "Coaching bắt đầu từ mục tiêu phát triển của người được hướng dẫn.",
    "Làm rõ nhiệm vụ, phạm vi quyết định và tiêu chí hoàn thành.",
    "Dùng câu hỏi giúp người học tự suy nghĩ, rồi phản hồi bằng bằng chứng.",
    "Giảm hỗ trợ khi người học chứng minh được khả năng tự thực hiện.",
  ],
  builder: [
    "Một ý tưởng cần được chuyển thành giả thuyết có thể kiểm chứng.",
    "Xác định khách hàng, vấn đề, người chịu trách nhiệm và giới hạn nguồn lực.",
    "Chốt bằng chứng cần thu và điều kiện dừng trước khi thử nghiệm.",
    "Kết thúc bằng những điều đã học và phần còn cần kiểm chứng.",
  ],
};

export const rubric: string[] = [
  "Rõ vấn đề và mục tiêu",
  "Có nguồn và kiểm chứng",
  "Khả năng áp dụng thực tế",
];

export function getCourseById(id: string): Course | undefined {
  return mockCourses.find((c) => c.id === id);
}
