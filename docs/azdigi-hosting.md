# Chạy Base trên hosting AZDIGI (cPanel + Node.js)

Bản Lovable/Cloudflare vẫn giữ nguyên. Workflow `.github/workflows/azdigi-deploy.yml`
build thêm một bản Node.js (Nitro `node-server`) cho hosting AZDIGI.

## Tách riêng khỏi suviet.com.vn

Base nằm trong thư mục riêng, không dùng `public_html` của suviet.com.vn:

| Mục | Đường dẫn trên hosting |
| --- | --- |
| Thư mục ứng dụng Node (code chạy) | `~/base-suviet-app` |
| Document root của tên miền base | `~/base.suviet.vn` (do cPanel tạo, để trống) |
| Log lỗi | `~/base-suviet-app/stderr.log` |

Không file nào của suviet.com.vn bị đọc hay ghi.

## Cài đặt một lần trong cPanel

1. **Domains → Create a New Domain**: thêm tên miền chạy thử (vd. `base-test.suviet.vn`),
   document root `~/base.suviet.vn`, bỏ chọn "Share document root".
2. **Setup Node.js App → Create Application**
   - Node.js version: 22 (hoặc cao nhất có, tối thiểu 20)
   - Application mode: Production
   - Application root: `base-suviet-app`
   - Application URL: tên miền ở bước 1
   - Application startup file: `app.cjs`
   - Environment variables (chủ hệ thống tự nhập): `SUPABASE_URL`,
     `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`,
     `SUVIET_AI_MODEL`, `CASSO_WEBHOOK_SECRET`, `META_APP_SECRET`,
     `META_WEBHOOK_VERIFY_TOKEN`, `VAPID_PRIVATE_KEY`, `ZALO_APP_ID`,
     `ZALO_APP_SECRET`, `ZALO_OA_SECRET_KEY`. Lấy giá trị từ Lovable → Cloud → Secrets.
3. Bundle không cần `npm install`: Nitro đã gói sẵn dependency vào `.output`.

## Đưa code lên

Mỗi lần merge vào `main`, workflow build và đẩy bundle vào nhánh `deploy-azdigi`.

- **Tự động (khuyến nghị):** tạo SSH key trong cPanel (SSH Access), rồi thêm GitHub
  secrets `AZDIGI_SSH_KEY`, `AZDIGI_SSH_HOST`, `AZDIGI_SSH_PORT`, `AZDIGI_SSH_USER`,
  `AZDIGI_APP_DIR` (= `/home/<user>/base-suviet-app`). Workflow sẽ rsync và khởi động lại app.
- **Thủ công:** cPanel → Git Version Control → clone nhánh `deploy-azdigi` vào
  `~/base-suviet-app`, mỗi lần cập nhật bấm "Update from Remote" rồi Restart app.

## Chuyển tên miền thật

Chỉ sau khi chạy thử ổn: thêm `base.suviet.vn` vào cùng app, trỏ DNS về IP hosting,
bật SSL. Cron Supabase gọi `https://base.suviet.vn/api/public/zalo/dispatch-cron`,
webhook Zalo/Meta/Casso cũng dùng tên miền này nên không cần sửa URL.

## Automatic deploy (set up 2026-11-21)

Every push to `main` runs `.github/workflows/azdigi-deploy.yml`, which builds the
Node bundle and pushes it to the `deploy-azdigi` branch. On the hosting, a cron
job runs `~/bin/base-autodeploy.sh` every 2 minutes: when `deploy-azdigi` has a
new commit it resets `~/base-deploy-src`, rsyncs it into `~/base-suviet-app`
(keeping `tmp/`) and touches `tmp/restart.txt`. Deploys are logged to
`~/base-autodeploy.log`. No SSH key or GitHub secret is needed.

So a change merged into `main` is live on base.suviet.vn about 3–5 minutes later.
