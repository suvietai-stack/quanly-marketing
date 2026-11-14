/** Base UI workflow guide index. These are navigation instructions,
 * not permission grants or automatically executed business actions. */
export type BaseGuide = { id:string; title:string; keywords:string[]; path:string; steps:string[]; note?:string };
export const BASE_GUIDES:BaseGuide[] = [
 {id:'design-create',title:'Tạo Job thiết kế',keywords:['tạo job','tạo công việc thiết kế','giao job','tạo thiết kế','brief thiết kế'],
  path:'/orders',steps:[
   'Vào Thiết kế → Tất cả công việc, hoặc chọn một luồng Chụp ảnh / Ấn phẩm Marketing / Ma-két đơn hàng.',
   'Chọn Tạo Job nếu tài khoản có quyền tạo công việc.',
   'Nhập tên, brief, thời hạn; chọn luồng công việc, người yêu cầu và người phụ trách.',
   'Lưu Job rồi mở chi tiết để theo dõi trạng thái, tài liệu và trao đổi.'
  ]},
 {id:'design-review',title:'Gửi duyệt hoặc yêu cầu sửa Job thiết kế',keywords:['gửi duyệt','duyệt thiết kế','yêu cầu sửa','trả sửa','chờ duyệt','bàn giao thiết kế'],
  path:'/orders',steps:[
   'Vào Thiết kế và mở đúng Job.',
   'Trong tab Xử lý công việc, xem trạng thái và các hành động đang được phép.',
   'Người phụ trách cập nhật bản nháp hoặc file bàn giao trước khi gửi duyệt.',
   'Người có quyền duyệt chọn nút duyệt hoặc yêu cầu sửa; nhập ghi chú chỉnh sửa khi cần.'
  ],note:'Các nút được hiển thị theo trạng thái Job và quyền tài khoản; Chipi không tự duyệt.'},
 {id:'design-chat',title:'Trao đổi riêng trong một Job thiết kế',keywords:['chat job','trao đổi job','nhắn thiết kế','tin nhắn thiết kế','chat thiết kế'],
  path:'/orders',steps:[
   'Mở Job cần trao đổi ở mục Thiết kế.',
   'Chọn tab Trao đổi trong cửa sổ chi tiết.',
   'Nhắn nội dung hoặc gửi ảnh/tài liệu cho người phụ trách.',
   'Xem số tin chưa đọc trên tab và xem lại lịch sử ngay trong Job.'
  ]},
 {id:'signal',title:'Tạo, phân công và chăm sóc Tín hiệu',keywords:['tín hiệu','phân công sale','giao sale','khách hàng tiềm năng','tạo tín hiệu'],
  path:'/signals',steps:[
   'Vào Kinh doanh → Danh sách tín hiệu.',
   'Tìm tín hiệu theo khách hàng hoặc tạo tín hiệu mới nếu có quyền.',
   'Người có quyền phân công chọn nhân viên Sale phụ trách.',
   'Sale mở tín hiệu được giao và cập nhật hoạt động, lịch chăm sóc theo các trường có sẵn.'
  ],note:'Phân công và chỉnh sửa phụ thuộc quyền của tài khoản.'},
 {id:'quotes',title:'Gửi yêu cầu Hỏi giá & Tiến độ',keywords:['hỏi giá','báo giá','hỏi tiến độ','gửi hỏi giá','yêu cầu tiến độ'],
  path:'/order-quotes',steps:[
   'Vào Mua hàng & Giao vận → Hỏi Giá & Tiến Độ.',
   'Chọn tạo yêu cầu, nhập tên hàng, số lượng, thời hạn và nội dung cần hỏi.',
   'Chọn nhu cầu hỏi giá hoặc tiến độ, kiểm tra thông tin rồi gửi.',
   'Theo dõi phản hồi tại chính yêu cầu, không phải tạo yêu cầu trùng.'
  ]},
 {id:'delivery',title:'Theo dõi đơn hàng',keywords:['theo dõi đơn','đơn hàng giao','giao hàng','cập nhật đơn hàng','tiến độ giao'],
  path:'/order-tracking',steps:[
   'Vào Mua hàng & Giao vận → Theo Dõi Đơn Hàng.',
   'Tìm đơn theo mã, tên hoặc trạng thái.',
   'Mở chi tiết để xem công việc, người xử lý, hạn giao và diễn biến.',
   'Cập nhật nội dung theo nút và quyền hiện có trên đơn.'
  ]},
 {id:'approvals',title:'Xem và xử lý phê duyệt',keywords:['phê duyệt','trung tâm phê duyệt','chờ tôi duyệt','duyệt đơn','duyệt đề nghị'],
  path:'/approvals',steps:[
   'Mở mục Phê duyệt ở menu Base (nếu tài khoản được giao duyệt).',
   'Lọc danh sách chờ bạn xử lý, mở đơn cần xem.',
   'Đối chiếu nội dung, chứng từ đính kèm và lịch sử.',
   'Chọn phê duyệt hoặc trả lại theo nút và quyền được cấp.'
  ]},
 {id:'finance',title:'Tạo đề nghị thanh toán hoặc tạm ứng',keywords:['đề nghị thanh toán','tạm ứng','tạm ứng lương','đề nghị tiền','thanh toán chi phí'],
  path:'/finance/payment',steps:[
   'Vào Kế toán & Tài chính.',
   'Chọn đúng mục: Đề Nghị Thanh Toán, Đề Nghị Tạm Ứng hoặc Tạm Ứng Lương.',
   'Điền nội dung, số tiền, chứng từ và các thông tin bắt buộc.',
   'Kiểm tra rồi gửi duyệt; theo dõi trạng thái trong hồ sơ đã tạo.'
  ]},
 {id:'k3',title:'Lập và cập nhật công việc 3K',keywords:['3k','kế hoạch 3k','kpi 3k','kết quả 3k','công việc hôm nay'],
  path:'/biz/3k',steps:[
   'Mở 3K của tôi trên menu Base.',
   'Chọn ngày hoặc kỳ cần thao tác, xem các mục tiêu và việc đã giao.',
   'Thêm hoặc cập nhật đầu việc trong phạm vi quyền, đặt mốc thời gian và kết quả thực tế.',
   'Kiểm tra các mục cần xác nhận và hoàn tất theo nút đang hiển thị.'
  ]},
 {id:'leave',title:'Gửi đơn nghỉ phép hoặc đi sớm về muộn',keywords:['nghỉ phép','xin nghỉ','đi sớm','về muộn','đơn nghỉ'],
  path:'/leave',steps:[
   'Vào Hành chính & Nhân sự → Nghỉ phép & Đi sớm muộn.',
   'Chọn loại đơn phù hợp và nhập ngày/giờ, lý do.',
   'Kiểm tra người duyệt, gửi đơn.',
   'Theo dõi trạng thái và phản hồi ở danh sách đơn của mình.'
  ]},
 {id:'community',title:'Đăng bài Cộng đồng và dùng Chat nội bộ',keywords:['cộng đồng','đăng bài','facebook nội bộ','tin nhắn nội bộ','chat nhóm','sứ việt chat'],
  path:'/community',steps:[
   'Mở Cộng đồng trên thanh menu hoặc thanh dưới điện thoại.',
   'Ở tab Bảng tin, viết bài và thêm ảnh để chia sẻ với đồng nghiệp.',
   'Vào tab Tin nhắn để chat cá nhân hoặc tạo nhóm nội bộ.',
   'Trong trang Cá nhân, chọn Bài viết của tôi để xem lại bài đã đăng.'
  ]},
 {id:'account',title:'Cập nhật hồ sơ cá nhân',keywords:['cá nhân','đổi mật khẩu','hồ sơ','tài khoản của tôi'],
  path:'/profile',steps:[
   'Chọn Cá nhân trên thanh dưới hoặc menu tài khoản.',
   'Mở Hồ sơ & bảo mật để xem/cập nhật thông tin được phép.',
   'Dùng mục Đổi mật khẩu khi cần, không chia sẻ mật khẩu cho người khác.'
  ]},
];
function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLocaleLowerCase('vi').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
const common=new Set(['cach','lam','nao','the','la','gi','tren','base','huong','dan','toi','muon','can','cho','voi','trong','de','co','the','nhu']);
export function relevantBaseGuides(question:string,limit=3):BaseGuide[]{
  const query=normalize(question);if(!query)return [];
  const terms=query.split(' ').filter(w=>w.length>1&&!common.has(w));
  return BASE_GUIDES.map(g=>{
    const title=normalize(g.title),keys=g.keywords.map(normalize);
    const matched=keys.filter(k=>query.includes(k));
    const overlap=terms.filter(t=>title.includes(t)||keys.some(k=>k.includes(t))).length;
    return {g,score:matched.length*5+overlap};
  }).filter(x=>x.score>=2).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.g);
}
export function guideFallback(guide:BaseGuide):string{
  return `**${guide.title}**\n${guide.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')}${guide.note?'\n\nLưu ý: '+guide.note:''}`;
}
