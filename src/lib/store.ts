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
  contentId?: ID;
  isMain?: boolean;
  extra?: boolean;
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
  topic?: string;
  type: BacklinkType;
  cost?: number;
  publishDate?: string;
  owner?: string;
  status: BacklinkStatus;
  notes?: string;
}

export interface WebTopic {
  id: ID;
  websiteId: ID;
  name: string;            // Topic
  mainKeyword?: string;    // Từ khóa chủ đề
  sheetLink?: string;      // Link Sheet
  updatedAt?: string;      // Ngày cập nhật
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

export type GrowthPeriodType = "Tuần" | "Tháng" | "Quý";
export const GROWTH_PERIOD_TYPES: GrowthPeriodType[] = ["Tuần", "Tháng", "Quý"];

export interface GrowthMetric {
  id: ID;
  websiteId: ID;
  period: string;            // ví dụ "Tuần 2 tháng 5/2026" hoặc "Tháng 5/2026"
  periodType: GrowthPeriodType;
  periodKey?: string;        // YYYY-WW / YYYY-MM / YYYY-Qn — dùng để sắp xếp
  updatedAt?: string;        // ngày cập nhật
  totalTraffic?: number;
  organicTraffic?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;              // %
  avgPosition?: number;
  indexedPages?: number;
  leads?: number;
  reportLink?: string;
  updatedBy?: string;
  notes?: string;
}

export interface SeoCheckItem {
  id: ID;
  websiteId: ID;
  group: string;
  name: string;
  description?: string;
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
  growth: GrowthMetric[];
  webTopics: WebTopic[];
  plans: string[];
  topics: string[];

