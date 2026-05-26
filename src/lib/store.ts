import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth, type User as AuthUser, type Role as AuthRole } from "@/lib/auth";

export type ID = string;

export interface BrandDocument {
  id: ID;
  name: string;
  type?: "Brand guideline" | "Content guideline" | "SEO guideline" | "Social guideline" | "Hình ảnh sản phẩm" | "Catalogue/Profile" | "Báo giá" | "Tài liệu khác";
  url?: string;
  updatedAt?: string;
  updatedBy?: string;
  notes?: string;
}

export interface BrandNote {
  id: ID;
  content: string;
  createdBy?: string;
  createdAt?: string;
  importance?: "Thông thường" | "Quan trọng" | "Cần chú ý";
  status?: "Mở" | "Đã xử lý" | "Đóng";
}

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
  // Profile extras
  projectName?: string;
  longDescription?: string;
  marketingGoal?: string;
  targetAudience?: string;
  mainProducts?: string;
  startDate?: string;
  // Contact
  legalName?: string;
  contactPerson?: string;
  mainPhone?: string;
  hotline?: string;
  email?: string;
  officeAddress?: string;
  warehouseAddress?: string;
  serviceArea?: string;
  zalo?: string;
  fanpage?: string;
  mapLink?: string;
  taxCode?: string;
  contactNotes?: string;
  // Identity
  logoMain?: string;
  logoSecondary?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  brandFont?: string;
  toneOfVoice?: string;
  imageStyle?: string;
  brandKeywords?: string;
  slogan?: string;
  logoUsage?: string;
  identityNotes?: string;
  // Docs & operational notes
  documents?: BrandDocument[];
  operationalNotes?: BrandNote[];
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

export type SocialPlatform =
  | "Facebook Page" | "Facebook Group" | "TikTok" | "YouTube"
  | "Instagram" | "Zalo OA" | "LinkedIn" | "Khác";
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "Facebook Page", "Facebook Group", "TikTok", "YouTube",
  "Instagram", "Zalo OA", "LinkedIn", "Khác",
];

export type SocialChannelStatus =
  | "Đang xây" | "Đang vận hành" | "Đang tối ưu" | "Tạm dừng" | "Lưu trữ";
export const SOCIAL_CHANNEL_STATUSES: SocialChannelStatus[] = [
  "Đang xây", "Đang vận hành", "Đang tối ưu", "Tạm dừng", "Lưu trữ",
];

