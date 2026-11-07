import {createFileRoute} from '@tanstack/react-router';
import {DesignWork} from '@/components/DesignWork';
export const Route=createFileRoute('/design/photo')({
 head:()=>({meta:[{title:'Chụp ảnh — Base Sứ Việt'},{name:'description',content:'Chụp ảnh: quản lý công việc và báo cáo theo phạm vi được cấp quyền.'},{property:'og:title',content:'Chụp ảnh — Base Sứ Việt'},{property:'og:description',content:'Chụp ảnh: công việc, tiến độ và số liệu thực tế tại Base Sứ Việt.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:()=> <DesignWork flow="photo"/>,
});
