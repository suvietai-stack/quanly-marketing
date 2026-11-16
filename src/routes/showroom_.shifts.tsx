import { createFileRoute } from '@tanstack/react-router';
import { ShiftRosterPage } from '@/components/showroom/ShiftRosterPage';

export const Route = createFileRoute('/showroom_/shifts')({
  head:()=>({meta:[{title:'Lịch trực Showroom — Base Sứ Việt'}]}),
  component:ShiftRosterPage,
});
