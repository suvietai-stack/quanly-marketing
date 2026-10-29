import { describe,it,expect } from 'vitest';
import { composeProgression, progressionSuggestions, validProgression } from './progression';
describe('progression rules',()=>{
 it('multiple suggestions and note compose one editable payload',()=>expect(composeProgression(['Đã gửi báo giá','Khách đang cân nhắc'],'  Hẹn thứ Hai  ')).toBe('Đã gửi báo giá\nKhách đang cân nhắc\nHẹn thứ Hai'));
 it('maket only for gift group',()=>{expect(progressionSuggestions(['Sứ quà tặng']).flatMap(g=>g.items).filter(i=>i.includes('maket'))).toHaveLength(5);expect(progressionSuggestions(['Xuất khẩu']).flatMap(g=>g.items).some(i=>i.includes('maket'))).toBe(false);});
 it('acceptance/system/state-only excluded, real notes included',()=>{expect(validProgression({note:null,event_type:'Đã tiếp nhận'})).toBe(false);expect(validProgression({note:null,event_type:null})).toBe(false);expect(validProgression({note:null,event_type:'Khác'})).toBe(false);expect(validProgression({note:'Đã trao đổi',event_type:null})).toBe(true);expect(validProgression({note:null,event_type:'Đã gửi báo giá'})).toBe(true);expect(validProgression({note:'system',event_type:null,is_progression:false})).toBe(false);});
});