export interface SocialChannel {
  id: ID;
  name: string;
  platform: SocialPlatform;
  url?: string;
  brandId: ID;
  owner?: string;
  frequency?: string;
  goal?: string;
  status: SocialChannelStatus;
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
export type TaskStatus =
  | "Mới tạo"
  | "Đã giao"
  | "Đang làm"
  | "Chờ xác nhận"
  | "Cần sửa"
  | "Hoàn thành"
  | "Đã hủy";

export const TASK_STATUSES: TaskStatus[] = [
  "Mới tạo", "Đã giao", "Đang làm", "Chờ xác nhận", "Cần sửa", "Hoàn thành", "Đã hủy",
];

/** Map các trạng thái Task cũ → mới (giữ tương thích ngược với dữ liệu trước workflow). */
export function normalizeTaskStatus(s: string | undefined): TaskStatus {
  if (!s) return "Mới tạo";
  if (s === "Chưa làm") return "Mới tạo";
  if ((TASK_STATUSES as string[]).includes(s)) return s as TaskStatus;
  return "Mới tạo";
}

export interface TaskHistoryEntry {
  at: string;
  byId?: ID;
  byName?: string;
  action: string;
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  note?: string;
  forced?: boolean;
}

export interface Task {
  id: ID;
  title: string;
  description?: string;
  brandId?: ID;
  module?: string;
  relatedLink?: string;
  assignee?: string;
  reporter?: string;
  approver?: string;
  relatedPeople?: string[];
  deadline?: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  link?: string;
  plan?: string;
  topic?: string;
  inputLink?: string;
  resultLink?: string;
  handoverLink?: string;
  processNote?: string;
  revisionNote?: string;
  revisions?: number;
  createdAt?: string;
  acceptedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  history?: TaskHistoryEntry[];
  // Submit-completion fields
  completionNote?: string;
  completionFiles?: { name?: string; url: string }[];
  relatedDocumentLink?: string;
  submittedBy?: string;
}

export type ContentStatus =
  | "Kế hoạch"
  | "Đã tạo"
  | "Đã giao"
  | "Đang làm outline"
  | "Chờ duyệt outline"
  | "Cần sửa outline"
  | "Outline đã duyệt"
  | "Đang viết bài"
  | "Chờ duyệt bài"
  | "Cần sửa bài"
  | "Bài viết đã duyệt"
  | "Đang trình bày nháp web"
  | "Chờ duyệt bản nháp web"
  | "Cần sửa bản nháp web"
  | "Bản nháp web đã duyệt"
  | "Chờ đăng web"
  | "Đã đăng web"
  | "Kiểm tra index"
  | "Hoàn thành"
  // Optimize-only workflow
  | "Đang tối ưu"
  | "Chờ duyệt tối ưu"
  | "Cần sửa tối ưu"
  | "Đã duyệt tối ưu"
  | "Đã hủy";

export const CONTENT_STATUSES: ContentStatus[] = [
  "Kế hoạch", "Đã tạo", "Đã giao", "Đang làm outline", "Chờ duyệt outline", "Cần sửa outline",
  "Outline đã duyệt", "Đang viết bài", "Chờ duyệt bài", "Cần sửa bài", "Bài viết đã duyệt",
  "Đang trình bày nháp web", "Chờ duyệt bản nháp web", "Cần sửa bản nháp web", "Bản nháp web đã duyệt",
  "Chờ đăng web", "Đã đăng web", "Kiểm tra index", "Hoàn thành",
  "Đang tối ưu", "Chờ duyệt tối ưu", "Cần sửa tối ưu", "Đã duyệt tối ưu", "Đã hủy",
];


/** Map các trạng thái cũ → trạng thái mới khi đọc từ DB (giữ tương thích ngược). */
export function normalizeContentStatus(s: string | undefined): ContentStatus {
  if (s === "Bài đã duyệt") return "Bài viết đã duyệt";
  return (s as ContentStatus) ?? "Kế hoạch";
}

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
  | "Tối ưu định kỳ"
  | "Từ khóa tụt hạng"
  | "Từ khóa mất TOP"
  | "Cập nhật sản phẩm/dịch vụ"
  | "Cập nhật thông tin thương hiệu"
  | "Bổ sung internal link"
  | "Cải thiện CTA/chuyển đổi"
  | "Cập nhật hình ảnh"
  | "Khác"
  // Legacy values (giữ tương thích ngược)
  | "Bài tụt hạng" | "Bài cũ thiếu thông tin" | "Bài chưa có CTA"
  | "Bài thiếu internal link" | "Bài chưa index"
  | "Bài cần cập nhật sản phẩm/dịch vụ" | "Bài cần tối ưu chuyển đổi";

export const OPTIMIZE_REASONS: OptimizeReason[] = [
  "Tối ưu định kỳ",
  "Từ khóa tụt hạng",
  "Từ khóa mất TOP",
  "Cập nhật sản phẩm/dịch vụ",
  "Cập nhật thông tin thương hiệu",
  "Bổ sung internal link",
  "Cải thiện CTA/chuyển đổi",
  "Cập nhật hình ảnh",
  "Khác",
];

export type OptimizeSource = "Thủ công" | "Theo lịch tối ưu" | "Từ Check TOP";
export const OPTIMIZE_SOURCES: OptimizeSource[] = ["Thủ công", "Theo lịch tối ưu", "Từ Check TOP"];

export type OptimizeTarget =
  | "Tiêu đề/H1" | "Nội dung bài viết" | "Meta title/meta description"
  | "Internal link" | "CTA" | "Hình ảnh" | "Sản phẩm/dịch vụ"
  | "Bố cục trình bày" | "Từ khóa" | "Khác";
export const OPTIMIZE_TARGETS: OptimizeTarget[] = [
  "Tiêu đề/H1", "Nội dung bài viết", "Meta title/meta description",
  "Internal link", "CTA", "Hình ảnh", "Sản phẩm/dịch vụ",
  "Bố cục trình bày", "Từ khóa", "Khác",
];

export type OptimizeRecurringPeriod = "Hàng tháng" | "Mỗi 3 tháng" | "Mỗi 6 tháng" | "Mỗi 1 năm";
export const OPTIMIZE_RECURRING_PERIODS: OptimizeRecurringPeriod[] = [
  "Hàng tháng", "Mỗi 3 tháng", "Mỗi 6 tháng", "Mỗi 1 năm",
];

export type OptimizeScheduleTrackStatus = "Chưa thiết lập" | "Đang theo dõi" | "Tạm dừng";
export const OPTIMIZE_SCHEDULE_TRACK_STATUSES: OptimizeScheduleTrackStatus[] = [
  "Chưa thiết lập", "Đang theo dõi", "Tạm dừng",
];

export function periodToMonths(p: OptimizeRecurringPeriod): number {
  switch (p) {
    case "Hàng tháng": return 1;
    case "Mỗi 3 tháng": return 3;
    case "Mỗi 6 tháng": return 6;
    case "Mỗi 1 năm": return 12;
  }
}

/** Tính ngày tối ưu tiếp theo (ISO yyyy-mm-dd) cộng N tháng từ baseISO. */
export function computeNextOptimizeDate(baseISO: string, period: OptimizeRecurringPeriod): string {
  const d = new Date(baseISO);
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + periodToMonths(period));
  return d.toISOString().slice(0, 10);
}


