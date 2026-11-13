export type LauncherDayPeriod = 'morning' | 'midday' | 'afternoon' | 'evening' | 'late';

export type LauncherGreeting = {
  period: LauncherDayPeriod;
  eyebrow: string;
  title: string;
  subtitle: string;
};

type Message = { title: string; subtitle: string };

/** Workplace greetings vary with the device-local time and rotate each day.
 * No network request, persistent preference, timer-driven animation or AI call. */
const MESSAGES: Record<LauncherDayPeriod, readonly Message[]> = {
  morning: [
    { title: 'Chào buổi sáng', subtitle: 'Bắt đầu ngày mới với những việc quan trọng nhất nhé.' },
    { title: 'Buổi sáng tốt lành', subtitle: 'Một ngày làm việc rõ mục tiêu, cùng Sứ Việt tiến bước.' },
    { title: 'Khởi đầu ngày mới', subtitle: 'Xem nhanh kế hoạch hôm nay và sẵn sàng bắt đầu!' },
  ],
  midday: [
    { title: 'Chào buổi trưa', subtitle: 'Giữa ngày rồi, cùng nhìn lại tiến độ một chút nhé.' },
    { title: 'Buổi trưa nhẹ nhàng', subtitle: 'Những việc ưu tiên đã tới đâu? Kiểm tra nhanh nào.' },
    { title: 'Giữa ngày rồi', subtitle: 'Dành chút thời gian sắp xếp phần việc còn lại nhé.' },
  ],
  afternoon: [
    { title: 'Chào buổi chiều', subtitle: 'Cùng tập trung vào những việc cần hoàn thành hôm nay.' },
    { title: 'Buổi chiều tốt lành', subtitle: 'Kiểm tra tiến độ và xử lý các đầu việc quan trọng.' },
    { title: 'Tiếp nối một ngày hiệu quả', subtitle: 'Mỗi việc hoàn tất là thêm một bước tiến của Sứ Việt.' },
  ],
  evening: [
    { title: 'Chào buổi tối', subtitle: 'Cùng nhìn lại những việc đã hoàn thành hôm nay nhé.' },
    { title: 'Buổi tối tốt lành', subtitle: 'Xem nhanh các đầu việc còn chờ bạn xử lý.' },
    { title: 'Khép lại ngày làm việc', subtitle: 'Một ngày tại Sứ Việt, thêm nhiều điều đáng ghi nhận.' },
  ],
  late: [
    { title: 'Chào buổi khuya', subtitle: 'Chỉ kiểm tra việc thật cần thiết, rồi nghỉ ngơi nhé.' },
    { title: 'Đêm đã muộn', subtitle: 'Chúc bạn sớm khép lại công việc và có thời gian nghỉ ngơi.' },
    { title: 'Chúc một đêm an lành', subtitle: 'Sứ Việt luôn ở đây khi bạn cần xem lại công việc.' },
  ],
};

const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'] as const;

export function launcherDayPeriod(hour: number): LauncherDayPeriod {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'late';
}

export function launcherGreetingAt(now: Date, name?: string, userId = ''): LauncherGreeting {
  const period = launcherDayPeriod(now.getHours());
  const choices = MESSAGES[period];

  // Rotate text once per device-local calendar day. Stable across rerenders,
  // route changes and refreshes, so the welcome banner never randomly flickers.
  const localDay = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
  let userSeed = 0;
  for (const char of userId) userSeed = (userSeed * 31 + char.charCodeAt(0)) >>> 0;
  const choice = choices[(localDay + userSeed % choices.length) % choices.length];
  const displayName = name?.replace(/\s+/g, ' ').trim().slice(0, 64);

  return {
    period,
    eyebrow: `${WEEKDAYS[now.getDay()]} · ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`,
    title: `${choice.title}${displayName ? `, ${displayName}` : ''}!`,
    subtitle: choice.subtitle,
  };
}
