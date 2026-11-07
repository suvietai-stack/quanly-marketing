import { createFileRoute } from '@tanstack/react-router';
import { DesignWork } from '@/components/DesignWork';
export const Route=createFileRoute('/orders')({
 validateSearch:(s:Record<string,unknown>):{open?:string}=>typeof s.open==='string'?{open:s.open}:{},
 head:()=>({meta:[{title:'Tất cả công việc Thiết Kế — Base Sứ Việt'},{name:'description',content:'Theo dõi công việc Chụp ảnh, Ấn phẩm Marketing và Ma-két đơn hàng theo quyền.'},{property:'og:title',content:'Tất cả công việc Thiết Kế — Base Sứ Việt'},{property:'og:description',content:'Công việc Thiết Kế trên một hệ thống Order thống nhất.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:Orders,
});
function Orders(){const {open}=Route.useSearch();const navigate=Route.useNavigate();return <DesignWork openId={open} onCloseDeepLink={()=>{void navigate({search:{}});}}/>;}
