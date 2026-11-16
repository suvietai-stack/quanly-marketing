import { createFileRoute } from '@tanstack/react-router';
import { SupplierMaster } from '@/components/procurement/SupplierMaster';

export const Route = createFileRoute('/procurement_/suppliers')({
  head: () => ({ meta: [
    { title: 'Nhà cung cấp — Mua Hàng & Giao Vận — Base Sứ Việt' },
    { name: 'description', content: 'Trung tâm nhà cung cấp chung toàn công ty: danh mục, sản phẩm, lịch sử hợp tác.' },
  ] }),
  component: SupplierMaster,
});