  add: <K extends keyof Collections>(key: K, item: Collections[K]) => void;
  update: <K extends keyof Collections>(key: K, id: ID, patch: Partial<Collections[K]>) => void;
  remove: <K extends keyof Collections>(key: K, id: ID) => void;
  resetAll: (mode: "empty" | "demo") => void;
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
  growth: GrowthMetric;
  webTopics: WebTopic;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

// SEO checklist template (groups + items with description)
export type SeoCheckTemplateItem = { name: string; description: string };
export const SEO_CHECK_TEMPLATE: Record<string, SeoCheckTemplateItem[]> = {
  "Domain": [
    { name: "www & non-www", description: "Kiểm tra website đang sử dụng phiên bản nào và phiên bản còn lại đã tự động redirect về phiên bản sử dụng hay chưa." },
    { name: "http & https", description: "Kiểm tra website đã cài chứng chỉ bảo mật SSL và chuyển hướng đúng sang https hay chưa." },
  ],
  "Cấu trúc web": [
    { name: "Có đầy đủ 6 loại trang đích", description: "Kiểm tra website đã có đầy đủ các loại trang đích quan trọng hay chưa." },
  ],
  "Trải nghiệm người dùng": [
    { name: "Giao diện trang chủ", description: "Cần kiểm tra giao diện và nội dung có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện danh mục cha", description: "Cần kiểm tra giao diện và nội dung danh mục cha có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện danh mục con", description: "Cần kiểm tra giao diện và nội dung danh mục con có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện trang sản phẩm", description: "Cần kiểm tra giao diện và nội dung trang sản phẩm có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện trang bài viết", description: "Cần kiểm tra giao diện và nội dung trang bài viết có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện thương hiệu", description: "Cần kiểm tra giao diện và nội dung trang thương hiệu có phù hợp với bộ từ khóa hay chưa." },
  ],
  "Kiểm tra tính thân thiện và cấu trúc URL": [
    { name: "Home: domain.com", description: "Kiểm tra URL trang chủ đã được tối ưu theo đúng mẫu hay chưa." },
    { name: "Danh mục sản phẩm lớn: domain.com/danh-muc-lon/", description: "Kiểm tra URL danh mục lớn đã được tối ưu theo cấu trúc phân tầng hay chưa." },
    { name: "Danh mục sản phẩm nhỏ: domain.com/danh-muc-lon/danh-muc-nho/", description: "Kiểm tra URL danh mục nhỏ đã được tối ưu theo cấu trúc phân tầng hay chưa." },
    { name: "Trang sản phẩm", description: "Kiểm tra URL trang sản phẩm đã thân thiện, ngắn gọn và dễ đọc hay chưa." },
    { name: "Danh mục tin tức", description: "Kiểm tra URL danh mục tin tức đã được tối ưu hay chưa." },
    { name: "Danh mục nhỏ tin tức", description: "Kiểm tra URL danh mục nhỏ tin tức đã được tối ưu hay chưa." },
    { name: "Bài viết: domain.com/danh-muc-lon/danh-muc-nho/bai-viet.html", description: "Kiểm tra URL bài viết đã được tối ưu theo đúng mẫu hay chưa." },
    { name: "TAG: domain.com/tag", description: "Kiểm tra URL tag đã được tối ưu theo đúng mẫu hay chưa." },
    { name: "Page tĩnh: domain.com/page-tinh.html", description: "Kiểm tra URL page tĩnh đã được tối ưu theo đúng mẫu hay chưa." },
  ],
  "HEADING": [
    { name: "Heading trang chủ", description: "Kiểm tra tình trạng heading trang chủ." },
    { name: "Heading trang dịch vụ / sản phẩm", description: "Kiểm tra heading trang dịch vụ hoặc trang sản phẩm." },
    { name: "Heading trang danh mục con", description: "Kiểm tra heading danh mục con." },
    { name: "Heading trang danh mục bài viết", description: "Kiểm tra heading trang danh mục bài viết." },
    { name: "Heading TAG", description: "Kiểm tra heading trang tag." },
    { name: "Heading Page tĩnh", description: "Kiểm tra heading page tĩnh." },
  ],
  "Kiểm tra robots.txt": [
    { name: "Đã có file robots.txt chưa?", description: "Kiểm tra website đã có file robots.txt hay chưa." },
    { name: "Có link sitemap ở cuối chưa?", description: "Kiểm tra trong robots.txt đã có khai báo sitemap hay chưa." },
    { name: "File robots.txt chặn gì hay sai?", description: "Kiểm tra robots.txt có chặn nhầm trang quan trọng hay không." },
  ],
  "Kiểm tra Sitemap": [
    { name: "Sitemap Google", description: "Kiểm tra website có sitemap XML chưa." },
    { name: "Sitemap Google đã chuẩn chưa?", description: "Kiểm tra sitemap có đúng cấu trúc và gửi lên Google Search Console được hay chưa." },
    { name: "Sitemap người dùng", description: "Kiểm tra website có sitemap người dùng hay chưa." },
  ],
  "Tốc độ tải trang": [
    { name: "PageSpeed Insights", description: "Kiểm tra tốc độ tải trang bằng PageSpeed Insights, bao gồm desktop và mobile." },
  ],
  "Mobile friendly": [
    { name: "Kiểm tra giao diện thiết bị di động", description: "Kiểm tra website có thân thiện với thiết bị di động hay chưa." },
  ],
  "Đường dẫn ngược Breadcrumb": [
    { name: "Đường dẫn ngược đúng mẫu", description: "Kiểm tra website đã có đường dẫn ngược Breadcrumb cho danh mục, bài viết, sản phẩm hay chưa." },
    { name: "Có đường dẫn ngược", description: "Kiểm tra website có hiển thị breadcrumb hay không." },
    { name: "Gắn link đúng", description: "Kiểm tra breadcrumb có gắn đúng link phân cấp hay chưa." },
    { name: "Schema cho đường dẫn ngược", description: "Kiểm tra breadcrumb đã có khai báo schema hay chưa." },
  ],
  "Rich snippet": [
    { name: "Đánh giá sao trên trang sản phẩm", description: "Kiểm tra website đã có đánh giá sao cho bài viết hoặc sản phẩm hay chưa." },
  ],
  "Instant Article": [
    { name: "Table of Content trên trang bài viết", description: "Kiểm tra website đã có table of content trong trang bài viết hay chưa." },
  ],
  "Kiểm tra thẻ ALT": [
    { name: "Toàn website", description: "Kiểm tra thẻ ALT trên toàn bộ website đã đầy đủ hay chưa." },
  ],
  "Favicon": [
    { name: "Favicon", description: "Kiểm tra website đã có favicon chưa." },
  ],
  "Comment": [
    { name: "Comment mặc định / Comment mạng xã hội", description: "Kiểm tra website đã có phần comment cho người dùng hay chưa." },
  ],
  "Kiểm tra Schema": [
    { name: "Cấu trúc dữ liệu trên từng loại trang", description: "Kiểm tra dữ liệu có cấu trúc của website." },
    { name: "Trang chủ", description: "Kiểm tra schema trang chủ." },
    { name: "Trang sản phẩm", description: "Kiểm tra schema trang sản phẩm." },
    { name: "Trang bài viết", description: "Kiểm tra schema trang bài viết." },
  ],
  "Meta Robots": [
    { name: "Indexfollow", description: "Kiểm tra tổng số page index/follow của website." },
    { name: "noindexnofollow", description: "Kiểm tra tổng số page noindex/nofollow và tính hợp lý của các page này." },
  ],
  "Kiểm tra thẻ Canonical": [
    { name: "Trang gốc và phân trang", description: "Kiểm tra các trang phân trang và phiên bản website đã có thẻ canonical hay chưa." },
    { name: "Bộ lọc trong trang sản phẩm", description: "Kiểm tra canonical của các URL bộ lọc trong trang sản phẩm." },
    { name: "Các trang sản phẩm canonical về chính nó", description: "Kiểm tra canonical của các trang sản phẩm có trỏ về chính nó hay chưa." },
  ],
  "Thẻ ngôn ngữ Hreflang": [
    { name: "Hreflang", description: "Kiểm tra website đã có thẻ ngôn ngữ hreflang hay chưa." },
  ],
  "Thiết lập mã cài đặt Tag Manager": [
    { name: "Phân tích số liệu và theo dõi tình trạng website", description: "Kiểm tra website đã thiết lập mã cài đặt Tag Manager hay chưa." },
  ],
  "Kiểm tra quyền admin website": [
    { name: "Chỉnh sửa nội dung trên website", description: "Kiểm tra tài khoản được cấp có đủ quyền chỉnh sửa nội dung hay chưa." },
  ],
  "Kiểm tra giao diện trên nhiều trình duyệt": [
    { name: "Google Chrome, Mozilla Firefox, Internet Explorer, Safari, Cốc Cốc...", description: "Sử dụng website trên các trình duyệt khác nhau để xem có lỗi hiển thị hay không." },
  ],
  "Kiểm tra các nút Social": [
    { name: "Like, Share", description: "Kiểm tra website đã có các nút chia sẻ, nút like của mạng xã hội hay chưa." },
  ],
  "Liên kết với Fanpage": [
    { name: "Fanpage Facebook", description: "Kiểm tra website đã có phần liên kết đến Fanpage chưa." },
  ],
  "Live chat": [
    { name: "Live chat", description: "Kiểm tra website đã có phần live chat cho người dùng hay chưa." },
  ],
  "Điều hướng Sidebar": [
    { name: "Điều hướng sidebar", description: "Kiểm tra website đã có thanh điều hướng sidebar hợp lý hay chưa." },
  ],
  "Kiểm tra chức năng thanh tìm kiếm": [
    { name: "Thanh tìm kiếm trên tất cả các trang", description: "Kiểm tra chức năng tìm kiếm trên toàn trang có trả kết quả đúng theo truy vấn hay không." },
  ],
  "Kiểm tra và xử lý trang 404": [
    { name: "Đẹp mắt", description: "Kiểm tra giao diện trang 404 có dễ nhìn hay không." },
    { name: "Có nút homepage, thanh Search", description: "Kiểm tra trang 404 có nút quay lại trang chủ và thanh tìm kiếm hay không." },
    { name: "Có gợi ý nội dung hấp dẫn", description: "Kiểm tra trang 404 có gợi ý nội dung khác cho người dùng hay không." },
    { name: "Mã phản hồi là 404", description: "Kiểm tra trang lỗi có trả đúng mã HTTP 404 hay không." },
    { name: "URL giữ nguyên", description: "Kiểm tra URL lỗi có giữ nguyên để người dùng nhận biết hay không." },
    { name: "follow", description: "Kiểm tra cấu hình follow/noindex của trang 404 nếu cần." },
  ],
  "Internal Link": [
    { name: "follow", description: "Kiểm tra số lượng internal link trên website và tình trạng link. Kiểm tra tính hợp lý của internal link." },
  ],
  "External Link": [
    { name: "dofollow/nofollow", description: "Kiểm tra số lượng external link trên website và tình trạng link. Kiểm tra tính hợp lý của external link." },
  ],
  "GTmetrix": [
    { name: "Kiểm tra tốc độ tải trang", description: "Kiểm tra tốc độ tải trang bằng GTmetrix." },
  ],
  "Giúp Google tìm thấy các trang trên web": [
    { name: "Liên kết trong code HTML phải để Google đọc được", description: "Link liên kết tới trang đích nên có cấu trúc chuẩn dạng thẻ a href để Google có thể thu thập dữ liệu." },
  ],
  "CMS - Quyền quản trị": [
    { name: "Quản trị table content", description: "Kiểm tra CMS có quản trị được table content hay không." },
    { name: "Cho phép hiển thị content hoặc không", description: "Kiểm tra CMS có cho bật/tắt hiển thị nội dung hay không." },
    { name: "Table content cần phải có đường dẫn đúng chuẩn", description: "Kiểm tra đường dẫn trong table content có đúng chuẩn SEO hay không." },
  ],
  "CMS - Meta title, description, keywords, URL tất cả các trang": [
    { name: "Tất cả dữ liệu bài viết và tin trong bài viết", description: "Kiểm tra có quản trị được Alt, Title, URL ảnh trong bài viết hay không." },
    { name: "Ảnh sản phẩm và ảnh trong bài viết sản phẩm", description: "Kiểm tra có quản trị được Alt, Title, URL ảnh sản phẩm hay không." },
    { name: "Thêm mới, xóa, edit bài viết", description: "Kiểm tra CMS có cho thêm mới, xóa và sửa bài viết hay không." },
  ],
  "CMS - Tính năng trong một bài viết": [
    { name: "Liên kết với fanpage", description: "Kiểm tra bài viết có thể liên kết với fanpage hay không." },
    { name: "Có nút like, share bài đăng lên các mạng xã hội", description: "Kiểm tra bài viết có nút like/share lên mạng xã hội hay không." },
    { name: "Có chỗ để đăng tạo các thẻ Title, Meta Description, Meta Keywords, dẫn URL, các thẻ tiêu đề H1, H2, H3", description: "Kiểm tra CMS có đầy đủ trường nhập SEO cơ bản cho bài viết hay không." },
    { name: "Tự động lưu bài viết", description: "Kiểm tra CMS có chức năng tự động lưu bài viết hay không." },
    { name: "Tính năng xem thử trước khi đăng", description: "Kiểm tra CMS có chức năng xem trước bài viết trước khi đăng hay không." },
    { name: "Mã HTML trong khi đăng bài không bị lỗi", description: "Kiểm tra mã HTML trong khi đăng bài có bị lỗi hiển thị hay không." },
    { name: "Live chat trong bài viết", description: "Kiểm tra live chat có hiển thị trong bài viết nếu cần hay không." },
  ],
  "CMS - Có đầy đủ tính năng soạn thảo văn bản": [
    { name: "Có thể thêm video, hình ảnh", description: "Kiểm tra trình soạn thảo có thể thêm video, hình ảnh hay không." },
    { name: "Định dạng heading", description: "Kiểm tra trình soạn thảo có định dạng heading hay không." },
    { name: "Phông chữ, kích thước", description: "Kiểm tra trình soạn thảo có chỉnh được phông chữ và kích thước hay không." },
    { name: "Trình bôi đậm, in nghiêng, gạch chân", description: "Kiểm tra trình soạn thảo có các định dạng cơ bản hay không." },
    { name: "Tính năng trích dẫn", description: "Kiểm tra trình soạn thảo có tính năng trích dẫn hay không." },
    { name: "Định dạng UL/LI", description: "Kiểm tra trình soạn thảo có tạo danh sách bullet/number hay không." },
    { name: "Căn lề trái, phải, giữa, hai bên", description: "Kiểm tra trình soạn thảo có căn lề đầy đủ hay không." },
    { name: "Màu chữ, màu nền", description: "Kiểm tra trình soạn thảo có chỉnh màu chữ và màu nền hay không." },
    { name: "Thêm, xóa đường dẫn trong bài", description: "Kiểm tra trình soạn thảo có thêm và xóa link trong bài hay không." },
    { name: "Kẻ bảng, chỉnh sửa bảng", description: "Kiểm tra trình soạn thảo có tạo và chỉnh sửa bảng hay không." },
    { name: "Xóa định dạng", description: "Kiểm tra trình soạn thảo có chức năng xóa định dạng hay không." },
    { name: "Mở link trên tab mới", description: "Kiểm tra link trong bài có thể thiết lập mở ở tab mới hay không." },
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
      SEO_CHECK_TEMPLATE[g].forEach((it) => {
        seoChecks.push({ id: uid(), websiteId: w.id, group: g, name: it.name, description: it.description, done: false });
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
    // Linked to wc7 (indexed) — main keyword
    { id: "k1", websiteId: "w1", contentId: "wc7", isMain: true, keyword: "tượng Phật gốm", topic: "Tượng phong thủy", targetUrl: "https://xuonggomsuviet.vn/tuong-phat-gom-men-ran", type: "Từ khóa chính", searchIntent: "Thương mại", owner: "Nguyễn Văn SEO", lastCheckDate: d(-1), currentTop: 3, previousTop: 20, status: "Tăng hạng" },
    // Sub keywords for wc7
    { id: "k1a", websiteId: "w1", contentId: "wc7", keyword: "tượng Phật Bát Tràng", type: "Từ khóa phụ", owner: "Nguyễn Văn SEO", lastCheckDate: d(-1), currentTop: 8, previousTop: 15, status: "Tăng hạng" },
    { id: "k1b", websiteId: "w1", contentId: "wc7", keyword: "tượng Phật bằng gốm", type: "Từ khóa phụ", owner: "Nguyễn Văn SEO", lastCheckDate: d(-1), currentTop: 12, previousTop: 18, status: "Tăng hạng" },
    { id: "k1c", websiteId: "w1", contentId: "wc7", keyword: "tượng Phật gốm sứ", type: "Từ khóa phụ", owner: "Nguyễn Văn SEO", lastCheckDate: d(-1), currentTop: 25, previousTop: 22, status: "Tụt hạng" },

    // Linked to wc6 (indexed)
    { id: "k2", websiteId: "w1", contentId: "wc6", isMain: true, keyword: "bảo quản gốm sứ", topic: "Hướng dẫn", targetUrl: "https://xuonggomsuviet.vn/bao-quan-gom-su", type: "Từ khóa chính", owner: "Nguyễn Văn SEO", lastCheckDate: d(-2), currentTop: 5, previousTop: 9, status: "Top 10" },

    // Standalone (no content link) — extra
    { id: "k4", websiteId: "w1", extra: true, keyword: "gốm sứ Bát Tràng", topic: "Thương hiệu", type: "Từ khóa thương hiệu", searchIntent: "Điều hướng", owner: "Nguyễn Văn SEO", lastCheckDate: d(-3), currentTop: 3, previousTop: 4, status: "Top 3" },
    { id: "k6", websiteId: "w1", extra: true, keyword: "quà tặng tết doanh nghiệp", topic: "Quà tặng doanh nghiệp", type: "Từ khóa chính", plan: "Tết 2026", searchIntent: "Mua hàng", owner: "Hoàng Mai Content", lastCheckDate: d(-5), currentTop: 0, previousTop: 35, status: "Mất top" },
  ];

  const backlinks: Backlink[] = [
    { id: "bl1", websiteId: "w1", name: "PR báo Dân Trí — gốm Bát Tràng", sourceSite: "dantri.com.vn", publishedLink: "https://dantri.com.vn/pr/gom-bat-trang.html", targetUrl: "https://xuonggomsuviet.vn", anchorText: "xưởng gốm Bát Tràng", keyword: "gốm sứ Bát Tràng", type: "Bài PR báo chí", cost: 8000000, publishDate: d(-10), owner: "Nguyễn Văn SEO", status: "Đã kiểm tra link", notes: "Bài PR chính tháng 11" },
    { id: "bl2", websiteId: "w1", name: "Guest post Webgomsu", sourceSite: "webgomsu.vn", publishedLink: "https://webgomsu.vn/am-chen-in-logo", targetUrl: "https://xuonggomsuviet.vn/am-chen-in-logo", anchorText: "ấm chén in logo", keyword: "ấm chén in logo", type: "Guest post", cost: 1500000, publishDate: d(-6), owner: "Trần Thu Content", status: "Đã đăng" },
    { id: "bl3", websiteId: "w1", name: "Forum Webtretho — quà tặng Tết", sourceSite: "webtretho.com", targetUrl: "https://xuonggomsuviet.vn/am-chen-in-logo", anchorText: "quà tặng Tết doanh nghiệp", keyword: "quà tặng tết doanh nghiệp", type: "Backlink forum", cost: 0, owner: "Hoàng Mai Content", status: "Dự kiến" },
    { id: "bl4", websiteId: "w1", name: "Backlink site ngành nội thất", sourceSite: "noithatdep.vn", publishedLink: "https://noithatdep.vn/blog/binh-hut-loc", targetUrl: "https://xuonggomsuviet.vn/binh-hut-loc", anchorText: "bình hút lộc Bát Tràng", keyword: "bình hút lộc Bát Tràng", type: "Backlink website ngành", cost: 500000, publishDate: d(-2), owner: "Nguyễn Văn SEO", status: "Đã đăng" },
    { id: "bl5", websiteId: "w1", name: "Share Medium Sứ Việt", sourceSite: "medium.com", publishedLink: "https://medium.com/@suviet/bao-quan-gom", targetUrl: "https://xuonggomsuviet.vn/bao-quan-gom-su", anchorText: "bảo quản gốm sứ", keyword: "bảo quản gốm sứ", type: "Backlink social", cost: 0, publishDate: d(-15), owner: "Trần Thu Content", status: "Lỗi / mất link", notes: "Bài bị Medium ẩn" },
    { id: "bl6", websiteId: "w3", name: "PR Cafef — quà doanh nghiệp", sourceSite: "cafef.vn", targetUrl: "https://suminhdang.com", anchorText: "quà tặng doanh nghiệp cao cấp", keyword: "quà tặng doanh nghiệp", type: "Bài PR báo chí", cost: 12000000, owner: "Trần Thị B", status: "Đã đặt" },
  ];

  const growth: GrowthMetric[] = [
    { id: "g1", websiteId: "w1", period: "Tuần 1 tháng 5/2026", periodType: "Tuần", periodKey: "2026-W18", updatedAt: d(-10), totalTraffic: 1200, organicTraffic: 860, impressions: 15000, clicks: 620, ctr: 4.1, avgPosition: 18.5, indexedPages: 42, leads: 12, updatedBy: "Nguyễn Văn SEO" },
    { id: "g2", websiteId: "w1", period: "Tuần 2 tháng 5/2026", periodType: "Tuần", periodKey: "2026-W19", updatedAt: d(-3), totalTraffic: 1450, organicTraffic: 1020, impressions: 18500, clicks: 710, ctr: 3.8, avgPosition: 16.2, indexedPages: 48, leads: 16, updatedBy: "Nguyễn Văn SEO", notes: "Traffic tăng tốt nhờ bài tượng Phật" },
  ];

  const webTopics: WebTopic[] = [
    { id: "wt1", websiteId: "w1", name: "Tượng Phật gốm", mainKeyword: "tượng Phật gốm", sheetLink: "https://docs.google.com/spreadsheets/d/wt-tuongphatgom", updatedAt: d(-10) },
    { id: "wt2", websiteId: "w1", name: "Bảo quản gốm sứ", mainKeyword: "bảo quản gốm sứ", sheetLink: "https://docs.google.com/spreadsheets/d/wt-baoquan", updatedAt: d(-7) },
    { id: "wt3", websiteId: "w1", name: "Bình hút lộc Bát Tràng", mainKeyword: "bình hút lộc Bát Tràng", sheetLink: "https://docs.google.com/spreadsheets/d/wt-binhhutloc", updatedAt: d(-6) },
    { id: "wt4", websiteId: "w3", name: "Ấm chén in logo", mainKeyword: "ấm chén in logo", sheetLink: "https://docs.google.com/spreadsheets/d/wt-amchen", updatedAt: d(-5) },
    { id: "wt5", websiteId: "w3", name: "Quà tặng doanh nghiệp", mainKeyword: "quà tặng doanh nghiệp", sheetLink: "https://docs.google.com/spreadsheets/d/wt-quatang", updatedAt: d(-3) },
    { id: "wt6", websiteId: "w4", name: "Bát đĩa nhà hàng", mainKeyword: "bát đĩa nhà hàng", sheetLink: "https://docs.google.com/spreadsheets/d/wt-batdia", updatedAt: d(-2) },
  ];

  return {
    brands, websites, socials, places, tasks, webContents, socialPosts, mapPosts,
    reviews, videos, orders, people, seoChecks, entities, keywords, backlinks, growth,
    webTopics,
    plans: ["Tết 2026", "Khai trương showroom", "Sale tháng 12", "Brand 2026"],
    topics: ["Quà tặng doanh nghiệp", "Sản phẩm mới", "Văn hóa Bát Tràng", "Phong thủy", "Khuyến mãi"],
  };
};

const emptyState = () => ({
  brands: [], websites: [], socials: [], places: [], tasks: [],
  webContents: [], socialPosts: [], mapPosts: [], reviews: [], videos: [],
  orders: [], people: [], seoChecks: [], entities: [], keywords: [],
  backlinks: [], growth: [], webTopics: [],
  plans: [] as string[], topics: [] as string[],
});

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...emptyState(),
      add: (key, item) => set((s) => ({ [key]: [...(s[key] as any[]), item] } as any)),
      update: (key, id, patch) =>
        set((s) => ({
          [key]: (s[key] as any[]).map((i) => (i.id === id ? { ...i, ...patch } : i)),
        } as any)),
      remove: (key, id) =>
        set((s) => ({ [key]: (s[key] as any[]).filter((i) => i.id !== id) } as any)),
      resetAll: (mode) => set(() => (mode === "demo" ? { ...seed() } : { ...emptyState() }) as any),
    }),
    { name: "base-mkt-store", version: 11 }
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
    SEO_CHECK_TEMPLATE[g].forEach((it) => {
      if (!have.has(`${g}::${it.name}`)) {
        missing.push({ id: uid(), websiteId, group: g, name: it.name, description: it.description, done: false });
      }
    });
  });
  return missing;
};
