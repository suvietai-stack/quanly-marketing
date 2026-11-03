export function authErrorMessage(error: { code?: string; status?: number } | null | undefined, context: 'login' | 'password' | 'send' = 'login'): string {
  switch (error?.code) {
    case 'email_not_confirmed': return 'Email của bạn chưa được xác nhận. Vui lòng kiểm tra email hoặc yêu cầu gửi lại liên kết xác nhận.';
    case 'invalid_credentials': return 'Thông tin đăng nhập không chính xác.';
    case 'weak_password': return 'Mật khẩu chưa đáp ứng chính sách bảo mật. Vui lòng dùng mật khẩu mạnh hơn.';
    case 'same_password': return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit': return 'Bạn đã thao tác quá nhiều lần. Vui lòng đợi rồi thử lại.';
    case 'user_banned': return 'Tài khoản hiện không được phép truy cập. Vui lòng liên hệ quản trị viên.';
    case 'otp_expired':
    case 'session_not_found': return 'Liên kết xác thực đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu liên kết mới.';
    case 'reauthentication_needed': return 'Vui lòng xác thực lại trước khi đổi mật khẩu.';
  }
  if (error?.status === 429) return 'Bạn đã thao tác quá nhiều lần. Vui lòng đợi rồi thử lại.';
  return context === 'send' ? 'Không gửi được email lúc này. Vui lòng thử lại.' : context === 'password' ? 'Không cập nhật được mật khẩu lúc này. Vui lòng thử lại.' : 'Không kết nối được dịch vụ đăng nhập. Vui lòng thử lại.';
}

export function accountAccess(status: string | null | undefined): 'active' | 'pending' | 'blocked' | 'missing' {
  if (status === 'Đang hoạt động') return 'active';
  if (status === 'Chờ duyệt') return 'pending';
  return status ? 'blocked' : 'missing';
}