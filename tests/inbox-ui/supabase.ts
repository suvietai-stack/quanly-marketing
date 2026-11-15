const channel:any={on:()=>channel,subscribe:(fn:any)=>{fn('SUBSCRIBED');return channel;}};export const supabase={channel:()=>channel,removeChannel:async()=>{}};
