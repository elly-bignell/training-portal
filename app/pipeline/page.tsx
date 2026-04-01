'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import PipelineAuth, { usePipelineAuth } from '../components/PipelineAuth';

const CLOSERS = ['Lucas', 'Dylan', 'Felipe', 'Thomas'];
const BOOKERS = ['Cindy', 'Krishna', 'Thomas', 'Riley', 'Sydney', 'Felipe', 'Dylan', 'Lucas'];
const VIEWERS = ['Lucas', 'Dylan', 'Felipe', 'Admin'];

const MS_PLANS  = ['Web Support','SEO Support','Digital Support'];
const Q_PLANS   = ['Bronze','Silver','Gold','Platinum','Diamond'];
const MS_EXTRAS = ['Web Changes','SEO Backlinking','SEO Page Building','Google Ads','O/O Web Changes','O/O Page Building','O/O SEO Overhaul'];
const Q_EXTRAS  = ['LiteHost','Plus36 Hosting','Plus24 Hosting','FlexiHost'];

const STATUS_COLORS: Record<string,{bg:string;text:string;border:string}> = {
  Active: { bg:'#eff6ff', text:'#2563eb', border:'#bfdbfe' },
  Won:    { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  Lost:   { bg:'#fef2f2', text:'#dc2626', border:'#fecaca' },
};

const WEEK_COLORS: Record<string,string> = {
  'Week 1':'#f97316','Week 2':'#a78bfa','Week 3':'#34d399','Week 4+':'#60a5fa',
  'Won':'#16a34a','Lost':'#dc2626',
};

const BUCKET_TARGETS: Record<string,number> = {
  'Week 1':10912,'Week 2':8314,'Week 3':3000,'Week 4':4157,'Week 5+':0,
};
const BUCKET_PCT: Record<string,number> = {
  'Week 1':42,'Week 2':32,'Week 3':10,'Week 4':16,'Week 5+':0,
};
const BUCKET_WK_TARGETS: Record<string,number> = {
  'Week 1':2520,'Week 2':1920,'Week 3':600,'Week 4':960,'Week 5+':0,
};
const PIPE_MIN_WK = 6000;
const PIPE_MIN_MO = 26000;
const DAILY_ADD_TARGET = 1200;

type Status = 'Active'|'Won'|'Lost';
type Brand  = 'MS'|'Quodo'|'Both';
type Bucket = 'Week 1'|'Week 2'|'Week 3'|'Week 4'|'Week 5+';
type ViewMode = Bucket | 'Won' | 'Lost';

interface Deal {
  id:string; BusinessName:string; DateOfMeeting:string; CloseDate:string;
  CloseTime?:string; Closer:string; Booker:string; MonthlyValue:number;
  WeeklyValue:number; UpfrontValue?:number; GTH:string; NextContactDate?:string;
  Brand:Brand; Plan?:string; Extras?:string; WeekBucket:Bucket;
  Status:Status; LoggedBy:string; Notes?:string; CloseDateHistory?:string;
  DateAddedToPipe?:string; FirstCloseDate?:string; WonLostDate?:string; MovesInPipe?:number;
  LostReason?:string; LostNote?:string;
}

function getWeekBucket(closeDate:string):Bucket {
  const today=new Date(); today.setHours(0,0,0,0);
  const mon=new Date(today); mon.setDate(today.getDate()-((today.getDay()+6)%7));
  const close=new Date(closeDate); close.setHours(0,0,0,0);
  const diff=Math.floor((close.getTime()-mon.getTime())/86400000);
  if(diff<7)return 'Week 1'; if(diff<14)return 'Week 2';
  if(diff<21)return 'Week 3'; if(diff<28)return 'Week 4'; return 'Week 5+';
}

function getWeekDateRange(bucket: Bucket): string {
  const today = new Date(); today.setHours(0,0,0,0);
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const offsets: Record<Bucket, number> = { 'Week 1': 0, 'Week 2': 7, 'Week 3': 14, 'Week 4': 21, 'Week 5+': 28 };
  const start = new Date(mon); start.setDate(mon.getDate() + offsets[bucket]);
  const end = new Date(start); end.setDate(start.getDate() + 4);
  const fmt = (d: Date) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  if (bucket === 'Week 5+') return `From ${fmt(start)}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

// Returns the Monday of the current week
function currentMonday(): Date {
  const today = new Date(); today.setHours(0,0,0,0);
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return mon;
}

// True if closeDate falls before the current Monday (i.e. a previous week)
function isPastWeek(closeDate: string): boolean {
  if (!closeDate) return false;
  const close = new Date(closeDate + 'T00:00:00');
  return close < currentMonday();
}

// Returns array of historical week ranges (most recent first, up to 8 weeks back)
function getHistoricalWeeks(): Array<{label:string; start:Date; end:Date; weekOffset:number}> {
  const mon = currentMonday();
  const weeks = [];
  for (let i = 1; i <= 8; i++) {
    const start = new Date(mon); start.setDate(mon.getDate() - i * 7);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    const fmtShort = (d:Date) => d.toLocaleDateString('en-AU', { day:'numeric', month:'short' });
    weeks.push({ label: `${fmtShort(start)} – ${fmtShort(end)}`, start, end, weekOffset: i });
  }
  return weeks;
}

// Given a deal's CloseDate, find which historical week it belongs to (returns weekOffset or null)
function getHistoricalWeekOffset(closeDate:string): number|null {
  const close = new Date(closeDate + 'T00:00:00');
  const mon = currentMonday();
  const diffDays = Math.floor((mon.getTime() - close.getTime()) / 86400000);
  if (diffDays <= 0) return null; // current week or future
  const weekOffset = Math.ceil(diffDays / 7);
  if (weekOffset > 8) return null;
  return weekOffset;
}

function groupDealsByDay(deals: Deal[]): Array<{ dateStr: string; label: string; deals: Deal[]; overdue: boolean }> {
  const map = new Map<string, Deal[]>();
  deals.forEach(d => {
    const key = d.CloseDate || 'tbc';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d);
  });
  const mon = currentMonday();
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, dayDeals]) => {
      const isOverdue = dateStr !== 'tbc' && new Date(dateStr + 'T00:00:00') < mon;
      return {
        dateStr,
        overdue: isOverdue,
        label: dateStr === 'tbc'
          ? 'No close date set'
          : new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }),
        deals: [...dayDeals].sort((a, b) => (a.CloseTime || '99:99').localeCompare(b.CloseTime || '99:99')),
      };
    })
    .sort((a, b) => {
      // Overdue days always first
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return 1;
      return a.dateStr.localeCompare(b.dateStr);
    });
}

function fmt$(n:number){return '$'+n.toLocaleString(undefined,{maximumFractionDigits:0});}
function todayStr(){return new Date().toLocaleDateString('en-CA',{timeZone:'Australia/Adelaide'});}

function Field({label,children,required}:{label:string;children:React.ReactNode;required?:boolean}){
  return(
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}{required&&<span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-semibold outline-none focus:border-orange-400 bg-white w-full";
const selectCls="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-semibold outline-none focus:border-orange-400 bg-white w-full";

function DealCard({deal,onStatusChange,onReschedule,onGTHToggle,canEdit,overdue}:{
  deal:Deal;
  onStatusChange:(id:string,s:Status,extra?:Record<string,unknown>)=>void;
  onReschedule:(id:string,newDate:string,history:string)=>void;
  onGTHToggle:(id:string,newGTH:string)=>void;
  canEdit:boolean;
  overdue?:boolean;
}){
  const sc=STATUS_COLORS[deal.Status]||STATUS_COLORS.Active;
  const borderColor = overdue ? '#fca5a5' : sc.border;
  const [changing,setChanging]=useState(false);
  const [showReschedule,setShowReschedule]=useState(false);
  const [newCloseDate,setNewCloseDate]=useState('');
  const [rescheduling,setRescheduling]=useState(false);
  const [showLostModal,setShowLostModal]=useState(false);
  const [lostReasons,setLostReasons]=useState<string[]>([]);
  const [lostNote,setLostNote]=useState('');
  const [submittingLost,setSubmittingLost]=useState(false);

  const LOST_REASONS=['Too expensive','Gone MIA','Competitor','Not DM / no sign off','Wrong timing','Other'];

  function toggleLostReason(r:string){
    setLostReasons(prev=>prev.includes(r)?prev.filter(x=>x!==r):prev.length<3?[...prev,r]:prev);
  }

  const onlyOther=lostReasons.length===1&&lostReasons[0]==='Other';
  const lostCommentRequired=onlyOther;
  const lostCanSubmit=lostReasons.length>0&&(!lostCommentRequired||lostNote.trim().length>0);

  async function submitLost(){
    if(!lostCanSubmit) return;
    setSubmittingLost(true);
    await onStatusChange(deal.id,'Lost',{LostReason:lostReasons.join(', '),LostNote:lostNote.trim()||undefined});
    setShowLostModal(false);setLostReasons([]);setLostNote('');setSubmittingLost(false);
  }

  async function handleStatus(s:Status,extra?:Record<string,unknown>){
    setChanging(true); await onStatusChange(deal.id,s,extra); setChanging(false);
  }

  async function handleReschedule(){
    if(!newCloseDate) return;
    setRescheduling(true);
    const prevHistory = deal.CloseDateHistory || '';
    const historyEntry = `${deal.CloseDate} → ${newCloseDate}`;
    const newHistory = prevHistory ? `${prevHistory} | ${historyEntry}` : historyEntry;
    await onReschedule(deal.id, newCloseDate, newHistory);
    setNewCloseDate('');
    setShowReschedule(false);
    setRescheduling(false);
  }

  const historyDates = deal.CloseDateHistory ? deal.CloseDateHistory.split(' | ') : [];

  return(
    <div className="bg-white rounded-xl border-2 px-4 py-2.5 flex flex-col gap-1.5 shadow-sm" style={{borderColor}}>
      {/* Overdue banner */}
      {overdue && (
        <div className="flex items-center gap-1.5 bg-red-50 rounded-lg px-2 py-1 -mx-1">
          <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">⚠ OVERDUE — Mark Won, Lost, or move date</span>
        </div>
      )}
      {/* Header row — name + badges + values all inline */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="font-black text-gray-900 text-sm leading-tight truncate">{deal.BusinessName}</div>
          <div className="text-[10px] text-gray-400">{deal.Brand}{deal.Plan?` · ${deal.Plan}`:''}</div>
        </div>
        {/* Value pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex flex-col items-center bg-gray-50 rounded-lg px-2 py-1 min-w-[56px]">
            <span className="text-[8px] text-gray-400 font-semibold uppercase leading-none">Monthly</span>
            <span className="text-xs font-black text-gray-800 leading-snug">{fmt$(deal.MonthlyValue)}</span>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-lg px-2 py-1 min-w-[48px]">
            <span className="text-[8px] text-gray-400 font-semibold uppercase leading-none">Weekly</span>
            <span className="text-xs font-black text-gray-800 leading-snug">{fmt$(deal.WeeklyValue)}</span>
          </div>
          {deal.UpfrontValue&&(
            <div className="flex flex-col items-center bg-gray-50 rounded-lg px-2 py-1 min-w-[48px]">
              <span className="text-[8px] text-gray-400 font-semibold uppercase leading-none">Upfront</span>
              <span className="text-xs font-black text-gray-800 leading-snug">{fmt$(deal.UpfrontValue)}</span>
            </div>
          )}
        </div>
        {/* Status + GTH badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="px-1.5 py-0.5 rounded-full text-[9px] font-black border"
            style={{background:sc.bg,color:sc.text,borderColor:sc.border}}>{deal.Status}</div>
          <button
            onClick={()=>onGTHToggle(deal.id, deal.GTH==='GTH'?'Non GTH':'GTH')}
            title="Click to toggle GTH status"
            className={`px-1.5 py-0.5 rounded-full text-[9px] font-black border transition-all hover:opacity-80 ${deal.GTH==='GTH'?'bg-orange-50 text-orange-600 border-orange-200':'bg-gray-50 text-gray-400 border-gray-200'}`}>
            {deal.GTH==='GTH'?'GTH':'Non GTH'}
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
        {deal.CloseTime&&<span>🕐 {deal.CloseTime}</span>}
        <span>👤 {deal.Closer}</span>
        <span>📞 {deal.Booker}</span>
        {deal.Extras&&<span><strong className="text-gray-500">+</strong> {deal.Extras}</span>}
        {deal.NextContactDate&&<span>📆 {deal.NextContactDate}</span>}
        {deal.Notes&&<span className="italic">{deal.Notes}</span>}
      </div>

      {/* Close date history — collapsed */}
      {historyDates.length > 0 && (
        <div className="text-[9px] text-amber-600 font-semibold">
          📆 Moved {historyDates.length}x: {historyDates[historyDates.length-1]}
        </div>
      )}
      {deal.Notes&&<div className="text-[10px] text-gray-400 italic">{deal.Notes}</div>}

      {/* Reschedule + Status — inline */}
      {canEdit && (
        <div className="flex items-center gap-2 border-t border-gray-100 pt-1.5">
          {!showReschedule ? (
            <>
              <button onClick={()=>setShowReschedule(true)}
                className="text-[9px] font-bold text-gray-400 hover:text-orange-500 transition-colors whitespace-nowrap">
                📅 Move date
              </button>
              <div className="flex-1"/>
              {(['Active','Won','Lost'] as Status[]).map(s=>(
                <button key={s} onClick={()=>handleStatus(s)} disabled={changing||deal.Status===s}
                  className="rounded-lg px-2.5 py-1 text-[9px] font-black border transition-all"
                  style={{background:deal.Status===s?STATUS_COLORS[s].bg:'#f9fafb',color:deal.Status===s?STATUS_COLORS[s].text:'#9ca3af',borderColor:deal.Status===s?STATUS_COLORS[s].border:'#e5e7eb'}}>
                  {s==='Active'?'Active':s==='Won'?'🏆 Won':'✕ Lost'}
                </button>
              ))}
            </>
          ) : (
            <div className="flex gap-2 items-center w-full">
              <input type="date" value={newCloseDate} onChange={e=>setNewCloseDate(e.target.value)}
                className="flex-1 border-2 border-orange-300 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none"/>
              {newCloseDate && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                  style={{color:WEEK_COLORS[getWeekBucket(newCloseDate)],background:WEEK_COLORS[getWeekBucket(newCloseDate)]+'20'}}>
                  {getWeekBucket(newCloseDate)}
                </span>
              )}
              <button onClick={handleReschedule} disabled={rescheduling||!newCloseDate}
                className="text-[9px] font-black text-white px-2 py-1 rounded-lg transition-all"
                style={{background:rescheduling||!newCloseDate?'#d1d5db':'#f97316'}}>
                {rescheduling?'…':'Save'}
              </button>
              <button onClick={()=>{setShowReschedule(false);setNewCloseDate('');}}
                className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BucketVisual({bucket,deals,targetValue}:{bucket:Bucket;deals:Deal[];targetValue:number}){
  const active=deals.filter(d=>d.Status==='Active');
  const won=deals.filter(d=>d.Status==='Won');
  const totalM=active.reduce((a,d)=>a+d.MonthlyValue,0);
  const wonM=won.reduce((a,d)=>a+d.MonthlyValue,0);
  const fillPct=targetValue>0?Math.min((totalM/targetValue)*100,100):0;
  const displayPct=targetValue>0?Math.round((totalM/targetValue)*100):0;
  const color=WEEK_COLORS[bucket];
  const clipId=`clip-${bucket.replace(/\s+/g,'-').replace('+','plus')}`;
  return(
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="relative w-full" style={{maxWidth:110}}>
        <svg viewBox="0 0 120 140" className="w-full">
          <defs>
            <clipPath id={clipId}>
              <path d="M 15 30 L 5 130 L 115 130 L 105 30 Z"/>
            </clipPath>
          </defs>
          <path d="M 15 30 L 5 130 L 115 130 L 105 30 Z" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
          {fillPct>0&&(
            <rect x="0" y={130-(100*fillPct/100)} width="120" height={100*fillPct/100}
              fill={color} opacity="0.75" clipPath={`url(#${clipId})`}/>
          )}
          <rect x="10" y="25" width="100" height="10" rx="5" fill="#d1d5db"/>
          <path d="M 35 25 Q 60 5 85 25" fill="none" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round"/>
          <text x="60" y="95" textAnchor="middle" fontSize="20" fontWeight="900"
            fill={fillPct>45?'#fff':color}>{displayPct}%</text>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-xs font-black text-gray-700">{fmt$(totalM)}</div>
        <div className="text-[10px] text-gray-400">of {fmt$(targetValue)} <span className="text-gray-300">·</span> {fmt$(Math.round(targetValue/4.33/100)*100)}/wk</div>
        {wonM>0&&<div className="text-[10px] text-emerald-600 font-semibold">🏆 {fmt$(wonM)} won</div>}
      </div>
    </div>
  );
}

