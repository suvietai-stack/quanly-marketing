import {createFileRoute} from '@tanstack/react-router';
import {DesignWork} from '@/components/DesignWork';
export const Route=createFileRoute('/design/reports')({
 head:()=>({meta:[{title:'Báo cáo & Phân tích Thiết Kế — Base Sứ Việt'},{name:'description',content:'Báo cáo & Phân tích Thiết Kế: quản lý công việc và báo cáo theo phạm vi được cấp quyền.'},{property:'og:title',content:'Báo cáo & Phân tích Thiết Kế — Base Sứ Việt'},{property:'og:description',content:'Báo cáo & Phân tích Thiết Kế: công việc, tiến độ và số liệu thực tế tại Base Sứ Việt.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:()=> <DesignWork reportOnly/>,
});
