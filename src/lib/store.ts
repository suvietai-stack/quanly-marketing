import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ID = string;

export interface Brand {
  id: ID;
  name: string;
  field?: string;
  website?: string;
  description?: string;
  usp?: string;
  owner?: string;
  status: "Đang xây dựng" | "Đang vận hành" | "Đang tối ưu" | "Tạm dừng" | "Lưu trữ";
  docLink?: string;
  notes?: string;
}

export interface Website {
  id: ID;
  name: string;
  url: string;
  brandId: ID;
  seoOwner?: string;
  contentOwner?: string;
  techOwner?: string;
  status: "Đang xây dựng" | "Đang vận hành" | "Đang tối ưu" | "Tạm dừng";
  notes?: string;
}

export interface SocialChannel {
  id: ID;
  name: string;
  platform: "Facebook Page" | "Facebook Group" | "TikTok" | "YouTube" | "Instagram" | "Zalo OA" | "Khác";
  url?: string;
  brandId: ID;
  owner?: string;
  frequency?: string;
  goal?: string;
  status: "Đang xây" | "Đang vận hành" | "Đang tối ưu" | "Tạm dừng";
  notes?: string;
}

export interface LocalPlace {
  id: ID;
  name: string;
  mapLink?: string;
  brandId: ID;
  address?: string;
  phone?: string;
  owner?: string;
  verifyStatus: "Đã xác minh" | "Chưa xác minh" | "Đang xử lý";
  notes?: string;
}

export type TaskPriority = "Thấp" | "Trung bình" | "Cao" | "Gấp";
export type TaskStatus = "Chưa làm" | "Đang làm" | "Hoàn thành";

export interface Task {
  id: ID;
  title: string;
  brandId?: ID;
  assignee?: string;
  reporter?: string;
  deadline?: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  link?: string;
  plan?: string;
  topic?: string;
  completedAt?: string;
}

export type ContentStatus =
  | "Kế hoạch"
  | "Đã giao"
  | "Đang viết"
  | "Chờ duyệt"
  | "Cần sửa"
  | "Đã duyệt"
  | "Chờ đăng"
  | "Đã đăng"
  | "Hoàn thành";

export interface WebContent {
  id: ID;
  websiteId: ID;
  brandId: ID;
  type: "Bài SEO" | "Bài blog" | "Landing page" | "Bài danh mục" | "Bài sản phẩm" | "Bài tối ưu lại";
  cluster?: string;
  mainKeyword?: string;
  subKeywords?: string;
  title: string;
  brief?: string;
  writer?: string;
  reviewer?: string;
  deadline?: string;
  publishDate?: string;
  outlineLink?: string;
  draftLink?: string;
  imageLink?: string;
  publishedLink?: string;
  indexStatus: "Chưa kiểm tra" | "Chưa index" | "Đã index";
  status: ContentStatus;
  plan?: string;
  topic?: string;
  notes?: string;
}

export type SocialStatus =
  | "Ý tưởng"
  | "Đang làm"
  | "Chờ duyệt"
  | "Cần sửa"
  | "Đã duyệt"
  | "Đã lên lịch"
  | "Đã đăng"
  | "Hoàn thành";

export interface SocialPost {
  id: ID;
  title: string;
  brandId: ID;
  channelId: ID;
  platform: string;
  contentType: "Bài ảnh đơn" | "Album" | "Carousel" | "Text" | "Reels" | "TikTok Video" | "YouTube Shorts" | "Story" | "Livestream" | "Khác";
  topic?: string;
  plan?: string;
  writer?: string;
  designer?: string;
  reviewer?: string;
  scheduledDate?: string;
  publishedDate?: string;
  caption?: string;
  mediaLink?: string;
  publishedLink?: string;
  status: SocialStatus;
  notes?: string;
}

