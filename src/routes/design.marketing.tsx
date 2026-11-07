import {createFileRoute} from '@tanstack/react-router';
import {DesignWork} from '@/components/DesignWork';
export const Route=createFileRoute('/design/marketing')({
 head:()=>({meta:[{title:'Ấn phẩm Marketing — Base Sứ Việt'},{name:'description',content:'Ấn phẩm Marketing: quản lý công việc và báo cáo theo phạm vi được cấp quyền.'},{property:'og:title',content:'Ấn phẩm Marketing — Base Sứ Việt'},{property:'og:description',content:'Ấn phẩm Marketing: công việc, tiến độ và số liệu thực tế tại Base Sứ Việt.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:()=> <DesignWork flow="marketing_design"/>,
});
