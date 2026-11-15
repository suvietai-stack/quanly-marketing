export const CHIPI_SIZES = [90, 120, 150, 180] as const;
export type ChipiSize = typeof CHIPI_SIZES[number];
export function validChipiSize(value: unknown): ChipiSize {
  return CHIPI_SIZES.find((size) => size === value) ?? 150;
}
export function chipiGreeting(date: Date): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "numeric", hourCycle: "h23" }).format(date));
  if (hour < 11 && hour >= 5) return "Chào ngày mới! Đốm chúc bạn một buổi sáng nhiều năng lượng.";
  if (hour >= 11 && hour < 14) return "Đến giờ ăn trưa rồi, nhớ ăn ngon và nghỉ một chút nhé!";
  if (hour >= 14 && hour < 18) return "Buổi chiều rồi! Cứ từng việc một, Đốm cổ vũ bạn.";
  return "Buổi tối rồi, nhớ dành thời gian nghỉ ngơi nhé!";
}
/** Existing artwork only; these are greetings, never task-completion claims. */
export function chipiGreetingPose(date: Date): "hello" | "thankyou" | "celebrate" | "quiet" {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "numeric", hourCycle: "h23" }).format(date));
  if (hour >= 5 && hour < 11) return "hello";
  if (hour >= 11 && hour < 14) return "thankyou";
  if (hour >= 14 && hour < 18) return "celebrate";
  return "quiet";
}
export const CHIPI_CHAT_LINES = [
  "Uống một ngụm nước nhé, Đốm cũng đang tiếp năng lượng đây!",
  "Từng bước nhỏ cũng đưa mình đến đích. Cố lên nhé!",
  "Thả lỏng vai một chút, bạn đã làm việc chăm chỉ rồi.",
  "Đốm gửi bạn một chút năng lượng tích cực!",
  "Nhìn ra xa vài giây để đôi mắt được nghỉ nhé.",
  "Một ngày tốt lành bắt đầu từ những việc nhỏ xinh.",
  "Bạn không cần làm mọi thứ cùng lúc đâu.",
  "Đốm tin bạn sẽ tìm được cách giải quyết phù hợp.",
  "Nhớ giữ cốc nước ở gần mình nhé!",
  "Hít thở chậm một chút, rồi mình tiếp tục nào.",
  "Hôm nay bạn đã cố gắng rồi, đừng quên ghi nhận điều đó.",
  "Một nụ cười nhỏ cũng làm buổi làm việc dễ chịu hơn.",
  "Đốm đang âm thầm cổ vũ bạn đây!",
  "Đứng dậy duỗi chân một chút khi thuận tiện nhé.",
  "Làm chậm mà chắc cũng rất đáng tự hào.",
  "Chúc bạn gặp nhiều điều dễ thương hôm nay!",
  "Nghỉ một nhịp rồi quay lại, ý tưởng có thể sáng hơn đấy.",
  "Đừng quên ăn đúng bữa nhé, người bạn chăm chỉ!",
  "Mỗi việc hoàn thành đều là một bước tiến.",
  "Giữ nhịp riêng của bạn, Đốm luôn ở đây.",
  "Một chút kiên nhẫn có thể làm nên điều hay.",
  "Bạn xứng đáng có một phút nghỉ thoải mái.",
  "Đốm chúc bạn một buổi làm việc suôn sẻ!",
  "Nhẹ nhàng với chính mình một chút nhé.",
  "Chúng mình cứ làm tốt từng việc nhỏ thôi.",
  "Một ý tưởng hay đôi khi đến sau một ngụm nước.",
  "Thả lỏng bàn tay một lát nếu bạn gõ nhiều nhé.",
  "Đốm gửi một lời chúc bình an đến bạn.",
  "Nhớ chăm sóc mình như cách bạn chăm chút công việc.",
  "Hôm nay có thể chưa hoàn hảo, nhưng vẫn có điều đáng vui.",
  "Một chút tập trung, một chút nghỉ ngơi — thật vừa vặn!",
  "Chúc những việc khó dần trở nên dễ hơn với bạn.",
  "Bạn đang tiến lên, dù có lúc bước thật chậm.",
  "Đốm mong bạn có một ngày thật dễ chịu.",
  "Đổi tư thế ngồi một chút cho thoải mái nhé.",
  "Cảm ơn bạn đã cố gắng hôm nay!",
] as const;
export function chipiChatDelay(random: number): number {
  return (60 + Math.min(1, Math.max(0, random)) * 60) * 60_000;
}
export function nextChipiLine(previous: number, random: number): number {
  const choices = CHIPI_CHAT_LINES.map((_, index) => index).filter((index) => index !== previous);
  return choices[Math.min(choices.length - 1, Math.floor(Math.max(0, random) * choices.length))] ?? 0;
}