function isFakeEmail(email) {
  const e = email.trim().toLowerCase();
  if (!e || !e.includes("@")) return true;
  const domain = e.split("@")[1] ?? "";
  return domain === "user.local" || domain === "local" || domain.endsWith(".local");
}
function passwordIssues(pw) {
  const issues = [];
  if (pw.length < 8) issues.push("Mật khẩu mới tối thiểu 8 ký tự.");
  if (pw.length > 200) issues.push("Mật khẩu tối đa 200 ký tự.");
  if (!/[a-zA-Z]/.test(pw)) issues.push("Mật khẩu mới cần có ít nhất một chữ cái.");
  if (!/[0-9]/.test(pw)) issues.push("Mật khẩu mới cần có ít nhất một chữ số.");
  return issues;
}
function changePasswordError(oldPwd, n1, n2) {
  if (!oldPwd) return "Vui lòng nhập mật khẩu hiện tại.";
  const issues = passwordIssues(n1);
  if (issues.length) return issues[0];
  if (n1 === oldPwd) return "Mật khẩu mới phải khác mật khẩu hiện tại.";
  if (n1 !== n2) return "Mật khẩu xác nhận không khớp.";
  return null;
}
function authErrorMessage(error, context = "login") {
  switch (error?.code) {
    case "email_not_confirmed":
      return "Email của bạn chưa được xác nhận. Vui lòng kiểm tra email hoặc yêu cầu gửi lại liên kết xác nhận.";
    case "invalid_credentials":
      return "Thông tin đăng nhập không chính xác.";
    case "weak_password":
      return "Mật khẩu chưa đáp ứng chính sách bảo mật. Vui lòng dùng mật khẩu mạnh hơn.";
    case "same_password":
      return "Mật khẩu mới phải khác mật khẩu hiện tại.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Bạn đã thao tác quá nhiều lần. Vui lòng đợi rồi thử lại.";
    case "user_banned":
      return "Tài khoản hiện không được phép truy cập. Vui lòng liên hệ quản trị viên.";
    case "otp_expired":
    case "session_not_found":
      return "Liên kết xác thực đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu liên kết mới.";
    case "reauthentication_needed":
      return "Vui lòng xác thực lại trước khi đổi mật khẩu.";
  }
  if (error?.status === 429) return "Bạn đã thao tác quá nhiều lần. Vui lòng đợi rồi thử lại.";
  return context === "send" ? "Không gửi được email lúc này. Vui lòng thử lại." : context === "password" ? "Không cập nhật được mật khẩu lúc này. Vui lòng thử lại." : "Không kết nối được dịch vụ đăng nhập. Vui lòng thử lại.";
}
function accountAccess(status) {
  if (status === "Đang hoạt động") return "active";
  if (status === "Chờ duyệt") return "pending";
  return status ? "blocked" : "missing";
}
export {
  authErrorMessage as a,
  accountAccess as b,
  changePasswordError as c,
  isFakeEmail as i,
  passwordIssues as p
};
