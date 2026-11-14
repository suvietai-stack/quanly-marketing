import type { SupabaseClient } from '@supabase/supabase-js';
import { validRecordContext, type RecordContext } from './recordContext';
import { designNextStep } from '@/lib/orders/workboard';
import type { DesignOrder } from '@/lib/store';
import { FR_STATUS_LABEL, type FrStatus } from '@/lib/financeRequests/logic';
import { statusLabel } from '@/lib/signals/catalog';

/** Every read uses the caller client and existing table RLS. Never service role. */
export async function readRecordContext(db: SupabaseClient, context: RecordContext) {
  if (!validRecordContext(context)) throw new Error('Ngữ cảnh hồ sơ không hợp lệ.');
  let title='', status='', waiting='', next='', extra='', href='';
  const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  const directory = await db.rpc('get_profiles_directory');
  const name=(id: string | null) => (directory.data as {id:string;full_name:string}[] | null)?.find(p => p.id===id)?.full_name || 'Chưa xác định';
  if(context.kind==='design') {
    const {data,error}=await db.from('orders').select('id,data').eq('id',context.id).maybeSingle();
    if(error||!data)throw new Error('Không đọc được hồ sơ này trong quyền hiện tại của bạn.');
    const o=data.data as DesignOrder;
    title=o.title;status=o.status;href=`/orders?open=${encodeURIComponent(context.id)}`;
    waiting=o.status==='Chờ phân công' ? 'Người có quyền phân công hoặc nhận việc' : o.status==='Chờ duyệt' ? o.reviewer || o.requester || 'Chưa xác định người duyệt' : o.assignee || 'Chưa phân công';
    if(o.status==='Đã bàn giao')waiting=o.requester || 'Người yêu cầu';
    next=designNextStep(o)||'Mở hồ sơ để xem thao tác được cấp quyền.';
    if(['Hoàn thành','Đã hủy'].includes(o.status))waiting='Không còn bước xử lý đang chờ';
    extra=o.deadline ? `Hạn: ${o.deadline}` : '';
  } else if(context.kind==='signal') {
    if(!uuid.test(context.id))throw new Error('Mã tín hiệu không hợp lệ.');
    const {data:o,error}=await db.from('opportunity_signals').select('customer_name,status,assigned_to,cancelled_at,next_contact_on').eq('id',context.id).maybeSingle();
    if(error||!o)throw new Error('Không đọc được hồ sơ này trong quyền hiện tại của bạn.');
    title=o.customer_name;status=o.cancelled_at?'Đã hủy':!o.assigned_to?'Chưa phân công':statusLabel(o.status);
    waiting=o.cancelled_at||['won','lost'].includes(o.status)?'Không còn bước xử lý đang chờ':o.assigned_to?name(o.assigned_to):'Người có quyền phân công Sale';
    next=o.cancelled_at?'Tín hiệu đã hủy; xem lý do trong hồ sơ.':['won','lost'].includes(o.status)?'Tín hiệu đã kết thúc. Xem kết quả và lịch sử trong hồ sơ.':o.assigned_to?(o.status==='waiting'?'Sale được giao xác nhận nhận tín hiệu trước khi cập nhật chăm sóc.':'Sale phụ trách kiểm tra lịch hẹn, cập nhật diễn biến và kết quả tư vấn.'):'Người được cấp quyền chọn Sale rồi xác nhận phân công.';
    extra=o.next_contact_on?`Lịch liên hệ: ${o.next_contact_on}`:'';href=`/signals?open=${context.id}`;
  } else {
    if(!uuid.test(context.id))throw new Error('Mã đề nghị không hợp lệ.');
    const {data:o,error}=await db.from('fr_requests').select('id,code,title,kind,status,amount,current_step,requester_id').eq('id',context.id).maybeSingle();
    if(error||!o)throw new Error('Không đọc được hồ sơ này trong quyền hiện tại của bạn.');
    title=`${o.code}: ${o.title}`;status=FR_STATUS_LABEL[o.status as FrStatus]||o.status;
    const path=o.kind==='payment'?'payment':o.kind==='advance'?'advance':'salary';href=`/finance/${path}?open=${context.id}`;
    extra=`Số tiền: ${Number(o.amount).toLocaleString('vi-VN')} đ`;
    waiting=name(o.requester_id);next='Mở hồ sơ để xem thao tác được cấp quyền.';
    if(o.status==='pending') {
      const {data:step,error:stepError}=await db.from('fr_steps').select('approver_id,label').eq('request_id',context.id).eq('step_no',o.current_step).maybeSingle();
      waiting=stepError?'Chưa tải được bước duyệt':step?.approver_id?name(step.approver_id):step?.label||'Chưa xác định';
      next='Người duyệt ở bước hiện tại xem chứng từ, rồi phê duyệt, yêu cầu bổ sung hoặc từ chối.';
    } else if(o.status==='draft'||o.status==='info_requested') next='Người tạo kiểm tra, bổ sung hồ sơ rồi gửi duyệt.';
    else if(o.status==='needs_config') {waiting='Quản trị quy trình';next='Cần cấu hình người duyệt trước khi gửi lại.';}
    else if(o.status==='awaiting_payment'||o.status==='approved') {waiting='Người có quyền chi tiền';next='Người có quyền chi kiểm tra và xác nhận khoản chi thực tế.';}
    else if(['done','cancelled','rejected'].includes(o.status)) {waiting='Không còn bước duyệt đang chờ';next='Xem kết quả xử lý và lịch sử trong hồ sơ.';}
    else {waiting='Chưa xác định bước tiếp theo';next='Xem phần chi tiền/quyết toán/khấu trừ trong hồ sơ để biết việc còn lại.';}
  }
  return {title,href,text:`Hồ sơ: ${title}\nTrạng thái: ${status}\nĐang chờ/phụ trách: ${waiting}\n${extra ? extra+'\n' : ''}Việc tiếp theo: ${next}\nĐây là hướng dẫn theo trạng thái; quyền thao tác vẫn do hồ sơ gốc kiểm tra.`};
}