export interface WebContentHistoryEntry {
  at: string;
  byId?: ID;
  byName?: string;
  action: string;
  fromStatus?: ContentStatus;
  toStatus?: ContentStatus;
  note?: string;
  forced?: boolean;
}

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
  // Bản nháp web (trình bày trước khi đăng)
  webDraftLink?: string;
  webDraftLayoutBy?: string;
  webDraftReviewer?: string;
  webDraftReviewNotes?: string;
  webDraftRevisions?: number;
  webDraftSubmittedAt?: string;
  webDraftApprovedAt?: string;
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
  optimizeSource?: OptimizeSource;
  sourceContentId?: ID;
  optimizeTargets?: OptimizeTarget[];
  optimizeRefLink?: string;
  optimizeRecurring?: boolean;
  optimizeRecurringPeriod?: OptimizeRecurringPeriod;
  nextOptimizeAt?: string;
  optimizeScheduleTrackStatus?: OptimizeScheduleTrackStatus;
  optimizeScheduleSetAt?: string;
  // Optimize workflow (only for "Bài tối ưu lại")
  optimizeReviewer?: string;
  optimizeAssignNote?: string;
  optimizeResultLink?: string;
  optimizeResultNote?: string;
  optimizeReviewNotes?: string;
  optimizeRevisions?: number;

  // Lịch sử xử lý
  history?: WebContentHistoryEntry[];
}