export interface MapPost {
  id: ID;
  title: string;
  placeId: ID;
  brandId: ID;
  content?: string;
  type: "Cập nhật" | "Sản phẩm" | "Ưu đãi" | "Sự kiện" | "Khác";
  owner?: string;
  scheduledDate?: string;
  publishedDate?: string;
  imageLink?: string;
  publishedLink?: string;
  status: SocialStatus;
  plan?: string;
  topic?: string;
  notes?: string;
}

export interface MapReview {
  id: ID;
  placeId: ID;
  reviewer: string;
  stars: number;
  content?: string;
  date?: string;
  responseStatus: "Chưa phản hồi" | "Đã phản hồi";
  responder?: string;
  notes?: string;
}

export type VideoStatus = "Ý tưởng" | "Đang sản xuất" | "Chờ duyệt" | "Cần sửa" | "Đã bàn giao" | "Hoàn thành";

export interface Video {
  id: ID;
  title: string;
  brandId: ID;
  channels?: string;
  purpose?: string;
  owner?: string;
  reviewer?: string;
  deadline?: string;
  scriptLink?: string;
  footageLink?: string;
  editLink?: string;
  finalLink?: string;
  publishedLink?: string;
  status: VideoStatus;
  plan?: string;
  topic?: string;
  notes?: string;
}

export type OrderStatus = "Mới tạo" | "Đang làm" | "Chờ duyệt" | "Cần sửa" | "Đã bàn giao" | "Hoàn thành";

export interface DesignOrder {
  id: ID;
  title: string;
  brandId: ID;
  type: "Banner website" | "Ảnh bài web" | "Ảnh social" | "Thumbnail video" | "Ảnh sản phẩm" | "Catalogue / profile" | "Chụp ảnh" | "Retouch ảnh" | "Khác";
  source: "Web" | "Social" | "Video" | "Local" | "Leader" | "Khác";
  requester?: string;
  assignee?: string;
  reviewer?: string;
  deadline?: string;
  brief?: string;
  size?: string;
  quantity?: number;
  refLink?: string;
  deliverLink?: string;
  status: OrderStatus;
  plan?: string;
  topic?: string;
  notes?: string;
}

export interface Person {
  id: ID;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  status: "Đang làm" | "Tạm nghỉ";
  notes?: string;
}

export interface SeoCheckItem {
  id: ID;
  websiteId: ID;
  group: string;
  name: string;
  done: boolean;
  checker?: string;
  notes?: string;
  proofLink?: string;
}

interface State {
  brands: Brand[];
  websites: Website[];
  socials: SocialChannel[];
  places: LocalPlace[];
  tasks: Task[];
  webContents: WebContent[];
  socialPosts: SocialPost[];
  mapPosts: MapPost[];
  reviews: MapReview[];
  videos: Video[];
  orders: DesignOrder[];
  people: Person[];
  seoChecks: SeoCheckItem[];
  plans: string[];
  topics: string[];

  add: <K extends keyof Collections>(key: K, item: Collections[K]) => void;
  update: <K extends keyof Collections>(key: K, id: ID, patch: Partial<Collections[K]>) => void;
  remove: <K extends keyof Collections>(key: K, id: ID) => void;
}

