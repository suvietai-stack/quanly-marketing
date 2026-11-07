import {createFileRoute} from '@tanstack/react-router';
import {DesignWork} from '@/components/DesignWork';
export const Route=createFileRoute('/design/mockups')({
 head:()=>({meta:[{title:'Ma-két đơn hàng — Base Sứ Việt'},{name:'description',content:'Ma-két đơn hàng: quản lý công việc và báo cáo theo phạm vi được cấp quyền.'},{property:'og:title',content:'Ma-két đơn hàng — Base Sứ Việt'},{property:'og:description',content:'Ma-két đơn hàng: công việc, tiến độ và số liệu thực tế tại Base Sứ Việt.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:()=> <DesignWork flow="order_mockup"/>,
});