// Returns true if a KeywordTrack still corresponds to a real keyword the
// user can see in Check TOP. Used to filter out orphan tracks (e.g. when the
// underlying content was un-indexed, deleted, or the keyword text removed).
export function isActiveKeywordTrack(k: KeywordTrack, contents: WebContent[]): boolean {
  if (!k.contentId) return true; // standalone keyword
  const c = contents.find((x) => x.id === k.contentId);
  if (!c) return false;
  if (c.indexStatus !== "Đã index") return false;
  const kw = (k.keyword || "").trim().toLowerCase();
  if (!kw) return false;
  if (k.isMain) {
    return (c.mainKeyword || "").trim().toLowerCase() === kw;
  }
  const subs = (c.subKeywords || "")
    .split(/[,;\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return subs.includes(kw);
}



export type SocialStatus =
  | "Kế hoạch" | "Đang làm" | "Chờ duyệt" | "Cần sửa"
  | "Đã duyệt" | "Chờ đăng" | "Đã đăng" | "Hoàn thành" | "Đã hủy";

export const SOCIAL_STATUSES: SocialStatus[] = [
  "Kế hoạch", "Đang làm", "Chờ duyệt", "Cần sửa",
  "Đã duyệt", "Chờ đăng", "Đã đăng", "Hoàn thành", "Đã hủy",
];

export type SocialContentType =
  | "Bài ảnh đơn" | "Album" | "Carousel" | "Text post"
  | "Reels" | "TikTok Video" | "YouTube Shorts" | "Story" | "Livestream" | "Khác";
export const SOCIAL_CONTENT_TYPES: SocialContentType[] = [
  "Bài ảnh đơn", "Album", "Carousel", "Text post",
  "Reels", "TikTok Video", "YouTube Shorts", "Story", "Livestream", "Khác",
];

export interface SocialPostHistoryEntry {
  at: string;
  byId?: ID;
  byName?: string;
  action: string;
  fromStatus?: SocialStatus;
  toStatus?: SocialStatus;
  note?: string;
  forced?: boolean;
}

export interface SocialPost {
  id: ID;
  title: string;
  brandId: ID;
  channelId: ID;
  platform: string;
  contentType: SocialContentType;
  topic?: string;
  plan?: string;
  writer?: string;
  designer?: string;
  reviewer?: string;
  publisher?: string;
  scheduledDate?: string;
  publishedDate?: string;
  caption?: string;
  mediaLink?: string;
  publishedLink?: string;
  status: SocialStatus;
  reviewNotes?: string;
  revisions?: number;
  notes?: string;
  history?: SocialPostHistoryEntry[];
}

export function normalizeSocialStatus(s?: string): SocialStatus {
  switch (s) {
    case "Ý tưởng": return "Kế hoạch";
    case "Đã lên lịch": return "Chờ đăng";
    default:
      return (SOCIAL_STATUSES as string[]).includes(s ?? "")
        ? (s as SocialStatus)
        : "Kế hoạch";
  }
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

export type VideoStatus =
  | "Kế hoạch" | "Đã giao"
  | "Đang làm kịch bản" | "Chờ duyệt kịch bản" | "Cần sửa kịch bản" | "Kịch bản đã duyệt"
  | "Đang quay / thu tư liệu" | "Đang dựng"
  | "Chờ duyệt video" | "Cần sửa video" | "Video đã duyệt"
  | "Đã bàn giao" | "Đã đăng" | "Hoàn thành" | "Đã hủy";

export const VIDEO_STATUSES: VideoStatus[] = [
  "Kế hoạch", "Đã giao",
  "Đang làm kịch bản", "Chờ duyệt kịch bản", "Cần sửa kịch bản", "Kịch bản đã duyệt",
  "Đang quay / thu tư liệu", "Đang dựng",
  "Chờ duyệt video", "Cần sửa video", "Video đã duyệt",
  "Đã bàn giao", "Đã đăng", "Hoàn thành", "Đã hủy",
];

export type VideoType =
  | "Video TikTok" | "Facebook Reels" | "YouTube Shorts" | "Video dài YouTube"
  | "Video sản phẩm" | "Video quy trình" | "Video feedback khách hàng"
  | "Video thương hiệu" | "Video quảng cáo" | "Khác";
export const VIDEO_TYPES: VideoType[] = [
  "Video TikTok", "Facebook Reels", "YouTube Shorts", "Video dài YouTube",
  "Video sản phẩm", "Video quy trình", "Video feedback khách hàng",
  "Video thương hiệu", "Video quảng cáo", "Khác",
];

export const VIDEO_USE_CHANNELS = [
  "TikTok", "Facebook", "YouTube", "Website", "Landing page", "Shopee", "Ads", "Khác",
] as const;

export interface VideoHistoryEntry {
  at: string;
  byId?: ID;
  byName?: string;
  action: string;
  fromStatus?: VideoStatus;
  toStatus?: VideoStatus;
  note?: string;
  forced?: boolean;
}

export interface Video {
  id: ID;
  title: string;
  brandId: ID;
  channels?: string;            // text list of "kênh sử dụng"
  videoType?: VideoType;
  purpose?: string;
  description?: string;
  assigner?: string;            // người giao việc
  owner?: string;               // người phụ trách
  reviewer?: string;            // người duyệt
  createdAt?: string;
  scriptDeadline?: string;
  deadline?: string;            // deadline video
  scheduledPublishDate?: string;
  completedAt?: string;
  scriptLink?: string;
  footageLink?: string;
  editLink?: string;
  finalLink?: string;
  publishedLink?: string;
  resourcesLink?: string;
  status: VideoStatus;
  reviewNotes?: string;
  revisions?: number;
  plan?: string;
  topic?: string;
  notes?: string;
  history?: VideoHistoryEntry[];
  // Liên kết
  socialPostId?: ID;
  socialChannel?: string;
  socialPublishedLink?: string;
}

export function normalizeVideoStatus(s?: string): VideoStatus {
  switch (s) {
    case "Ý tưởng": return "Kế hoạch";
    case "Đang sản xuất": return "Đang dựng";
    case "Chờ duyệt": return "Chờ duyệt video";
    case "Cần sửa": return "Cần sửa video";
    default:
      return (VIDEO_STATUSES as string[]).includes(s ?? "")
        ? (s as VideoStatus)
        : "Kế hoạch";
  }
}

export const ORDER_STATUSES = [
  "Chờ phân công",
  "Chờ nhận việc",
  "Đang thực hiện",
  "Chờ duyệt",
  "Cần sửa",
  "Đã duyệt",
  "Đã bàn giao",
  "Hoàn thành",
  "Đã hủy",
] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const ORDER_TYPES = [
  "Banner website", "Ảnh bài web", "Ảnh social", "Thumbnail video",
  "Ảnh sản phẩm", "Catalogue / profile", "Chụp ảnh", "Retouch ảnh",
  "Ảnh Google Map", "Khác",
] as const;
export type OrderType = typeof ORDER_TYPES[number];

export const ORDER_SOURCES = ["Web", "Social", "Video", "Local", "Leader", "Task lẻ", "Khác"] as const;
export type OrderSource = typeof ORDER_SOURCES[number];

export const ORDER_PRIORITIES = ["Thấp", "Trung bình", "Cao", "Gấp"] as const;
export type OrderPriority = typeof ORDER_PRIORITIES[number];

export interface OrderHistoryEntry {
  at: string;
  byId?: ID;
  byName: string;
  action: string;
  fromStatus?: OrderStatus;
  toStatus?: OrderStatus;
  note?: string;
  forced?: boolean;
}

export interface DesignOrder {
  id: ID;
  title: string;
  brandId: ID;
  type: OrderType;
  source: OrderSource;
  sourceModule?: string;
  refLinkObject?: string;
  requester?: string;
  assigner?: string;
  assignedBy?: string;
  assignedAt?: string;
  assignee?: string;
  reviewer?: string;
  deadline?: string;
  priority?: OrderPriority;
  brief?: string;
  styleNote?: string;
  size?: string;
  quantity?: number;
  refLink?: string;
  draftLink?: string;
  deliverLink?: string;
  reviseLink?: string;
  usedLink?: string;
  status: OrderStatus;
  reviewNotes?: string;
  revisions?: number;
  cancelReason?: string;
  takenAt?: string;
  submittedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  history?: OrderHistoryEntry[];
  plan?: string;
  topic?: string;
  notes?: string;
  contentId?: ID;
  videoId?: ID;
  socialPostId?: ID;
  mapPostId?: ID;
  taskId?: ID;
}

export function normalizeOrderStatus(s: any): OrderStatus {
  if (s === "Đang làm") return "Đang thực hiện";
  if (s === "Mới tạo") return "Chờ phân công";
  if ((ORDER_STATUSES as readonly string[]).includes(s)) return s as OrderStatus;
  return "Chờ phân công";
}

export interface Person {
  id: ID;
  name: string;
  role?: string;            // Role name (Super Admin, Content...) or vị trí
  position?: string;        // Vị trí / bộ phận
  email?: string;
  phone?: string;
  status: "Đang làm" | "Tạm nghỉ";
  accountStatus?: "Chờ duyệt" | "Đang hoạt động" | "Tạm khóa" | "Từ chối" | "Lưu trữ";
  isSystem?: boolean;
  notes?: string;
}

export function userToPerson(u: AuthUser, roles: AuthRole[]): Person {
  const role = roles.find((r) => r.id === u.roleId);
  return {
    id: u.id,
    name: u.fullName || u.username,
    role: role?.name,
    position: u.desiredPosition,
    email: u.email,
    phone: u.phone,
    status: u.status === "Đang hoạt động" ? "Đang làm" : "Tạm nghỉ",
    accountStatus: u.status,
    isSystem: !!u.system,
    notes: u.notes,
  };
}

export type GrowthPeriodType = "Tuần" | "Tháng" | "Quý";
export const GROWTH_PERIOD_TYPES: GrowthPeriodType[] = ["Tuần", "Tháng", "Quý"];

export interface GrowthMetric {
  id: ID;
  websiteId?: ID;          // dùng cho web
  channelId?: ID;          // dùng cho social
  period: string;            // ví dụ "Tuần 2 tháng 5/2026" hoặc "Tháng 5/2026"
  periodType: GrowthPeriodType;
  periodKey?: string;        // YYYY-WW / YYYY-MM / YYYY-Qn — dùng để sắp xếp
  updatedAt?: string;        // ngày cập nhật
  // Web metrics
  totalTraffic?: number;
  organicTraffic?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;              // %
  avgPosition?: number;
  indexedPages?: number;
  leads?: number;
  // Social metrics
  followerStart?: number;
  followerEnd?: number;
  postsInPeriod?: number;
  totalViews?: number;
  totalEngagements?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  inboxes?: number;
  // Common
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

  loaded: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  reload: () => Promise<void>;
  add: <K extends keyof Collections>(key: K, item: Collections[K]) => void;
  update: <K extends keyof Collections>(key: K, id: ID, patch: Partial<Collections[K]>) => void;
  remove: <K extends keyof Collections>(key: K, id: ID) => void;
  setCatalog: (scope: "plans" | "topics", items: string[]) => Promise<void>;
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

// ============ Supabase-backed store ============

type CollectionKey = keyof Collections;

const TABLE_FOR: Record<Exclude<CollectionKey, "people">, string> = {
  brands: "brands",
  websites: "websites",
  socials: "socials",
  places: "places",
  tasks: "tasks",
  webContents: "web_contents",
  socialPosts: "social_posts",
  mapPosts: "map_posts",
  reviews: "reviews",
  videos: "videos",
  orders: "orders",
  seoChecks: "seo_checks",
  entities: "entities",
  keywords: "keywords",
  backlinks: "backlinks",
  growth: "growth",
  webTopics: "web_topics",
};

const COLLECTION_KEYS = Object.keys(TABLE_FOR) as Exclude<CollectionKey, "people">[];

const emptyCollections = (): { [K in CollectionKey]: Collections[K][] } => ({
  brands: [], websites: [], socials: [], places: [], tasks: [],
  webContents: [], socialPosts: [], mapPosts: [], reviews: [], videos: [],
  orders: [], people: [], seoChecks: [], entities: [], keywords: [],
  backlinks: [], growth: [], webTopics: [],
});

async function loadAllFromSupabase() {
  const results = await Promise.all(
    COLLECTION_KEYS.map(async (key) => {
      const table = TABLE_FOR[key];
      const { data, error } = await (supabase as any)
        .from(table)
        .select("id, data")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(`Load ${table} failed:`, error.message);
        return [key, [] as any[]] as const;
      }
      let items = (data ?? []).map((r: any) => ({ id: r.id, ...(r.data ?? {}) }));
      if (key === "socialPosts") {
        items = items.map((p: any) => ({ ...p, status: normalizeSocialStatus(p.status) }));
      }
      if (key === "videos") {
        items = items.map((v: any) => ({ ...v, status: normalizeVideoStatus(v.status) }));
      }
      if (key === "orders") {
        items = items.map((o: any) => ({ ...o, status: normalizeOrderStatus(o.status) }));
      }
      if (key === "webContents") {
        items = items.map((c: any) => ({ ...c, status: normalizeContentStatus(c.status) }));
      }
      if (key === "tasks") {
        items = items.map((t: any) => ({ ...t, status: normalizeTaskStatus(t.status) }));
      }
      return [key, items] as const;
    }),
  );
  const cat = await supabase.from("catalogs").select("scope, items");
  const catMap: Record<string, string[]> = { plans: [], topics: [] };
  for (const row of cat.data ?? []) {
    catMap[(row as any).scope] = ((row as any).items as string[]) ?? [];
  }
  const collections = Object.fromEntries(results) as Partial<{ [K in CollectionKey]: Collections[K][] }>;
  return { ...collections, plans: catMap.plans ?? [], topics: catMap.topics ?? [] };
}

type TableKey = Exclude<CollectionKey, "people">;

async function syncInsert<K extends TableKey>(key: K, item: Collections[K]) {
  const table = TABLE_FOR[key];
  const { id, ...rest } = item as any;
  const { data: sess } = await supabase.auth.getSession();
  const userId = sess.session?.user?.id;
  const { error } = await (supabase as any)
    .from(table)
    .insert({ id, data: rest, created_by: userId });
  if (error) {
    console.error(`Insert ${table} failed:`, error.message);
    toast.error(`Lưu thất bại: ${error.message}`);
    await useStore.getState().reload();
  }
}

async function syncUpdate<K extends TableKey>(key: K, id: ID, fullItem: Collections[K]) {
  const table = TABLE_FOR[key];
  const { id: _ignored, ...rest } = fullItem as any;
  const { error } = await (supabase as any)
    .from(table)
    .update({ data: rest })
    .eq("id", id);
  if (error) {
    console.error(`Update ${table} failed:`, error.message);
    toast.error(`Cập nhật thất bại: ${error.message}`);
    await useStore.getState().reload();
  }
}

async function syncDelete(key: TableKey, id: ID) {
  const table = TABLE_FOR[key];
  const { error } = await (supabase as any).from(table).delete().eq("id", id);
  if (error) {
    console.error(`Delete ${table} failed:`, error.message);
    toast.error(`Xóa thất bại: ${error.message}`);
    await useStore.getState().reload();
  }
}

function recomputePeople() {
  const auth = useAuth.getState();
  const people = auth.users.map((u) => userToPerson(u, auth.roles));
  useStore.setState({ people } as any);
}

export const useStore = create<State>((set, get) => ({
  ...emptyCollections(),
  plans: [] as string[],
  topics: [] as string[],
  loaded: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        get().reload();
      } else {
        set({ ...emptyCollections(), plans: [], topics: [], loaded: false });
      }
    });
    // Keep `people` in sync with the auth users list (single source of truth).
    useAuth.subscribe(() => recomputePeople());
    recomputePeople();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await get().reload();
  },

  reload: async () => {
    try {
      const next = await loadAllFromSupabase();
      set({ ...next, loaded: true });
      recomputePeople();
    } catch (e: any) {
      console.error("Reload store failed", e);
      set({ loaded: true });
    }
  },

  add: (key, item) => {
    if (key === "people") {
      toast.error("Tạo nhân sự bằng cách tạo tài khoản mới ở tab Tài khoản & Phân quyền.");
      return;
    }
    set((s) => ({ [key]: [item, ...(s[key] as any[])] } as any));
    void syncInsert(key as TableKey, item as any);
  },

  update: (key, id, patch) => {
    if (key === "people") {
      const p = patch as Partial<Person>;
      void useAuth.getState().updateUser(id, {
        fullName: p.name,
        phone: p.phone,
        email: p.email,
        desiredPosition: p.position ?? p.role,
        notes: p.notes,
      });
      return;
    }
    let updated: any = null;
    set((s) => {
      const list = (s[key] as any[]).map((i) => {
        if (i.id !== id) return i;
        updated = { ...i, ...patch };
        return updated;
      });
      return { [key]: list } as any;
    });
    if (updated) void syncUpdate(key as TableKey, id, updated);
  },

  remove: (key, id) => {
    if (key === "people") {
      toast.error("Để loại bỏ nhân sự, hãy đổi trạng thái tài khoản sang 'Tạm khóa' hoặc 'Lưu trữ' ở tab Tài khoản.");
      return;
    }
    set((s) => ({ [key]: (s[key] as any[]).filter((i) => i.id !== id) } as any));
    void syncDelete(key as TableKey, id);
  },

  setCatalog: async (scope, items) => {
    set({ [scope]: items } as any);
    const { error } = await supabase
      .from("catalogs")
      .upsert({ scope, items: items as any }, { onConflict: "scope" });
    if (error) {
      toast.error(`Lưu danh mục thất bại: ${error.message}`);
      await get().reload();
    }
  },
}));

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
