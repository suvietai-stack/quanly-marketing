import { createFileRoute } from "@tanstack/react-router";

const URL = "https://base.suviet.vn/chinh-sach-bao-mat";
const TITLE = "Chính sách quyền riêng tư — Base Sứ Việt";
const DESC = "Cách Sứ Việt thu thập, sử dụng, bảo vệ và xử lý dữ liệu khách hàng từ Facebook Lead Ads.";

export const Route = createFileRoute("/chinh-sach-bao-mat")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PrivacyPage,
});

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Đơn vị vận hành",
    body: <p>Base Sứ Việt là hệ thống quản lý nội bộ do <strong>Sứ Việt</strong> vận hành, dùng để tiếp nhận và chăm sóc yêu cầu tư vấn của khách hàng. Ứng dụng Meta "Sứ Việt" chỉ được dùng để nhận thông tin khách hàng tự nguyện gửi qua biểu mẫu quảng cáo trên các Trang Facebook do Sứ Việt quản lý.</p>,
  },
  {
    title: "2. Dữ liệu chúng tôi thu thập",
    body: (<>
      <p>Khi bạn điền biểu mẫu Facebook Lead Ads của Sứ Việt, chúng tôi nhận những thông tin bạn đã cung cấp trong biểu mẫu, gồm:</p>
      <ul><li>Họ tên;</li><li>Số điện thoại;</li><li>Nội dung nhu cầu, sản phẩm hoặc câu hỏi bạn quan tâm;</li><li>Các trường khác hiển thị rõ trong biểu mẫu (nếu có), cùng thời điểm gửi và Trang/biểu mẫu nguồn.</li></ul>
      <p>Chúng tôi không thu thập mật khẩu Facebook, danh sách bạn bè hay nội dung tin nhắn cá nhân của bạn.</p>
    </>),
  },
  {
    title: "3. Mục đích sử dụng",
    body: <ul><li>Liên hệ tư vấn, báo giá và giải đáp nhu cầu bạn đã gửi;</li><li>Chăm sóc khách hàng và theo dõi tiến trình hỗ trợ;</li><li>Phân công nhân viên kinh doanh phù hợp để phản hồi;</li><li>Thống kê nội bộ nhằm nâng cao chất lượng phục vụ.</li></ul>,
  },
  {
    title: "4. Bảo mật dữ liệu",
    body: <p>Dữ liệu chỉ được truy cập bởi nhân viên có tài khoản được cấp quyền và cần thông tin để thực hiện công việc. Hệ thống áp dụng phân quyền theo vai trò, kết nối mã hóa và ghi nhật ký thao tác để hạn chế truy cập trái phép.</p>,
  },
  {
    title: "5. Lưu trữ dữ liệu",
    body: <p>Dữ liệu được lưu trên hệ thống Base Sứ Việt trong thời gian cần thiết để phục vụ các mục đích nêu trên, hoặc cho đến khi bạn yêu cầu xóa, trừ trường hợp pháp luật yêu cầu lưu giữ lâu hơn.</p>,
  },
  {
    title: "6. Chia sẻ dữ liệu",
    body: <p>Sứ Việt không bán hoặc cho thuê dữ liệu cá nhân của bạn. Dữ liệu chỉ được sử dụng nội bộ, ngoại trừ các nhà cung cấp hạ tầng kỹ thuật phục vụ vận hành hệ thống hoặc khi cơ quan nhà nước có thẩm quyền yêu cầu theo quy định pháp luật.</p>,
  },
  {
    title: "7. Quyền của bạn",
    body: <p>Bạn có quyền yêu cầu xem, chỉnh sửa, cập nhật hoặc xóa dữ liệu cá nhân đã gửi cho Sứ Việt, cũng như yêu cầu ngừng liên hệ. Chúng tôi sẽ xác minh yêu cầu và xử lý trong thời gian hợp lý.</p>,
  },
  {
    title: "8. Liên hệ",
    body: <p>Để gửi yêu cầu về dữ liệu cá nhân, vui lòng nhắn tin trực tiếp tới Trang Facebook của Sứ Việt nơi bạn đã điền biểu mẫu, hoặc liên hệ nhân viên Sứ Việt đã tư vấn cho bạn.</p>,
  },
  {
    title: "9. Cập nhật chính sách",
    body: <p>Chính sách có thể được cập nhật khi cần thiết. Phiên bản mới nhất luôn được đăng tại trang này.</p>,
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Base Sứ Việt</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Chính sách quyền riêng tư</h1>
          <p className="mt-3 text-muted-foreground">{DESC}</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title} className="space-y-3 text-[15px] leading-relaxed text-foreground/90 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
            {s.body}
          </section>
        ))}
        <footer className="border-t pt-6 text-sm text-muted-foreground">© Sứ Việt</footer>
      </main>
    </div>
  );
}
