import { createFileRoute } from '@tanstack/react-router';
import { ShowroomSuppliers } from '@/components/showroom/ShowroomSuppliers';

export const Route = createFileRoute('/showroom_/suppliers')({
  head: () => ({ meta: [
    { title: 'Nhà cung cấp Showroom — Base Sứ Việt' },
    { name: 'description', content: 'Hồ sơ nhà cung cấp sản phẩm, danh mục nguồn hàng và lịch sử liên hệ của Khối Showroom.' },
  ] }),
  component: ShowroomSuppliers,
});