type Collections = {
  brands: Brand;
  websites: Website;
  socials: SocialChannel;
  places: LocalPlace;
  tasks: Task;
  webContents: WebContent;
  socialPosts: SocialPost;
  mapPosts: MapPost;
  reviews: MapReview;
  videos: Video;
  orders: DesignOrder;
  people: Person;
  seoChecks: SeoCheckItem;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

const seed = () => {
  const brands: Brand[] = [
    { id: "b1", name: "Sứ Việt", field: "Gốm sứ Bát Tràng", website: "xuonggomsuviet.vn", description: "Xưởng gốm Bát Tràng truyền thống", usp: "Sản xuất tại xưởng, gốm thủ công cao cấp", owner: "Nguyễn Văn A", status: "Đang vận hành" },
    { id: "b2", name: "Sứ Minh Đăng", field: "Gốm sứ cao cấp", website: "suminhdang.com", description: "Gốm sứ Minh Đăng - quà tặng doanh nghiệp", owner: "Trần Thị B", status: "Đang tối ưu" },
    { id: "b3", name: "Thổ Tú", field: "Tượng gốm phong thủy", website: "thotu.vn", description: "Tượng gốm phong thủy Thổ Tú", owner: "Lê Văn C", status: "Đang vận hành" },
    { id: "b4", name: "Đồ Thờ Tín Tâm", field: "Đồ thờ gốm sứ", description: "Bộ đồ thờ Tín Tâm", owner: "Phạm D", status: "Đang xây dựng" },
    { id: "b5", name: "Không Gian Gốm Hà Nội", field: "Showroom gốm sứ", description: "Showroom trưng bày Hà Nội", owner: "Hoàng E", status: "Đang vận hành" },
  ];
  const websites: Website[] = [
    { id: "w1", name: "Xưởng Gốm Sứ Việt", url: "https://xuonggomsuviet.vn", brandId: "b1", seoOwner: "Nguyễn Văn A", contentOwner: "Mai", techOwner: "Hùng", status: "Đang vận hành" },
    { id: "w2", name: "Tinh Hoa Bát Tràng", url: "https://tinhhoabattrang.vn", brandId: "b1", status: "Đang xây dựng" },
    { id: "w3", name: "Sứ Minh Đăng", url: "https://suminhdang.com", brandId: "b2", status: "Đang tối ưu" },
    { id: "w4", name: "Thổ Tú", url: "https://thotu.vn", brandId: "b3", status: "Đang vận hành" },
  ];
  const socials: SocialChannel[] = [
    { id: "s1", name: "TikTok Sứ Việt", platform: "TikTok", brandId: "b1", owner: "Mai", frequency: "5 bài/tuần", status: "Đang vận hành" },
    { id: "s2", name: "Facebook Page Sứ Minh Đăng", platform: "Facebook Page", brandId: "b2", owner: "Trần Thị B", frequency: "3 bài/tuần", status: "Đang vận hành" },
    { id: "s3", name: "YouTube Thổ Tú", platform: "YouTube", brandId: "b3", owner: "Lê Văn C", status: "Đang xây" },
    { id: "s4", name: "Facebook Page Sứ Việt", platform: "Facebook Page", brandId: "b1", owner: "Mai", status: "Đang vận hành" },
  ];
  const places: LocalPlace[] = [
    { id: "p1", name: "Xưởng Gốm Sứ Việt Bát Tràng", brandId: "b1", address: "Bát Tràng, Gia Lâm, Hà Nội", phone: "0987xxxx", verifyStatus: "Đã xác minh", owner: "Hùng" },
    { id: "p2", name: "Showroom Không Gian Gốm Hà Nội", brandId: "b5", address: "Cầu Giấy, Hà Nội", verifyStatus: "Đã xác minh", owner: "Hoàng E" },
  ];
  const today = new Date();
  const d = (n: number) => new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);
  const tasks: Task[] = [
    { id: "t1", title: "Sửa banner trang chủ", brandId: "b1", assignee: "Hùng", reporter: "Nguyễn Văn A", deadline: d(-2), priority: "Cao", status: "Đang làm" },
    { id: "t2", title: "Kiểm tra link bài viết", brandId: "b2", assignee: "Mai", reporter: "Trần Thị B", deadline: d(1), priority: "Trung bình", status: "Chưa làm" },
    { id: "t3", title: "Cập nhật ảnh Google Map", brandId: "b1", assignee: "Hùng", deadline: d(3), priority: "Thấp", status: "Chưa làm" },
    { id: "t4", title: "Gửi brief cho designer", brandId: "b3", assignee: "Lê Văn C", deadline: d(0), priority: "Gấp", status: "Đang làm" },
    { id: "t5", title: "Duyệt bài SEO Tết", brandId: "b1", assignee: "Mai", deadline: d(-1), priority: "Cao", status: "Chưa làm", plan: "Tết 2026", topic: "Quà tặng doanh nghiệp" },
    { id: "t6", title: "Lên lịch đăng tuần", brandId: "b2", assignee: "Mai", deadline: d(2), priority: "Trung bình", status: "Hoàn thành", completedAt: d(-1) },
  ];
  const videos: Video[] = [
    { id: "v1", title: "Quy trình làm gốm Bát Tràng", brandId: "b1", channels: "TikTok, YouTube", purpose: "Tăng nhận diện", owner: "Hùng", deadline: d(5), status: "Đang sản xuất" },
    { id: "v2", title: "Gợi ý quà tặng doanh nghiệp", brandId: "b2", channels: "Facebook, Web", purpose: "Bán hàng", owner: "Mai", deadline: d(7), status: "Chờ duyệt", plan: "Tết 2026", topic: "Quà tặng doanh nghiệp" },
    { id: "v3", title: "Tượng Phật gốm trong không gian thờ", brandId: "b3", channels: "YouTube", purpose: "Branding", owner: "Lê Văn C", deadline: d(10), status: "Ý tưởng" },
  ];
  const orders: DesignOrder[] = [
    { id: "o1", title: "Banner trang chủ Sứ Việt", brandId: "b1", type: "Banner website", source: "Web", requester: "Nguyễn Văn A", assignee: "Designer 1", deadline: d(2), status: "Đang làm" },
    { id: "o2", title: "Ảnh social bộ ấm chén in logo", brandId: "b2", type: "Ảnh social", source: "Social", requester: "Mai", assignee: "Designer 2", deadline: d(4), status: "Chờ duyệt" },
    { id: "o3", title: "Thumbnail video quà tặng Tết", brandId: "b1", type: "Thumbnail video", source: "Video", requester: "Mai", deadline: d(1), status: "Mới tạo", plan: "Tết 2026" },
  ];
  const webContents: WebContent[] = [
    { id: "wc1", websiteId: "w1", brandId: "b1", type: "Bài SEO", title: "Quà tặng doanh nghiệp bằng gốm sứ Bát Tràng", mainKeyword: "quà tặng doanh nghiệp gốm sứ", writer: "Mai", reviewer: "Nguyễn Văn A", deadline: d(3), status: "Đang viết", indexStatus: "Chưa kiểm tra", plan: "Tết 2026", topic: "Quà tặng doanh nghiệp" },
    { id: "wc2", websiteId: "w1", brandId: "b1", type: "Bài blog", title: "Cách bảo quản đồ gốm sứ", mainKeyword: "bảo quản gốm sứ", writer: "Mai", deadline: d(-1), status: "Chờ duyệt", indexStatus: "Chưa kiểm tra" },
    { id: "wc3", websiteId: "w3", brandId: "b2", type: "Landing page", title: "Bộ ấm chén quà tặng cao cấp", writer: "An", reviewer: "Trần Thị B", deadline: d(7), status: "Kế hoạch", indexStatus: "Chưa kiểm tra" },
  ];
  const socialPosts: SocialPost[] = [
    { id: "sp1", title: "Bộ ấm chén Tết 2026", brandId: "b1", channelId: "s1", platform: "TikTok", contentType: "TikTok Video", writer: "Mai", scheduledDate: d(2), status: "Đang làm", plan: "Tết 2026", topic: "Quà tặng doanh nghiệp" },
    { id: "sp2", title: "Khám phá xưởng gốm Bát Tràng", brandId: "b1", channelId: "s4", platform: "Facebook Page", contentType: "Album", writer: "Mai", scheduledDate: d(1), status: "Đã lên lịch" },
    { id: "sp3", title: "Quà tặng doanh nghiệp - Sứ Minh Đăng", brandId: "b2", channelId: "s2", platform: "Facebook Page", contentType: "Carousel", writer: "An", scheduledDate: d(3), status: "Chờ duyệt" },
  ];
  const mapPosts: MapPost[] = [
    { id: "mp1", title: "Ưu đãi tháng 12 tại xưởng", placeId: "p1", brandId: "b1", type: "Ưu đãi", owner: "Hùng", scheduledDate: d(2), status: "Đã lên lịch" },
  ];
  const reviews: MapReview[] = [
    { id: "r1", placeId: "p1", reviewer: "Nguyễn Khách", stars: 5, content: "Sản phẩm đẹp, chất lượng cao", date: d(-3), responseStatus: "Đã phản hồi", responder: "Hùng" },
    { id: "r2", placeId: "p2", reviewer: "Trần Khách", stars: 4, content: "Showroom đẹp, nhân viên thân thiện", date: d(-1), responseStatus: "Chưa phản hồi" },
  ];
  const people: Person[] = [
    { id: "u1", name: "Nguyễn Văn A", role: "Trưởng phòng Marketing", email: "a@suviet.vn", status: "Đang làm" },
    { id: "u2", name: "Trần Thị B", role: "Brand Manager", email: "b@minhdang.vn", status: "Đang làm" },
    { id: "u3", name: "Mai", role: "Content Lead", email: "mai@company.vn", status: "Đang làm" },
    { id: "u4", name: "Hùng", role: "SEO/Tech", email: "hung@company.vn", status: "Đang làm" },
    { id: "u5", name: "Lê Văn C", role: "Video Editor", status: "Đang làm" },
    { id: "u6", name: "Designer 1", role: "Graphic Designer", status: "Đang làm" },
    { id: "u7", name: "Designer 2", role: "Graphic Designer", status: "Đang làm" },
    { id: "u8", name: "An", role: "Content Writer", status: "Đang làm" },
  ];
  const seoGroups = [
    "Cài đặt nền tảng", "Index / Crawl", "Tốc độ website", "Cấu trúc website",
    "Onpage kỹ thuật", "Schema", "WooCommerce SEO", "Tracking / Bảo mật",
  ];
  const seoChecks: SeoCheckItem[] = [];
  const checkItems: Record<string, string[]> = {
    "Cài đặt nền tảng": ["Cài SSL", "Cài Yoast/RankMath", "Cấu hình permalink"],
    "Index / Crawl": ["Submit sitemap GSC", "Robots.txt hợp lệ", "Kiểm tra noindex sai"],
    "Tốc độ website": ["Tối ưu ảnh", "Cache plugin", "Core Web Vitals đạt"],
    "Cấu trúc website": ["Breadcrumb", "Internal link", "Cấu trúc danh mục"],
    "Onpage kỹ thuật": ["Title tag", "Meta description", "Heading H1-H3"],
    "Schema": ["Organization", "Article", "Product"],
    "WooCommerce SEO": ["Product schema", "Tối ưu trang sản phẩm"],
    "Tracking / Bảo mật": ["GA4", "GSC", "Backup định kỳ"],
  };
  websites.forEach((w) => {
    seoGroups.forEach((g) => {
      checkItems[g]?.forEach((name) => {
        seoChecks.push({ id: uid(), websiteId: w.id, group: g, name, done: Math.random() > 0.6 });
      });
    });
  });

  return {
    brands, websites, socials, places, tasks, webContents, socialPosts, mapPosts,
    reviews, videos, orders, people, seoChecks,
    plans: ["Tết 2026", "Khai trương showroom", "Sale tháng 12", "Brand 2026"],
    topics: ["Quà tặng doanh nghiệp", "Sản phẩm mới", "Văn hóa Bát Tràng", "Phong thủy", "Khuyến mãi"],
  };
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...seed(),
      add: (key, item) => set((s) => ({ [key]: [...(s[key] as any[]), item] } as any)),
      update: (key, id, patch) =>
        set((s) => ({
          [key]: (s[key] as any[]).map((i) => (i.id === id ? { ...i, ...patch } : i)),
        } as any)),
      remove: (key, id) =>
        set((s) => ({ [key]: (s[key] as any[]).filter((i) => i.id !== id) } as any)),
    }),
    { name: "base-mkt-store", version: 1 }
  )
);

export const fmtDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const isOverdue = (deadline?: string, status?: string) => {
  if (!deadline || status === "Hoàn thành") return false;
  return new Date(deadline) < new Date(new Date().toDateString());
};