export default function PipelinePage(){
  const { authedUser, logout } = usePipelineAuth();
  const [tab,setTab]=useState<'pipeline'|'log'|'history'>('pipeline');
  const [viewMode,setViewMode]=useState<ViewMode>('Week 1');
  const [deals,setDeals]=useState<Deal[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [success,setSuccess]=useState(false);
  const [formErrors,setFormErrors]=useState<string[]>([]);
  const err=(f:string)=>formErrors.includes(f);

  const [fDate,setFDate]=useState(todayStr());
  const [fCloseDate,setFCloseDate]=useState('');
  const [fCloseTime,setFCloseTime]=useState('');
  const [fBusiness,setFBusiness]=useState('');
  const [fCloser,setFCloser]=useState('');
  const [fBooker,setFBooker]=useState('');
  const [fMonthly,setFMonthly]=useState('');
  const [fWeekly,setFWeekly]=useState('');
  const calcWeekly=(m:string)=>m?String(Math.round((Number(m)*12)/52*1.1*100)/100):'';
  const [fUpfront,setFUpfront]=useState('');
  const [fGTH,setFGTH]=useState('');
  const [fNextContact,setFNextContact]=useState('');
  const [fBrand,setFBrand]=useState<Brand|''>('');
  const [fPlan,setFPlan]=useState('');
  const [fPlanQuodo,setFPlanQuodo]=useState('');
  const [fExtras,setFExtras]=useState<string[]>([]);
  const [fNotes,setFNotes]=useState('');

  const canLog=true;
  const canView=true;

  const planOptions=useMemo(()=>{
    if(fBrand==='MS')return MS_PLANS;
    if(fBrand==='Quodo')return Q_PLANS;
    if(fBrand==='Both')return[...MS_PLANS,...Q_PLANS];
    return[];
  },[fBrand]);

  const extraOptions=useMemo(()=>{
    if(fBrand==='MS')return MS_EXTRAS;
    if(fBrand==='Quodo')return Q_EXTRAS;
    if(fBrand==='Both')return[...MS_EXTRAS,...Q_EXTRAS];
    return[];
  },[fBrand]);

  const fetchDeals=useCallback(async()=>{
    setLoading(true);
    try{const res=await fetch('/api/pipeline/deals');if(res.ok)setDeals(await res.json());}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetchDeals();},[fetchDeals]);
  useEffect(()=>{setFPlan('');setFPlanQuodo('');setFExtras([]);},[fBrand]);

  async function handleStatusChange(id:string,status:Status,extra?:Record<string,unknown>){
    const fields:Record<string,unknown>={Status:status,...(extra||{})};
    if(status==='Won'||status==='Lost') fields.WonLostDate=todayStr();
    const res=await fetch(`/api/pipeline/deals/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});
    if(res.ok){const u=await res.json();setDeals(prev=>prev.map(d=>d.id===id?{...d,...u}:d));}
  }

  async function handleReschedule(id:string,newDate:string,history:string){
    const newBucket=getWeekBucket(newDate);
    const movesCount=history.split(' | ').length;
    const res=await fetch(`/api/pipeline/deals/${id}`,{
      method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({CloseDate:newDate,WeekBucket:newBucket,CloseDateHistory:history,MovesInPipe:movesCount}),
    });
    if(res.ok){const u=await res.json();setDeals(prev=>prev.map(d=>d.id===id?{...d,...u}:d));}
  }

  async function handleGTHToggle(id:string,newGTH:string){
    const res=await fetch(`/api/pipeline/deals/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({GTH:newGTH})});
    if(res.ok){const u=await res.json();setDeals(prev=>prev.map(d=>d.id===id?{...d,...u}:d));}
  }

  async function submitDeal(){
    const errors:string[]=[];
    if(!fBusiness) errors.push('Business Name');
    if(!fCloseDate) errors.push('Close Date');
    if(!fCloser) errors.push('Closer');
    if(!fBooker) errors.push('Booker');
    if(!fMonthly) errors.push('Monthly $');
    if(!fGTH) errors.push('GTH Status');
    if(!fBrand) errors.push('Brand');
    if(fBrand&&fBrand!=='Both'&&!fPlan) errors.push('Membership / Plan');
    if(fBrand==='Both'&&!fPlan&&!fPlanQuodo) errors.push('Membership / Plan (at least one)');
    if(errors.length>0){setFormErrors(errors);return;}
    setFormErrors([]);
    setSaving(true);
    try{
      const bucket=getWeekBucket(fCloseDate);
      const body:Record<string,unknown>={
        BusinessName:fBusiness,DateOfMeeting:fDate,CloseDate:fCloseDate,
        ...(fCloseTime?{CloseTime:fCloseTime}:{}),
        Closer:fCloser,Booker:fBooker,
        MonthlyValue:Number(fMonthly),WeeklyValue:Number(calcWeekly(fMonthly)),
        ...(fUpfront?{UpfrontValue:Number(fUpfront)}:{}),
        GTH:fGTH,...(fNextContact?{NextContactDate:fNextContact}:{}),
        Brand:fBrand,...(fBrand==='Both'?(fPlan||fPlanQuodo?{Plan:[fPlan,fPlanQuodo].filter(Boolean).join(' / ')}:{}):(fPlan?{Plan:fPlan}:{})),
        ...(fExtras.length?{Extras:fExtras.join(', ')}:{}),
        ...(fNotes?{Notes:fNotes}:{}),
        WeekBucket:bucket,Status:'Active',LoggedBy:'Admin',
        DateAddedToPipe:todayStr(),FirstCloseDate:fCloseDate,
      };
      const res=await fetch('/api/pipeline/deals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(res.ok){
        await fetchDeals();
        setSuccess(true);setTimeout(()=>setSuccess(false),3000);
        const closedBucket=getWeekBucket(fCloseDate);
        setFBusiness('');setFCloseDate('');setFCloseTime('');setFCloser('');
        setFBooker('');setFMonthly('');setFWeekly('');setFUpfront('');
        setFGTH('');setFNextContact('');setFBrand('');setFPlan('');setFPlanQuodo('');setFormErrors([]);
        setFExtras([]);setFNotes('');setFDate(todayStr());
        setTab('pipeline');setViewMode(closedBucket);
      }
    }finally{setSaving(false);}
  }

  const dealsByBucket=useMemo(()=>{
    const map:Record<Bucket,Deal[]>={'Week 1':[],'Week 2':[],'Week 3':[],'Week 4':[],'Week 5+':[]};
    deals.forEach(d=>{
      // Exclude Won/Lost from previous weeks — they belong in history tab only
      if(d.Status !== 'Active' && isPastWeek(d.CloseDate)) return;
      const bucket = d.CloseDate ? getWeekBucket(d.CloseDate) : d.WeekBucket;
      if(map[bucket]) map[bucket].push(d);
    });
    return map;
  },[deals]);

  const totalByBucket=useMemo(()=>{
    const map:Record<Bucket,number>={'Week 1':0,'Week 2':0,'Week 3':0,'Week 4':0,'Week 5+':0};
    deals.filter(d=>d.Status==='Active').forEach(d=>{
      const bucket = d.CloseDate ? getWeekBucket(d.CloseDate) : d.WeekBucket;
      map[bucket]+=d.MonthlyValue;
    });
    return map;
  },[deals]);

  const yesterdayStats=useMemo(()=>{
    const today=new Date();
    const dow=today.getDay(); // 0=Sun,1=Mon,...,6=Sat
    const daysBack=dow===1?3:dow===0?2:1; // Mon→Fri(3), Sun→Fri(2), else→1
    const yd=new Date(); yd.setDate(yd.getDate()-daysBack);
    const ydStr=yd.toLocaleDateString('en-CA',{timeZone:'Australia/Adelaide'});
    const dayLabel=daysBack===3?'Friday':daysBack===2?'Friday':'Yesterday';
    const ydDeals=deals.filter(d=>d.DateAddedToPipe===ydStr);
    const ydMo=ydDeals.reduce((s,d)=>s+d.MonthlyValue,0);
    const ydWk=Math.round(ydMo/4.33);
    const ydWonDeals=deals.filter(d=>d.WonLostDate===ydStr&&d.Status==='Won');
    const ydLostDeals=deals.filter(d=>d.WonLostDate===ydStr&&d.Status==='Lost');
    const ydWonWk=Math.round(ydWonDeals.reduce((s,d)=>s+d.MonthlyValue,0)/4.33);
    const ydLostWk=Math.round(ydLostDeals.reduce((s,d)=>s+d.MonthlyValue,0)/4.33);
    return {ydWk,count:ydDeals.length,dayLabel,ydWonWk,ydLostWk};
  },[deals]);

  const dealsForView=useMemo(()=>{
    if(viewMode==='Won') return deals.filter(d=>d.Status==='Won' && !isPastWeek(d.CloseDate));
    if(viewMode==='Lost') return deals.filter(d=>d.Status==='Lost' && !isPastWeek(d.CloseDate));
    // For week buckets: exclude Won/Lost from previous weeks (they live in history tab)
    // Active overdue deals stay — sorted to top of Week 1
    const bucketDeals = (dealsByBucket[viewMode]||[]).filter(d => {
      if(d.Status !== 'Active' && isPastWeek(d.CloseDate)) return false;
      return true;
    });
    if(viewMode === 'Week 1') {
      const overdue = bucketDeals.filter(d => d.Status === 'Active' && isPastWeek(d.CloseDate));
      const current = bucketDeals.filter(d => !isPastWeek(d.CloseDate) || d.Status !== 'Active');
      // Sort overdue by closeDate ascending, current by closeDate ascending
      overdue.sort((a,b) => a.CloseDate.localeCompare(b.CloseDate));
      return [...overdue, ...current];
    }
    return bucketDeals;
  },[viewMode,deals,dealsByBucket]);

  const wonDeals=useMemo(()=>deals.filter(d=>d.Status==='Won' && !isPastWeek(d.CloseDate)),[deals]);
  const lostDeals=useMemo(()=>deals.filter(d=>d.Status==='Lost' && !isPastWeek(d.CloseDate)),[deals]);

  // Per-bucket won/lost stats — current week only, using live CloseDate
  const bucketStats=useMemo(()=>{
    const s:Record<Bucket,{wonVal:number;wonCount:number;lostVal:number;lostCount:number;activeVal:number;activeCount:number}> = {
      'Week 1':{wonVal:0,wonCount:0,lostVal:0,lostCount:0,activeVal:0,activeCount:0},
      'Week 2':{wonVal:0,wonCount:0,lostVal:0,lostCount:0,activeVal:0,activeCount:0},
      'Week 3':{wonVal:0,wonCount:0,lostVal:0,lostCount:0,activeVal:0,activeCount:0},
      'Week 4':{wonVal:0,wonCount:0,lostVal:0,lostCount:0,activeVal:0,activeCount:0},
      'Week 5+':{wonVal:0,wonCount:0,lostVal:0,lostCount:0,activeVal:0,activeCount:0},
    };
    deals.forEach(d=>{
      // Only count deals whose close date is in the current or future week
      if(isPastWeek(d.CloseDate)) return;
      const bucket = d.CloseDate ? getWeekBucket(d.CloseDate) : d.WeekBucket;
      if(!s[bucket]) return;
      if(d.Status==='Won'){s[bucket].wonVal+=d.MonthlyValue;s[bucket].wonCount++;}
      else if(d.Status==='Lost'){s[bucket].lostVal+=d.MonthlyValue;s[bucket].lostCount++;}
      else{s[bucket].activeVal+=d.MonthlyValue;s[bucket].activeCount++;}
    });
    return s;
  },[deals]);

  // Historical weeks data
  const historicalWeeks=useMemo(()=>getHistoricalWeeks(),[]);
  const historicalData=useMemo(()=>{
    return historicalWeeks.map(wk=>{
      // Deals whose CURRENT close date falls in this historical week
      const wkDeals=deals.filter(d=>{
        const offset=getHistoricalWeekOffset(d.CloseDate);
        return offset===wk.weekOffset;
      });
      const wonVal=wkDeals.filter(d=>d.Status==='Won').reduce((a,d)=>a+d.MonthlyValue,0);
      const wonCount=wkDeals.filter(d=>d.Status==='Won').length;
      const lostVal=wkDeals.filter(d=>d.Status==='Lost').reduce((a,d)=>a+d.MonthlyValue,0);
      const lostCount=wkDeals.filter(d=>d.Status==='Lost').length;
      const activeVal=wkDeals.filter(d=>d.Status==='Active').reduce((a,d)=>a+d.MonthlyValue,0);
      const activeCount=wkDeals.filter(d=>d.Status==='Active').length;

      // Deals MOVED FROM this week — find via CloseDateHistory
      // A deal was "moved from" this week if any history entry's FROM date falls in this week's range
      const movedDeals=deals.filter(d=>{
        if(!d.CloseDateHistory) return false;
        return d.CloseDateHistory.split(' | ').some(entry=>{
          const fromDate=entry.split(' → ')[0]?.trim();
          if(!fromDate) return false;
          const from=new Date(fromDate+'T00:00:00');
          return from>=wk.start && from<=wk.end;
        });
      });

      // Group moved deals by which future bucket they landed in
      const movedToBuckets:Record<string,{count:number;val:number}> = {
        'Week 1':{count:0,val:0},'Week 2':{count:0,val:0},
        'Week 3':{count:0,val:0},'Week 4':{count:0,val:0},'Week 5+':{count:0,val:0},
      };
      movedDeals.forEach(d=>{
        const dest=d.CloseDate?getWeekBucket(d.CloseDate):d.WeekBucket;
        if(movedToBuckets[dest]){
          movedToBuckets[dest].count++;
          movedToBuckets[dest].val+=d.MonthlyValue;
        }
      });
      const movedVal=movedDeals.reduce((a,d)=>a+d.MonthlyValue,0);
      const movedCount=movedDeals.length;

      const totalVal=wonVal+lostVal+activeVal+movedVal;
      const closedVal=wonVal+lostVal;
      const resolvedVal=wonVal+lostVal+movedVal;
      const winRate=resolvedVal>0?Math.round((wonVal/resolvedVal)*100):null;
      return {...wk,wkDeals,totalVal,wonVal,wonCount,lostVal,lostCount,activeVal,activeCount,winRate,movedDeals,movedVal,movedCount,movedToBuckets};
    }).filter(wk=>wk.wkDeals.length>0||wk.movedCount>0);
  },[deals,historicalWeeks]);

  const isBucket=(vm:ViewMode):vm is Bucket=>['Week 1','Week 2','Week 3','Week 4','Week 5+'].includes(vm);
  const [expandedWeeks,setExpandedWeeks]=useState<Set<number>>(new Set([1]));
  function toggleWeek(offset:number){setExpandedWeeks(prev=>{const n=new Set(prev);n.has(offset)?n.delete(offset):n.add(offset);return n;});}
  const viewColor=WEEK_COLORS[viewMode]||'#f97316';



  return(
    <PipelineAuth>
    <div className="min-h-screen" style={{background:'#f4f6f9'}}>
      {/* Top nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Marketing Sweet</div>
            <h1 className="text-xl font-black text-gray-900">Pipeline</h1>
          </div>
          <div className="flex items-center gap-3">
            {authedUser && <span className="text-xs text-gray-500 font-semibold">{authedUser}</span>}
            <button onClick={fetchDeals} className="text-xs text-gray-400 hover:text-orange-500 transition-colors font-bold">↻ Refresh</button>
            <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 transition-colors font-semibold">Sign out</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {([{key:'pipeline',label:'📊 Pipeline View'},{key:'log',label:'✏️ Log a Deal'},{key:'history',label:'📅 Previous Weeks'}]).map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key as 'pipeline'|'log'|'history')}
              className="px-4 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{borderColor:tab===t.key?'#f97316':'transparent',color:tab===t.key?'#f97316':'#6b7280'}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* ── PIPELINE VIEW ── */}
        {tab==='pipeline'&&(
          <div className="flex flex-col gap-6">

            {/* Exec Summary */}
            {(()=>{
              const totalMo=Object.values(totalByBucket).reduce((s,v)=>s+v,0);
              const totalWk=Math.round(totalMo/4.33);
              const totalMoRounded=Math.round(totalMo/100)*100;
              const diffWk=totalWk-PIPE_MIN_WK;
              const diffMo=Math.round(totalMo-PIPE_MIN_MO);
              const ydDiff=yesterdayStats.ydWk-DAILY_ADD_TARGET;
              const aheadTotal=diffWk>=0;
              const aheadYd=ydDiff>=0;
              return(
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Pipeline Health</div>
                <div className="flex flex-col gap-2.5 text-sm text-gray-700 mb-5">
                  <div>🔥 Our pipeline should sit at minimum <span className="font-black text-gray-900">$6,000/wk ($26,000/mo)</span> at all times.</div>
                  <div>🔥 We currently have <span className="font-black text-gray-900">${totalWk.toLocaleString()}/wk (${totalMoRounded.toLocaleString()}/mo)</span> — we are <span className={`font-black ${aheadTotal?'text-emerald-600':'text-red-600'}`}>${Math.abs(diffWk).toLocaleString()}/wk {aheadTotal?'ahead 🟢':'behind 🔴'} (${Math.abs(diffMo).toLocaleString()}/mo)</span></div>
                  <div>➕ We need to be adding <span className="font-black text-gray-900">$1,200/day</span> to the pipe every day to maintain $6K</div>
                  <div>📅 {yesterdayStats.dayLabel} we added <span className="font-black text-gray-900">${yesterdayStats.ydWk.toLocaleString()}</span>{yesterdayStats.ydWk===0?' (no deals logged)':' — '}{yesterdayStats.ydWk>0&&<span className={`font-black ${aheadYd?'text-emerald-600':'text-red-600'}`}>{aheadYd?'ahead':'behind'} by ${Math.abs(ydDiff).toLocaleString()} {aheadYd?'🟢':'🔴'}</span>}</div>
                  <div>🏆 {yesterdayStats.dayLabel} we won <span className="font-black text-gray-900">${yesterdayStats.ydWonWk.toLocaleString()}/wk</span> from the pipe — <span className={`font-black ${yesterdayStats.ydWonWk>=600?'text-emerald-600':'text-red-600'}`}>{yesterdayStats.ydWonWk>=600?'ahead':'behind'} by ${Math.abs(yesterdayStats.ydWonWk-600).toLocaleString()} {yesterdayStats.ydWonWk>=600?'🟢':'🔴'}</span></div>
                  <div>❌ {yesterdayStats.dayLabel} we lost <span className="font-black text-gray-900">${yesterdayStats.ydLostWk.toLocaleString()}/wk</span> from the pipe — <span className={`font-black ${yesterdayStats.ydLostWk<=600?'text-emerald-600':'text-red-600'}`}>{yesterdayStats.ydLostWk<=600?'within target':'over target'} by ${Math.abs(yesterdayStats.ydLostWk-600).toLocaleString()} {yesterdayStats.ydLostWk<=600?'🟢':'🔴'}</span></div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Bucket Breakdown</div>
                  <div className="grid grid-cols-5 gap-3">
                    {(()=>{
                      // Day index: Mon=0 Tue=1 Wed=2 Thu=3 Fri=4 (cap at 4)
                      const dow=new Date().getDay();
                      const dayIdx=dow===0?4:dow===6?4:Math.min(dow-1,4);
                      const DAY_NAMES=['Monday','Tuesday','Wednesday','Thursday','Friday'];
                      const dayName=DAY_NAMES[dayIdx];
                      // Daily flow model — net movement between buckets each day:
                      // W1: -$504/day (deals resolve)
                      // W2: +$504 in from W1, -$380 out to W3 = net +$124/day
                      // W3: +$380 in from W2, -$120 out to W4 = net +$260/day
                      // W4+: +$120 in from W3, -$200 out to future = net -$80/day
                      const todayExpected:Record<string,number>={
                        'Week 1':Math.max(0,2520-dayIdx*504),
                        'Week 2':Math.max(0,1920+dayIdx*124),
                        'Week 3':Math.max(0,600+dayIdx*260),
                        'Week 4':Math.max(0,960-dayIdx*80),
                        'Week 5+':dayIdx*200,
                      };
                      return(['Week 1','Week 2','Week 3','Week 4','Week 5+'] as Bucket[]).map(b=>{
                      const wkVal=Math.round(totalByBucket[b]/4.33);
                      const wkTarget=BUCKET_WK_TARGETS[b];
                      const diff=wkVal-wkTarget;
                      const ahead=diff>=0;
                      const pct=wkTarget>0?Math.round((wkVal/wkTarget)*100):0;
                      const todayExp=todayExpected[b];
                      const todayDiff=wkVal-todayExp;
                      const todayAhead=todayDiff>=0;
                      return(
                      <div key={b} className="rounded-xl p-3 border" style={{borderColor:WEEK_COLORS[b]+'50',background:WEEK_COLORS[b]+'08'}}>
                        <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{color:WEEK_COLORS[b]}}>{b}</div>
                        <div className="text-base font-black text-gray-900">${wkVal.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/wk</span></div>
                        <div className="text-[10px] text-gray-400 mb-1.5">Target: ${wkTarget.toLocaleString()}/wk ({BUCKET_PCT[b]}%)</div>
                        <div className="w-full h-1 rounded-full bg-gray-100 mb-1.5">
                          <div className="h-1 rounded-full transition-all" style={{width:`${Math.min(pct,100)}%`,background:WEEK_COLORS[b]}}/>
                        </div>
                        <div className={`text-[10px] font-bold ${ahead?'text-emerald-600':'text-red-600'}`}>
                          {ahead?'▲':'▼'} ${Math.abs(diff).toLocaleString()} vs week target
                        </div>
                        <div className="mt-1 pt-1 border-t border-gray-100">
                          <div className="text-[9px] text-gray-400 mb-0.5">{dayName} expected: ${todayExp.toLocaleString()}</div>
                          <div className={`text-[10px] font-bold ${todayAhead?'text-emerald-600':'text-red-600'}`}>
                            {todayAhead?'▲':'▼'} ${Math.abs(todayDiff).toLocaleString()} vs today
                          </div>
                        </div>
                      </div>
                      );
                    });})()}
                  </div>
                </div>
              </div>
              );
            })()}

            {/* Bucket overview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="text-xs font-black uppercase tracking-widest text-gray-500">Pipeline Overview</div>
                <button onClick={fetchDeals} className="text-xs text-orange-500 font-bold hover:text-orange-600">↻ Refresh</button>
              </div>
              {/* Week buckets */}
              <div className="grid grid-cols-5 gap-6">
                {(['Week 1','Week 2','Week 3','Week 4','Week 5+'] as Bucket[]).map(b=>{
                  const bs=bucketStats[b];
                  const closedVal=bs.wonVal+bs.lostVal;
                  const winRate=closedVal>0?Math.round((bs.wonVal/closedVal)*100):null;
                  return(
                  <button key={b} onClick={()=>setViewMode(b)} className="flex flex-col gap-2 transition-all"
                    style={{opacity:viewMode===b?1:0.6}}>
                    <div className="text-center text-[10px] font-bold text-gray-400 tracking-wider mb-0.5">Target: {BUCKET_PCT[b]}%</div>
    <BucketVisual bucket={b} deals={dealsByBucket[b]} targetValue={BUCKET_TARGETS[b]}/>
                    <div className="text-center">
                      <div className="text-xs font-black" style={{color:WEEK_COLORS[b]}}>{b}</div>
                      <div className="text-[10px] font-semibold text-gray-500">{getWeekDateRange(b)}</div>
                      <div className="text-[10px] text-gray-400">{dealsByBucket[b].length} deals</div>
                    </div>
                    {/* Won / Lost mini stats */}
                    <div className="w-full flex flex-col gap-1 px-1">
                      {bs.wonCount>0&&(
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-emerald-600 font-bold">🏆 {bs.wonCount} won</span>
                          <span className="font-black text-emerald-700">{fmt$(bs.wonVal)}</span>
                        </div>
                      )}
                      {bs.lostCount>0&&(
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-red-500 font-bold">✕ {bs.lostCount} lost</span>
                          <span className="font-black text-red-600">{fmt$(bs.lostVal)}</span>
                        </div>
                      )}
                      {winRate!==null&&(
                        <div className="flex items-center justify-between text-[9px] border-t border-gray-100 pt-1 mt-0.5">
                          <span className="text-gray-400 font-semibold">Win rate</span>
                          <span className={`font-black ${winRate>=50?'text-emerald-600':'text-red-500'}`}>{winRate}%</span>
                        </div>
                      )}
                    </div>
                    {viewMode===b&&<div className="w-full h-1 rounded-full" style={{background:WEEK_COLORS[b]}}/>}
                  </button>
                  );
                })}
              </div>
              {/* Won / Lost pills */}
              <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                <button onClick={()=>setViewMode('Won')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all flex-1 justify-center"
                  style={{borderColor:viewMode==='Won'?'#16a34a':'#e5e7eb',background:viewMode==='Won'?'#f0fdf4':'#f9fafb'}}>
                  <span>🏆</span>
                  <span className="text-sm font-black" style={{color:viewMode==='Won'?'#16a34a':'#6b7280'}}>Won</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{background:viewMode==='Won'?'#dcfce7':'#f3f4f6',color:viewMode==='Won'?'#16a34a':'#9ca3af'}}>
                    {wonDeals.length}
                  </span>
                </button>
                <button onClick={()=>setViewMode('Lost')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all flex-1 justify-center"
                  style={{borderColor:viewMode==='Lost'?'#dc2626':'#e5e7eb',background:viewMode==='Lost'?'#fef2f2':'#f9fafb'}}>
                  <span>✕</span>
                  <span className="text-sm font-black" style={{color:viewMode==='Lost'?'#dc2626':'#6b7280'}}>Lost</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{background:viewMode==='Lost'?'#fee2e2':'#f3f4f6',color:viewMode==='Lost'?'#dc2626':'#9ca3af'}}>
                    {lostDeals.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Deal list — chronological by day */}
            <div>
              {/* Section header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:viewColor}}/>
                  <span className="text-sm font-black text-gray-800">{viewMode}</span>
                  {isBucket(viewMode)&&(
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {getWeekDateRange(viewMode)}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    — {dealsForView.length} deal{dealsForView.length!==1?'s':''}
                  </span>
                  {isBucket(viewMode)&&(()=>{
                    const wkGth=dealsForView.filter(d=>d.Status==='Active').reduce((a,d)=>d.GTH==='GTH'?a+d.WeeklyValue:a,0);
                    const wkNon=dealsForView.filter(d=>d.Status==='Active').reduce((a,d)=>d.GTH!=='GTH'?a+d.WeeklyValue:a,0);
                    const wkTot=wkGth+wkNon;
                    return(
                      <span className="flex items-center gap-3 text-xs ml-1">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"/><span className="font-bold text-orange-500">GTH</span><span className="font-black text-gray-700">{fmt$(wkGth)}</span></span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"/><span className="font-bold text-purple-500">Non-GTH</span><span className="font-black text-gray-700">{fmt$(wkNon)}</span></span>
                        <span className="flex items-center gap-1"><span className="font-bold text-gray-400">Total</span><span className="font-black text-gray-700">{fmt$(wkTot)}</span></span>
                      </span>
                    );
                  })()}
                </div>
                {isBucket(viewMode)&&(
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Target: {fmt$(BUCKET_TARGETS[viewMode])}
                      <span className="text-gray-400"> ({fmt$(Math.round(BUCKET_TARGETS[viewMode]/4.33/100)*100)}/wk)</span>
                    </span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{width:`${Math.min((totalByBucket[viewMode]/BUCKET_TARGETS[viewMode])*100,100)}%`,background:viewColor}}/>
                    </div>
                  </div>
                )}
              </div>

              {/* Deals */}
              {loading?(
                <div className="text-center py-12 text-gray-400 text-sm">Loading deals...</div>
              ):dealsForView.length===0?(
                <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
                  <div className="text-3xl mb-2">{viewMode==='Won'?'🏆':viewMode==='Lost'?'❌':'📭'}</div>
                  <div className="text-sm text-gray-500 font-semibold">No {viewMode} deals yet</div>
                  {canLog&&isBucket(viewMode)&&(
                    <button onClick={()=>setTab('log')} className="mt-3 text-sm text-orange-500 font-bold underline">Log a deal →</button>
                  )}
                </div>
              ):(
                <div className="flex flex-col gap-8">
                  {groupDealsByDay(dealsForView).map(({dateStr,label,deals:dayDeals,overdue})=>{
                    const gthWeekly=dayDeals.reduce((a,d)=>d.GTH==='GTH'?a+d.WeeklyValue:a,0);
                    const nonGthWeekly=dayDeals.reduce((a,d)=>d.GTH!=='GTH'?a+d.WeeklyValue:a,0);
                    const totalWeekly=gthWeekly+nonGthWeekly;
                    return(
                      <div key={dateStr}>
                        {/* Day heading */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-px flex-1 bg-gray-200"/>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border flex-shrink-0 shadow-sm"
                            style={{
                              background: overdue ? '#fef2f2' : 'white',
                              borderColor: overdue ? '#fecaca' : '#e5e7eb',
                            }}>
                            {overdue && <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">⚠ OVERDUE</span>}
                            {overdue && <span className="text-gray-300">·</span>}
                            <div className="w-2 h-2 rounded-full" style={{background: overdue ? '#ef4444' : viewColor}}/>
                            <span className="text-xs font-black" style={{color: overdue ? '#dc2626' : 'text-gray-700'}}>{label}</span>
                            <span className="text-[10px] text-gray-400">· {dayDeals.length} deal{dayDeals.length!==1?'s':''}</span>
                          </div>
                          <div className="h-px flex-1 bg-gray-200"/>
                        </div>

                        {/* Day summary bar */}
                        <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 flex flex-wrap gap-x-6 gap-y-2 items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">Day Total</span>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-orange-400"/>
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">GTH</span>
                            <span className="text-sm font-black text-gray-800">{fmt$(gthWeekly)}</span>
                            <span className="text-[10px] text-gray-400">/wk</span>
                          </div>
                          <div className="text-gray-200">|</div>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-400"/>
                            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Non-GTH</span>
                            <span className="text-sm font-black text-gray-800">{fmt$(nonGthWeekly)}</span>
                            <span className="text-[10px] text-gray-400">/wk</span>
                          </div>
                          <div className="text-gray-200">|</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</span>
                            <span className="text-sm font-black text-gray-700">{fmt$(totalWeekly)}</span>
                            <span className="text-[10px] text-gray-400">/wk</span>
                          </div>
                        </div>



                        {/* Deal cards — stacked */}
                        <div className="flex flex-col gap-3 mt-4">
                          {dayDeals.map(deal=>(
                            <DealCard key={deal.id} deal={deal}
                              onStatusChange={handleStatusChange}
                              onReschedule={handleReschedule}
                              onGTHToggle={handleGTHToggle}
                              canEdit={canLog}
                              overdue={overdue && deal.Status==='Active'}/>
                          ))}
                        </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY VIEW ── */}
        {tab==='history'&&(
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-gray-800">Previous Week Buckets</h2>
                <p className="text-xs text-gray-400 mt-0.5">Deals grouped by their close date — shows what each week&apos;s pipeline turned into</p>
              </div>
              <button onClick={fetchDeals} className="text-xs text-orange-500 font-bold hover:text-orange-600">↻ Refresh</button>
            </div>

            {loading?(
              <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
            ):historicalData.length===0?(
              <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
                <div className="text-3xl mb-2">📭</div>
                <div className="text-sm text-gray-500 font-semibold">No historical deals found</div>
                <div className="text-xs text-gray-400 mt-1">Deals from previous weeks will appear here once logged</div>
              </div>
            ):(
              <div className="flex flex-col gap-4">
                {historicalData.map(wk=>{
                  const closedVal=wk.wonVal+wk.lostVal;
                  const resolvedVal=wk.wonVal+wk.lostVal+wk.movedVal;
                  const winRate=resolvedVal>0?Math.round((wk.wonVal/resolvedVal)*100):null;
                  const lostRate=resolvedVal>0?Math.round((wk.lostVal/resolvedVal)*100):null;
                  const movedRate=resolvedVal>0?Math.round((wk.movedVal/resolvedVal)*100):null;
                  return(
                    <div key={wk.weekOffset} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      {/* Week header — clickable accordion */}
                      <button onClick={()=>toggleWeek(wk.weekOffset)} className="w-full px-5 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="text-left">
                          <div className="text-xs font-black uppercase tracking-widest text-gray-500">
                            {wk.weekOffset===1?'Last Week':wk.weekOffset===2?'2 Weeks Ago':`${wk.weekOffset} Weeks Ago`}
                          </div>
                          <div className="text-sm font-black text-gray-800 mt-0.5">{wk.label}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm ml-2">{expandedWeeks.has(wk.weekOffset)?'▲':'▼'}</span>
                          <div className="text-right">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Total in Week 1 bucket @ start of week</div>
                            <div className="text-lg font-black text-gray-800">{fmt$(Math.round(wk.totalVal/4.33))}/wk</div>
                            <div className="text-[10px] text-gray-400">{fmt$(wk.totalVal)}/mo · {wk.wkDeals.length + wk.movedCount} deals</div>
                            <div className="text-[10px] text-gray-400 mt-1">Target: {fmt$(BUCKET_WK_TARGETS['Week 1'])}/wk</div>
                            {(()=>{
                              const wkVal=Math.round(wk.totalVal/4.33);
                              const diff=wkVal-BUCKET_WK_TARGETS['Week 1'];
                              const pct=Math.round((diff/BUCKET_WK_TARGETS['Week 1'])*100);
                              const ahead=diff>=0;
                              return <div className={`text-[10px] font-bold ${ahead?'text-emerald-600':'text-red-600'}`}>
                                Variance: {ahead?'+':''}{fmt$(diff)}/wk ({ahead?'+':''}{pct}%)
                              </div>;
                            })()}
                          </div>
                        </div>
                      </button>

                      {expandedWeeks.has(wk.weekOffset)&&<>
                      {/* Won / Lost / Moved / Active breakdown */}
                      <div className="grid grid-cols-4 divide-x divide-gray-100">
                        {/* Won */}
                        <div className="px-4 py-4">
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">🏆</span>
                              <span className="text-xs font-black text-emerald-600">Won</span>
                            </div>
                            {winRate!==null&&<div className="px-2 py-0.5 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-xs font-black text-emerald-600">{winRate}%</div>}
                          </div>
                          <div className="text-2xl font-black text-emerald-700">{fmt$(Math.round(wk.wonVal/4.33))}/wk</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{fmt$(wk.wonVal)}/mo</div>
                          <div className="text-xs text-gray-500 mt-1 font-semibold">{wk.wonCount} deal{wk.wonCount!==1?'s':''}</div>
                          {wk.wonCount>0&&(
                            <div className="mt-2 flex flex-col gap-1">
                              {wk.wkDeals.filter(d=>d.Status==='Won').map(d=>(
                                <div key={d.id} className="text-[9px] text-gray-500 truncate">
                                  {d.BusinessName} — {fmt$(d.MonthlyValue)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Lost */}
                        <div className="px-4 py-4">
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">✕</span>
                              <span className="text-xs font-black text-red-500">Lost</span>
                            </div>
                            {lostRate!==null&&<div className="px-2 py-0.5 rounded-lg border-2 border-red-200 bg-red-50 text-xs font-black text-red-500">{lostRate}%</div>}
                          </div>
                          <div className="text-2xl font-black text-red-600">{fmt$(Math.round(wk.lostVal/4.33))}/wk</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{fmt$(wk.lostVal)}/mo</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{fmt$(Math.round(wk.lostVal/4.33))}/wk equiv</div>
                          <div className="text-xs text-gray-500 mt-1 font-semibold">{wk.lostCount} deal{wk.lostCount!==1?'s':''}</div>
                          {wk.lostCount>0&&(
                            <div className="mt-2 flex flex-col gap-1">
                              {wk.wkDeals.filter(d=>d.Status==='Lost').map(d=>(
                                <div key={d.id} className="text-[9px] text-gray-500 truncate">
                                  {d.BusinessName} — {fmt$(d.MonthlyValue)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Moved */}
                        <div className="px-4 py-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-base">📅</span>
                            <span className="text-xs font-black text-purple-500">Moved</span>
                          </div>
                          <div className="text-2xl font-black text-purple-600">{fmt$(wk.movedVal)}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{fmt$(Math.round(wk.movedVal/4.33))}/wk equiv</div>
                          <div className="text-xs text-gray-500 mt-1 font-semibold">{wk.movedCount} deal{wk.movedCount!==1?'s':''}</div>
                          {wk.movedCount>0&&(
                            <div className="mt-2 flex flex-col gap-1.5">
                              {(['Week 1','Week 2','Week 3','Week 4','Week 5+'] as const).filter(b=>wk.movedToBuckets[b]?.count>0).map(b=>(
                                <div key={b} className="text-[9px] flex items-center justify-between gap-2">
                                  <span className="font-bold px-1.5 py-0.5 rounded-full"
                                    style={{background:WEEK_COLORS[b]+'20',color:WEEK_COLORS[b]}}>
                                    → {b}
                                  </span>
                                  <span className="text-gray-500">{wk.movedToBuckets[b].count} deal{wk.movedToBuckets[b].count!==1?'s':''} · {fmt$(wk.movedToBuckets[b].val)}</span>
                                </div>
                              ))}
                              <div className="mt-1 flex flex-col gap-0.5">
                                {wk.movedDeals.map(d=>(
                                  <div key={d.id} className="text-[9px] text-gray-500 truncate">
                                    {d.BusinessName} — {fmt$(d.MonthlyValue)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Still active / overdue */}
                        <div className="px-4 py-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-base">⏳</span>
                            <span className="text-xs font-black text-orange-500">Still Active</span>
                          </div>
                          <div className="text-2xl font-black text-orange-600">{fmt$(wk.activeVal)}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{fmt$(Math.round(wk.activeVal/4.33))}/wk equiv</div>
                          <div className="text-xs text-gray-500 mt-1 font-semibold">{wk.activeCount} deal{wk.activeCount!==1?'s':''}</div>
                          {wk.activeCount>0&&(
                            <div className="mt-2 flex flex-col gap-1">
                              {wk.wkDeals.filter(d=>d.Status==='Active').map(d=>(
                                <div key={d.id} className="text-[9px] text-gray-500 truncate">
                                  {d.BusinessName} — {fmt$(d.MonthlyValue)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Breakdown bar */}
                      {wk.totalVal>0&&(
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 w-16">Breakdown</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                              <div className="h-full bg-emerald-400 rounded-l-full transition-all"
                                style={{width:`${(wk.wonVal/wk.totalVal)*100}%`}}/>
                              <div className="h-full bg-red-400 transition-all"
                                style={{width:`${(wk.lostVal/wk.totalVal)*100}%`}}/>
                              <div className="h-full bg-purple-400 transition-all"
                                style={{width:`${(wk.movedVal/wk.totalVal)*100}%`}}/>
                              <div className="h-full bg-orange-300 rounded-r-full transition-all"
                                style={{width:`${(wk.activeVal/wk.totalVal)*100}%`}}/>
                            </div>
                            <div className="flex gap-2 text-[9px] font-semibold flex-shrink-0 flex-wrap">
                              {wk.wonVal>0&&<span className="text-emerald-600">{Math.round((wk.wonVal/wk.totalVal)*100)}% won</span>}
                              {wk.lostVal>0&&<span className="text-red-500">{Math.round((wk.lostVal/wk.totalVal)*100)}% lost</span>}
                              {wk.movedVal>0&&<span className="text-purple-500">{Math.round((wk.movedVal/wk.totalVal)*100)}% moved</span>}
                              {wk.activeVal>0&&<span className="text-orange-500">{Math.round((wk.activeVal/wk.totalVal)*100)}% active</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {tab==='log'&&canLog&&(
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-gray-500">Log a Deal</div>
                <p className="text-xs text-gray-400 mt-0.5">Post-meeting details — auto-assigns to the right week bucket</p>
              </div>
              {fCloseDate&&(
                <div className="text-xs font-black px-3 py-1.5 rounded-xl border-2"
                  style={{color:WEEK_COLORS[getWeekBucket(fCloseDate)],borderColor:WEEK_COLORS[getWeekBucket(fCloseDate)]+'60',background:WEEK_COLORS[getWeekBucket(fCloseDate)]+'15'}}>
                  → {getWeekBucket(fCloseDate)}
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col gap-5">
              {success&&(
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-semibold text-center">
                  ✅ Deal logged and added to pipeline!
                </div>
              )}
              {formErrors.length>0&&(
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="text-sm font-black text-red-600 mb-1">⚠ Please fill in the required fields:</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formErrors.map(e=>(
                      <span key={e} className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">{e}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Date of Meeting" required><input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} className={inputCls}/></Field>
                <Field label="Close Date" required><input type="date" value={fCloseDate} onChange={e=>setFCloseDate(e.target.value)} className={inputCls} style={{borderColor:err('Close Date')?'#ef4444':undefined}}/></Field>
                <Field label="Close Time">
                  <select value={fCloseTime} onChange={e=>setFCloseTime(e.target.value)} className={selectCls}>
                    <option value="">Select time...</option>
                    <option key="07:00" value="07:00">7:00 AM</option>
                      <option key="07:30" value="07:30">7:30 AM</option>
                      <option key="08:00" value="08:00">8:00 AM</option>
                      <option key="08:30" value="08:30">8:30 AM</option>
                      <option key="09:00" value="09:00">9:00 AM</option>
                      <option key="09:30" value="09:30">9:30 AM</option>
                      <option key="10:00" value="10:00">10:00 AM</option>
                      <option key="10:30" value="10:30">10:30 AM</option>
                      <option key="11:00" value="11:00">11:00 AM</option>
                      <option key="11:30" value="11:30">11:30 AM</option>
                      <option key="12:00" value="12:00">12:00 PM</option>
                      <option key="12:30" value="12:30">12:30 PM</option>
                      <option key="13:00" value="13:00">1:00 PM</option>
                      <option key="13:30" value="13:30">1:30 PM</option>
                      <option key="14:00" value="14:00">2:00 PM</option>
                      <option key="14:30" value="14:30">2:30 PM</option>
                      <option key="15:00" value="15:00">3:00 PM</option>
                      <option key="15:30" value="15:30">3:30 PM</option>
                      <option key="16:00" value="16:00">4:00 PM</option>
                      <option key="16:30" value="16:30">4:30 PM</option>
                      <option key="17:00" value="17:00">5:00 PM</option>
                      <option key="17:30" value="17:30">5:30 PM</option>
                      <option key="18:00" value="18:00">6:00 PM</option>
                      <option key="18:30" value="18:30">6:30 PM</option>
                      <option key="19:00" value="19:00">7:00 PM</option>
                      <option key="19:30" value="19:30">7:30 PM</option>
                      <option key="20:00" value="20:00">8:00 PM</option>
                      <option key="20:30" value="20:30">8:30 PM</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Business Name" required>
                  <input type="text" value={fBusiness} onChange={e=>setFBusiness(e.target.value)} placeholder="Client business name" className={inputCls} style={{borderColor:err('Business Name')?'#ef4444':undefined}}/>
                </Field>
                <Field label="Closer" required>
                  <select value={fCloser} onChange={e=>setFCloser(e.target.value)} className={selectCls} style={{borderColor:err('Closer')?'#ef4444':undefined}}>
                    <option value="">Select closer...</option>
                    {CLOSERS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Booker" required>
                  <select value={fBooker} onChange={e=>setFBooker(e.target.value)} className={selectCls} style={{borderColor:err('Booker')?'#ef4444':undefined}}>
                    <option value="">Select booker...</option>
                    {BOOKERS.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Monthly $ ex GST" required>
                  <div className="flex items-center border-2 rounded-xl overflow-hidden focus-within:border-orange-400" style={{borderColor:err('Monthly $')?'#ef4444':'#e5e7eb'}}>
                    <span className="pl-3 text-gray-400 font-bold text-sm">$</span>
                    <input type="number" value={fMonthly} onChange={e=>setFMonthly(e.target.value)} placeholder="0" className="flex-1 px-2 py-2.5 text-sm font-semibold text-gray-800 outline-none bg-white"/>
                  </div>
                </Field>
                <Field label="Weekly $ inc GST (auto)">
                  <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                    <span className="pl-3 text-gray-400 font-bold text-sm">$</span>
                    <input type="number" value={calcWeekly(fMonthly)} readOnly placeholder="Auto-calculated" className="flex-1 px-2 py-2.5 text-sm font-semibold text-gray-500 outline-none bg-transparent cursor-default"/>
                    <span className="pr-3 text-[10px] text-gray-400 font-semibold italic">ex×÷12÷52×1.1</span>
                  </div>
                </Field>
                <Field label="Upfront $ inc GST">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400">
                    <span className="pl-3 text-gray-400 font-bold text-sm">$</span>
                    <input type="number" value={fUpfront} onChange={e=>setFUpfront(e.target.value)} placeholder="Standard / Plus only" className="flex-1 px-2 py-2.5 text-sm font-semibold text-gray-800 outline-none bg-white"/>
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="GTH Status" required>
                  <select value={fGTH} onChange={e=>setFGTH(e.target.value)} className={selectCls} style={{borderColor:err('GTH Status')?'#ef4444':undefined}}>
                    <option value="">Select...</option>
                    <option value="GTH">GTH — Gun to Head</option>
                    <option value="Non GTH">Non GTH</option>
                  </select>
                </Field>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Next Contact Date <span className="text-[10px] font-normal normal-case italic text-gray-400">(Load, Send Review etc. or same as Close Date)</span></label>
                  <input type="date" value={fNextContact} onChange={e=>setFNextContact(e.target.value)} className={inputCls}/>
                </div>
                <Field label="Brand" required>
                  <select value={fBrand} onChange={e=>setFBrand(e.target.value as Brand)} className={selectCls} style={{borderColor:err('Brand')?'#ef4444':undefined}}>
                    <option value="">Select brand...</option>
                    <option value="MS">Marketing Sweet</option>
                    <option value="Quodo">Quodo</option>
                    <option value="Both">Both (Double Deal)</option>
                  </select>
                </Field>
              </div>

              {fBrand&&(
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fBrand==='Both'?(
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider" style={{color:err('Membership / Plan (at least one)')?'#ef4444':'#6b7280'}}>Membership / Plan</label>
                      <select value={fPlan} onChange={e=>setFPlan(e.target.value)} className={selectCls} style={{borderColor:err('Membership / Plan (at least one)')?'#ef4444':undefined}}>
                        <option value="">MS plan...</option>
                        {MS_PLANS.map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                      <select value={fPlanQuodo} onChange={e=>setFPlanQuodo(e.target.value)} className={selectCls} style={{borderColor:err('Membership / Plan (at least one)')?'#ef4444':undefined}}>
                        <option value="">Quodo plan...</option>
                        {Q_PLANS.map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  ):(
                    <Field label="Membership / Plan">
                      <select value={fPlan} onChange={e=>setFPlan(e.target.value)} className={selectCls} style={{borderColor:err('Membership / Plan')?'#ef4444':undefined}}>
                        <option value="">Select plan...</option>
                        {planOptions.map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                    </Field>
                  )}
                  <Field label="Extras / Hosting">
                    <div className="border-2 border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 min-h-[48px]">
                      {extraOptions.length===0&&<span className="text-xs text-gray-400">Select a brand first</span>}
                      {extraOptions.map(opt=>(
                        <button key={opt} type="button"
                          onClick={()=>setFExtras(prev=>prev.includes(opt)?prev.filter(x=>x!==opt):[...prev,opt])}
                          className="text-xs rounded-lg px-2.5 py-1.5 font-semibold border-2 transition-all"
                          style={{background:fExtras.includes(opt)?'#fff7ed':'#f9fafb',borderColor:fExtras.includes(opt)?'#f97316':'#e5e7eb',color:fExtras.includes(opt)?'#ea580c':'#6b7280'}}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              <Field label="Notes (optional)">
                <textarea value={fNotes} onChange={e=>setFNotes(e.target.value)} rows={2}
                  placeholder="Any additional notes..."
                  className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-400 bg-white w-full resize-none"/>
              </Field>

              <button onClick={submitDeal} disabled={saving}
                className="w-full rounded-xl py-4 text-sm font-black text-white transition-all"
                style={{background:saving?'#d1d5db':'#f97316'}}>
                {saving?'Saving...':'🚀 Log Deal to Pipeline'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Will be added to <strong>{fCloseDate?getWeekBucket(fCloseDate):'—'}</strong> based on close date
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </PipelineAuth>
  );
}
