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

export type WebsiteType =
  | "Website thương hiệu"
  | "Website bán hàng"
  | "Website blog/SEO"
  | "Landing page"
  | "Website vệ tinh"
  | "Khác";

export type WebsiteStatus = "Đang xây dựng" | "Đang vận hành" | "Đang tối ưu" | "Tạm dừng" | "Lưu trữ";

export interface Website {
  id: ID;
  name: string;
  url: string;
  brandId: ID;
  type: WebsiteType;
  seoOwner?: string;
  contentOwner?: string;
  techOwner?: string;
  status: WebsiteStatus;
  goal?: string;
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
  | "Đang làm outline"
  | "Chờ duyệt outline"
  | "Cần sửa outline"
  | "Outline đã duyệt"
  | "Đang viết bài"
  | "Chờ duyệt bài"
  | "Cần sửa bài"
  | "Bài đã duyệt"
  | "Chờ đăng web"
  | "Đã đăng web"
  | "Kiểm tra index"
  | "Hoàn thành";

export const CONTENT_STATUSES: ContentStatus[] = [
  "Kế hoạch", "Đã giao", "Đang làm outline", "Chờ duyệt outline", "Cần sửa outline",
  "Outline đã duyệt", "Đang viết bài", "Chờ duyệt bài", "Cần sửa bài", "Bài đã duyệt",
  "Chờ đăng web", "Đã đăng web", "Kiểm tra index", "Hoàn thành",
];

export type ContentType =
  | "Bài SEO" | "Bài blog" | "Landing page" | "Bài danh mục"
  | "Bài sản phẩm" | "Bài tối ưu lại" | "Bài tin tức" | "Khác";

export const CONTENT_TYPES: ContentType[] = [
  "Bài SEO", "Bài blog", "Landing page", "Bài danh mục",
  "Bài sản phẩm", "Bài tối ưu lại", "Bài tin tức", "Khác",
];

export type SearchIntent = "Thông tin" | "So sánh" | "Thương mại" | "Mua hàng" | "Điều hướng" | "Khác";
export const SEARCH_INTENTS: SearchIntent[] = ["Thông tin", "So sánh", "Thương mại", "Mua hàng", "Điều hướng", "Khác"];

export type IndexStatus = "Chưa kiểm tra" | "Chưa index" | "Đã index" | "Cần xử lý";
export const INDEX_STATUSES: IndexStatus[] = ["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"];

export type ShareSocialStatus = "Chưa share" | "Đã share" | "Cần share lại";
export const SHARE_SOCIAL_STATUSES: ShareSocialStatus[] = ["Chưa share", "Đã share", "Cần share lại"];

export type EntityPlatform =
  | "Facebook" | "Pinterest" | "LinkedIn" | "Twitter/X" | "YouTube" | "TikTok"
  | "Zalo" | "Medium" | "Blogspot" | "WordPress" | "Google Site" | "Reddit" | "Khác";
export const ENTITY_PLATFORMS: EntityPlatform[] = [
  "Facebook", "Pinterest", "LinkedIn", "Twitter/X", "YouTube", "TikTok",
  "Zalo", "Medium", "Blogspot", "WordPress", "Google Site", "Reddit", "Khác",
];

export type EntityStatus = "Đang dùng" | "Chưa dùng" | "Cần kiểm tra" | "Lỗi đăng nhập" | "Tạm dừng";
export const ENTITY_STATUSES: EntityStatus[] = ["Đang dùng", "Chưa dùng", "Cần kiểm tra", "Lỗi đăng nhập", "Tạm dừng"];

export interface EntitySocial {
  id: ID;
  websiteId: ID;
  name: string;
  platform: EntityPlatform;
  url?: string;
  account?: string;
  password?: string;
  email?: string;
  phone?: string;
  status: EntityStatus;
  notes?: string;
}

export type KeywordType =
  | "Từ khóa chính" | "Từ khóa phụ" | "Từ khóa sản phẩm" | "Từ khóa danh mục"
  | "Từ khóa local" | "Từ khóa thương hiệu" | "Khác";
export const KEYWORD_TYPES: KeywordType[] = [
  "Từ khóa chính", "Từ khóa phụ", "Từ khóa sản phẩm", "Từ khóa danh mục",
  "Từ khóa local", "Từ khóa thương hiệu", "Khác",
];

export type KeywordRankStatus =
  | "Chưa check" | "Top 3" | "Top 10" | "Top 20" | "Top 50"
  | "Ngoài top 50" | "Tăng hạng" | "Tụt hạng" | "Mất top";
export const KEYWORD_RANK_STATUSES: KeywordRankStatus[] = [
  "Chưa check", "Top 3", "Top 10", "Top 20", "Top 50",
  "Ngoài top 50", "Tăng hạng", "Tụt hạng", "Mất top",
];

export interface KeywordTrack {
  id: ID;
  websiteId: ID;
  keyword: string;
  topic?: string;
  targetUrl?: string;
  type: KeywordType;
  searchIntent?: SearchIntent;
  owner?: string;
  lastCheckDate?: string;
  currentTop?: number;
  previousTop?: number;
  status: KeywordRankStatus;
  notes?: string;
  plan?: string;
}

export type BacklinkType =
  | "Bài PR báo chí" | "Guest post" | "Backlink website ngành"
  | "Backlink forum" | "Backlink social" | "Khác";
export const BACKLINK_TYPES: BacklinkType[] = [
  "Bài PR báo chí", "Guest post", "Backlink website ngành",
  "Backlink forum", "Backlink social", "Khác",
];

export type BacklinkStatus =
  | "Dự kiến" | "Đã đặt" | "Đã đăng" | "Đã kiểm tra link" | "Lỗi / mất link";
export const BACKLINK_STATUSES: BacklinkStatus[] = [
  "Dự kiến", "Đã đặt", "Đã đăng", "Đã kiểm tra link", "Lỗi / mất link",
];

export interface Backlink {
  id: ID;
  websiteId: ID;
  name: string;
  sourceSite?: string;
  publishedLink?: string;
  targetUrl?: string;
  anchorText?: string;
  keyword?: string;
  type: BacklinkType;
  cost?: number;
  publishDate?: string;
  owner?: string;
  status: BacklinkStatus;
  notes?: string;
}

export type OptimizeReason =
  | "Bài tụt hạng" | "Bài cũ thiếu thông tin" | "Bài chưa có CTA"
  | "Bài thiếu internal link" | "Bài chưa index"
  | "Bài cần cập nhật sản phẩm/dịch vụ" | "Bài cần tối ưu chuyển đổi";

export const OPTIMIZE_REASONS: OptimizeReason[] = [
  "Bài tụt hạng", "Bài cũ thiếu thông tin", "Bài chưa có CTA",
  "Bài thiếu internal link", "Bài chưa index",
  "Bài cần cập nhật sản phẩm/dịch vụ", "Bài cần tối ưu chuyển đổi",
];

export interface WebContent {
  id: ID;
  websiteId: ID;
  brandId: ID;
  type: ContentType;
  cluster?: string;
  mainKeyword?: string;
  subKeywords?: string;
  searchIntent?: SearchIntent;
  title: string;
  url?: string;
  brief?: string;
  // Phân công
  assigner?: string;
  writer?: string;
  outlineReviewer?: string;
  draftReviewer?: string;
  publisher?: string;
  // Deadlines
  outlineDeadline?: string;
  deadline?: string;
  publishDate?: string;
  publishedAt?: string;
  completedAt?: string;
  // Tài liệu
  outlineLink?: string;
  draftLink?: string;
  imageLink?: string;
  designOrderId?: ID;
  publishedLink?: string;
  // Xét duyệt
  status: ContentStatus;
  outlineReviewNotes?: string;
  draftReviewNotes?: string;
  outlineRevisions?: number;
  draftRevisions?: number;
  // SEO sau đăng
  indexStatus: IndexStatus;
  indexNotes?: string;
  // Share social SEO
  shareSocial?: boolean;
  shareSocialStatus?: ShareSocialStatus;
  shareSocialDate?: string;
  sharedEntities?: string;
  shareNotes?: string;
  // Liên kết
  plan?: string;
  topic?: string;
  notes?: string;
  // Thiết kế
  needsDesign?: boolean;
  // Tối ưu lại
  optimizeReason?: OptimizeReason;
  optimizeGoal?: string;
  oldLink?: string;
  optimizeNotes?: string;
}

export type SocialStatus =
  | "Ý tưởng" | "Đang làm" | "Chờ duyệt" | "Cần sửa"
  | "Đã duyệt" | "Đã lên lịch" | "Đã đăng" | "Hoàn thành";

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
  contentId?: ID;
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
  checkedAt?: string;
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
  entities: EntitySocial[];
  keywords: KeywordTrack[];
  backlinks: Backlink[];
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
  entities: EntitySocial;
  keywords: KeywordTrack;
  backlinks: Backlink;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

// SEO checklist template (groups + items)
export const SEO_CHECK_TEMPLATE: Record<string, string[]> = {
  "Cài đặt nền tảng": [
    "Website đã có SSL/HTTPS",
    "Đã kết nối Google Search Console",
    "Đã kết nối Google Analytics",
    "Đã cài plugin SEO",
    "Đã tạo sitemap.xml",
  ],
  "Index / Crawl": [
    "Đã gửi sitemap lên Search Console",
    "Website không bị chặn index",
    "Robots.txt không chặn nhầm",
    "Trang chủ đã index",
    "Danh mục chính đã index",
  ],
  "Tốc độ website": [
    "Đã bật cache",
    "Đã nén ảnh",
    "Đã bật lazy load",
    "Đã kiểm tra tốc độ mobile",
    "Đã kiểm tra tốc độ desktop",
  ],
  "Cấu trúc website": [
    "Menu chính rõ ràng",
    "Danh mục sản phẩm rõ ràng",
    "URL thân thiện",
    "Có breadcrumb",
    "Không có link menu bị lỗi",
  ],
  "Onpage kỹ thuật": [
    "Trang chủ có title SEO",
    "Trang chủ có meta description",
    "Danh mục chính có title SEO",
    "Danh mục chính có meta description",
    "Ảnh có ALT",
    "Có internal link cơ bản",
  ],
  "Schema": [
    "Có schema Organization / Local Business",
    "Có schema Breadcrumb",
    "Có schema Article",
    "Có schema Product",
    "Schema không báo lỗi nghiêm trọng",
  ],
  "WooCommerce SEO": [
    "Sản phẩm có title rõ ràng",
    "Sản phẩm có mô tả ngắn",
    "Sản phẩm có mô tả chi tiết",
    "Sản phẩm có ảnh đại diện",
    "Danh mục sản phẩm có mô tả",
    "Không có quá nhiều sản phẩm trùng nội dung",
  ],
  "Tracking / Bảo mật": [
    "Đã gắn Google Analytics",
    "Đã gắn Google Search Console",
    "Form liên hệ hoạt động",
    "Nút gọi điện hoạt động",
    "Nút Zalo hoạt động",
    "Website không báo lỗi bảo mật",
    "Plugin quan trọng được cập nhật",
  ],
};

export const SEO_GROUPS = Object.keys(SEO_CHECK_TEMPLATE);

const seed = () => {
  const brands: Brand[] = [
    { id: "b1", name: "Sứ Việt", field: "Gốm sứ Bát Tràng", website: "xuonggomsuviet.vn", description: "Xưởng gốm Bát Tràng truyền thống", usp: "Sản xuất tại xưởng, gốm thủ công cao cấp", owner: "Nguyễn Văn A", status: "Đang vận hành" },
    { id: "b2", name: "Sứ Minh Đăng", field: "Gốm sứ cao cấp", website: "suminhdang.com", description: "Gốm sứ Minh Đăng - quà tặng doanh nghiệp", owner: "Trần Thị B", status: "Đang tối ưu" },
    { id: "b3", name: "Thổ Tú", field: "Tượng gốm phong thủy", website: "thotu.vn", description: "Tượng gốm phong thủy Thổ Tú", owner: "Lê Văn C", status: "Đang vận hành" },
    { id: "b4", name: "Đồ Thờ Tín Tâm", field: "Đồ thờ gốm sứ", description: "Bộ đồ thờ Tín Tâm", owner: "Phạm D", status: "Đang xây dựng" },
    { id: "b5", name: "Không Gian Gốm Hà Nội", field: "Showroom gốm sứ", description: "Showroom trưng bày Hà Nội", owner: "Hoàng E", status: "Đang vận hành" },
  ];
  const websites: Website[] = [
    { id: "w1", name: "xuonggomsuviet.vn", url: "https://xuonggomsuviet.vn", brandId: "b1", type: "Website bán hàng", seoOwner: "Nguyễn Văn SEO", contentOwner: "Trần Thu Content", techOwner: "Lê Minh Tech", status: "Đang vận hành", goal: "Bán hàng online + SEO từ khóa quà tặng" },
    { id: "w2", name: "tinhhoabattrang.vn", url: "https://tinhhoabattrang.vn", brandId: "b1", type: "Website blog/SEO", seoOwner: "Nguyễn Văn SEO", contentOwner: "Trần Thu Content", status: "Đang xây dựng", goal: "Vệ tinh SEO, blog chuyên sâu Bát Tràng" },
    { id: "w3", name: "suminhdang.com", url: "https://suminhdang.com", brandId: "b2", type: "Website bán hàng", seoOwner: "Nguyễn Văn SEO", contentOwner: "Hoàng Mai Content", techOwner: "Lê Minh Tech", status: "Đang tối ưu", goal: "Tăng đơn quà tặng doanh nghiệp" },
    { id: "w4", name: "thotu.vn", url: "https://thotu.vn", brandId: "b3", type: "Website thương hiệu", seoOwner: "Phạm Anh SEO", contentOwner: "Trần Thu Content", techOwner: "Lê Minh Tech", status: "Đang xây dựng", goal: "Thương hiệu tượng phong thủy" },
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
    {
      id: "wc1", websiteId: "w1", brandId: "b1", type: "Bài SEO",
      title: "Tượng Phật gốm Bát Tràng", mainKeyword: "tượng Phật gốm",
      subKeywords: "tượng Phật men rạn, tượng Phật bằng gốm",
      searchIntent: "Thương mại",
      writer: "Trần Thu Content", outlineReviewer: "Nguyễn Văn SEO", draftReviewer: "Nguyễn Văn SEO",
      assigner: "Nguyễn Văn A",
      outlineDeadline: d(-3), deadline: d(0), publishDate: d(2),
      outlineLink: "https://docs.google.com/outline-tuong-phat",
      draftLink: "https://docs.google.com/draft-tuong-phat",
      status: "Chờ duyệt bài", indexStatus: "Chưa kiểm tra",
      outlineRevisions: 1, draftRevisions: 0,
      cluster: "Tượng phong thủy",
    },
    {
      id: "wc2", websiteId: "w3", brandId: "b2", type: "Bài SEO",
      title: "Ấm chén in logo làm quà tặng doanh nghiệp", mainKeyword: "ấm chén in logo",
      searchIntent: "Mua hàng",
      writer: "Hoàng Mai Content", outlineReviewer: "Nguyễn Văn SEO", draftReviewer: "Trần Thị B",
      outlineDeadline: d(-2), deadline: d(3), publishDate: d(5),
      outlineLink: "https://docs.google.com/outline-am-chen",
      draftLink: "https://docs.google.com/draft-am-chen",
      status: "Đang viết bài", indexStatus: "Chưa kiểm tra",
      cluster: "Quà tặng doanh nghiệp",
    },
    {
      id: "wc3", websiteId: "w4", brandId: "b3", type: "Landing page",
      title: "Bát đĩa nhà hàng Bát Tràng", mainKeyword: "bát đĩa nhà hàng",
      searchIntent: "Mua hàng",
      writer: "Trần Thu Content", outlineReviewer: "Phạm Anh SEO",
      outlineDeadline: d(0), deadline: d(7), publishDate: d(10),
      outlineLink: "https://docs.google.com/outline-bat-dia",
      status: "Đang làm outline", indexStatus: "Chưa kiểm tra",
    },
    {
      id: "wc4", websiteId: "w3", brandId: "b2", type: "Bài SEO",
      title: "Quà tặng Tết doanh nghiệp bằng gốm sứ", mainKeyword: "quà tặng tết doanh nghiệp",
      searchIntent: "Mua hàng",
      plan: "Tết 2026", topic: "Quà tặng doanh nghiệp",
      writer: "Hoàng Mai Content", outlineReviewer: "Nguyễn Văn SEO",
      deadline: d(14), publishDate: d(20),
      status: "Kế hoạch", indexStatus: "Chưa kiểm tra",
    },
    {
      id: "wc5", websiteId: "w1", brandId: "b1", type: "Bài tối ưu lại",
      title: "Bình hút lộc Bát Tràng", mainKeyword: "bình hút lộc Bát Tràng",
      searchIntent: "Thương mại",
      writer: "Trần Thu Content", outlineReviewer: "Nguyễn Văn SEO",
      deadline: d(5), publishDate: d(8),
      status: "Đã giao", indexStatus: "Chưa kiểm tra",
      optimizeReason: "Bài chưa có CTA",
      optimizeGoal: "Tăng tỷ lệ chuyển đổi, bổ sung internal link sản phẩm",
      oldLink: "https://xuonggomsuviet.vn/binh-hut-loc",
      optimizeNotes: "Bài cũ thiếu CTA và internal link tới trang sản phẩm.",
    },
    {
      id: "wc6", websiteId: "w1", brandId: "b1", type: "Bài blog",
      title: "Cách bảo quản đồ gốm sứ", mainKeyword: "bảo quản gốm sứ",
      searchIntent: "Thông tin",
      writer: "Trần Thu Content", draftReviewer: "Nguyễn Văn SEO",
      deadline: d(-7), publishDate: d(-5), publishedAt: d(-4),
      publishedLink: "https://xuonggomsuviet.vn/bao-quan-gom-su",
      status: "Hoàn thành", indexStatus: "Đã index",
      completedAt: d(-3), publisher: "Lê Minh Tech",
      shareSocial: true, shareSocialStatus: "Đã share", shareSocialDate: d(-2),
      sharedEntities: "Facebook Entity Sứ Việt, Pinterest Sứ Việt",
    },
    {
      id: "wc7", websiteId: "w1", brandId: "b1", type: "Bài SEO",
      title: "Tượng Phật gốm Bát Tràng – men rạn cao cấp", mainKeyword: "tượng Phật gốm",
      searchIntent: "Thương mại", writer: "Trần Thu Content", publisher: "Lê Minh Tech",
      deadline: d(-12), publishDate: d(-10), publishedAt: d(-9),
      publishedLink: "https://xuonggomsuviet.vn/tuong-phat-gom-men-ran",
      status: "Hoàn thành", indexStatus: "Đã index", completedAt: d(-8),
      shareSocialStatus: "Chưa share",
    },
    {
      id: "wc8", websiteId: "w1", brandId: "b1", type: "Bài danh mục",
      title: "Bộ ấm chén in logo làm quà tặng doanh nghiệp", mainKeyword: "ấm chén in logo",
      searchIntent: "Mua hàng", writer: "Hoàng Mai Content", publisher: "Lê Minh Tech",
      deadline: d(-6), publishDate: d(-4), publishedAt: d(-4),
      publishedLink: "https://xuonggomsuviet.vn/am-chen-in-logo",
      status: "Đã đăng web", indexStatus: "Chưa index",
      shareSocial: true, shareSocialStatus: "Cần share lại", shareSocialDate: d(-3),
      sharedEntities: "Facebook Entity Sứ Việt",
    },
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
    { id: "u9", name: "Nguyễn Văn SEO", role: "SEO Specialist", status: "Đang làm" },
    { id: "u10", name: "Trần Thu Content", role: "Content Writer Web", status: "Đang làm" },
    { id: "u11", name: "Hoàng Mai Content", role: "Content Writer Web", status: "Đang làm" },
    { id: "u12", name: "Lê Minh Tech", role: "Web Developer", status: "Đang làm" },
    { id: "u13", name: "Phạm Anh SEO", role: "SEO Specialist", status: "Đang làm" },
  ];
  const seoChecks: SeoCheckItem[] = [];
  websites.forEach((w) => {
    SEO_GROUPS.forEach((g) => {
      SEO_CHECK_TEMPLATE[g].forEach((name) => {
        seoChecks.push({ id: uid(), websiteId: w.id, group: g, name, done: Math.random() > 0.55 });
      });
    });
  });

  const entities: EntitySocial[] = [
    { id: "e1", websiteId: "w1", name: "Facebook Entity Sứ Việt", platform: "Facebook", url: "https://facebook.com/suviet", account: "suviet.content", password: "Suviet@2025", email: "suviet.ai@gmail.com", phone: "0987123456", status: "Đang dùng", notes: "Tài khoản chính dùng share bài SEO" },
    { id: "e2", websiteId: "w1", name: "Pinterest Sứ Việt", platform: "Pinterest", url: "https://pinterest.com/suviet", account: "suviet.pin", password: "Pin@Suviet1", email: "suviet.ai@gmail.com", status: "Đang dùng" },
    { id: "e3", websiteId: "w1", name: "Google Site Sứ Việt", platform: "Google Site", url: "https://sites.google.com/view/suviet", account: "suviet.gsite", password: "Gsite@2025", email: "suviet.ai@gmail.com", status: "Cần kiểm tra", notes: "Cần check lại quyền truy cập" },
    { id: "e4", websiteId: "w1", name: "Medium Sứ Việt", platform: "Medium", url: "https://medium.com/@suviet", account: "@suviet", password: "Med@Suviet", email: "suviet.ai@gmail.com", status: "Chưa dùng" },
    { id: "e5", websiteId: "w1", name: "LinkedIn Brand Sứ Việt", platform: "LinkedIn", url: "https://linkedin.com/company/suviet", account: "admin.suviet", password: "Lk@Suviet1", email: "suviet.ai@gmail.com", status: "Đang dùng" },
    { id: "e6", websiteId: "w3", name: "Facebook Sứ Minh Đăng", platform: "Facebook", url: "https://facebook.com/suminhdang", account: "smd.admin", password: "Smd@2025", email: "smd@minhdang.vn", status: "Đang dùng" },
  ];

  const keywords: KeywordTrack[] = [
    { id: "k1", websiteId: "w1", keyword: "tượng Phật gốm", topic: "Tượng phong thủy", targetUrl: "https://xuonggomsuviet.vn/tuong-phat-gom-men-ran", type: "Từ khóa chính", searchIntent: "Thương mại", owner: "Nguyễn Văn SEO", lastCheckDate: d(-1), currentTop: 12, previousTop: 18, status: "Tăng hạng" },
    { id: "k2", websiteId: "w1", keyword: "ấm chén in logo", topic: "Quà tặng doanh nghiệp", targetUrl: "https://xuonggomsuviet.vn/am-chen-in-logo", type: "Từ khóa sản phẩm", searchIntent: "Mua hàng", owner: "Nguyễn Văn SEO", lastCheckDate: d(-1), currentTop: 6, previousTop: 9, status: "Top 10" },
    { id: "k3", websiteId: "w1", keyword: "bát đĩa nhà hàng", topic: "Sản phẩm nhà hàng", targetUrl: "https://xuonggomsuviet.vn/bat-dia-nha-hang", type: "Từ khóa danh mục", searchIntent: "Mua hàng", owner: "Phạm Anh SEO", lastCheckDate: d(-2), currentTop: 15, previousTop: 11, status: "Tụt hạng" },
    { id: "k4", websiteId: "w1", keyword: "gốm sứ Bát Tràng", topic: "Thương hiệu", type: "Từ khóa thương hiệu", searchIntent: "Điều hướng", owner: "Nguyễn Văn SEO", lastCheckDate: d(-3), currentTop: 3, previousTop: 4, status: "Top 3" },
    { id: "k5", websiteId: "w1", keyword: "bình hút lộc Bát Tràng", topic: "Phong thủy", type: "Từ khóa phụ", searchIntent: "Thương mại", owner: "Nguyễn Văn SEO", currentTop: undefined, previousTop: undefined, status: "Chưa check" },
    { id: "k6", websiteId: "w1", keyword: "quà tặng tết doanh nghiệp", topic: "Quà tặng doanh nghiệp", type: "Từ khóa chính", plan: "Tết 2026", searchIntent: "Mua hàng", owner: "Hoàng Mai Content", lastCheckDate: d(-5), currentTop: 0, previousTop: 35, status: "Mất top" },
  ];

  return {
    brands, websites, socials, places, tasks, webContents, socialPosts, mapPosts,
    reviews, videos, orders, people, seoChecks, entities, keywords,
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
    { name: "base-mkt-store", version: 4 }
  )
);

export const fmtDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const isOverdue = (deadline?: string, status?: string) => {
  if (!deadline || status === "Hoàn thành") return false;
  return new Date(deadline) < new Date(new Date().toDateString());
};

export const ensureSeoChecks = (
  existing: SeoCheckItem[],
  websiteId: ID,
): SeoCheckItem[] => {
  const have = new Set(existing.filter((c) => c.websiteId === websiteId).map((c) => `${c.group}::${c.name}`));
  const missing: SeoCheckItem[] = [];
  SEO_GROUPS.forEach((g) => {
    SEO_CHECK_TEMPLATE[g].forEach((name) => {
      if (!have.has(`${g}::${name}`)) {
        missing.push({ id: uid(), websiteId, group: g, name, done: false });
      }
    });
  });
  return missing;
};
