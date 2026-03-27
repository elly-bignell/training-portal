'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

const CLOSERS = ['Lucas', 'Dylan', 'Felipe', 'Thomas'];
const BOOKERS = ['Lucas', 'Dylan', 'Felipe', 'Thomas'];
const VIEWERS = ['Lucas', 'Dylan', 'Felipe', 'Admin'];

const MS_PLANS  = ['Web Support','SEO Support','Digital Support','Diamond','Platinum','Gold','Silver','Bronze'];
const Q_PLANS   = ['Web Changes','SEO Backlinking','SEO Page Building','Google Ads','O/O Web Changes','O/O Page Building','O/O SEO Overhaul'];
const MS_EXTRAS = ['Web Changes','SEO Backlinking','SEO Page Building','Google Ads','O/O Web Changes','O/O Page Building','O/O SEO Overhaul'];
const Q_EXTRAS  = ['LiteHost','Plus36 Hosting','Plus24 Hosting','FlexiHost'];

const STATUS_COLORS: Record<string,{bg:string;text:string;border:string}> = {
  Active: { bg:'#fff7ed', text:'#ea580c', border:'#fed7aa' },
  Won:    { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  Lost:   { bg:'#fef2f2', text:'#dc2626', border:'#fecaca' },
};

const WEEK_COLORS: Record<string,string> = {
  'Week 1':'#f97316','Week 2':'#a78bfa','Week 3':'#34d399','Week 4+':'#60a5fa',
};

const BUCKET_TARGETS: Record<string,number> = {
  'Week 1':10912,'Week 2':8314,'Week 3':2338,'Week 4+':4157,
};

type Status = 'Active'|'Won'|'Lost';
type Brand  = 'MS'|'Quodo'|'Both';
type Bucket = 'Week 1'|'Week 2'|'Week 3'|'Week 4+';

interface Deal {
  id:string; BusinessName:string; DateOfMeeting:string; CloseDate:string;
  CloseTime?:string; Closer:string; Booker:string; MonthlyValue:number;
  WeeklyValue:number; UpfrontValue?:number; GTH:string; NextContactDate?:string;
  Brand:Brand; Plan?:string; Extras?:string; WeekBucket:Bucket;
  Status:Status; LoggedBy:string; Notes?:string;
}

function getWeekBucket(closeDate:string):Bucket {
  const today=new Date(); today.setHours(0,0,0,0);
  const mon=new Date(today); mon.setDate(today.getDate()-((today.getDay()+6)%7));
  const close=new Date(closeDate); close.setHours(0,0,0,0);
  const diff=Math.floor((close.getTime()-mon.getTime())/86400000);
  if(diff<7)return 'Week 1'; if(diff<14)return 'Week 2';
  if(diff<21)return 'Week 3'; return 'Week 4+';
}

function fmt$(n:number){return '$'+n.toLocaleString(undefined,{maximumFractionDigits:0});}
function todayStr(){return new Date().toISOString().split('T')[0];}

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

function DealCard({deal,onStatusChange,canEdit}:{deal:Deal;onStatusChange:(id:string,s:Status)=>void;canEdit:boolean}){
  const sc=STATUS_COLORS[deal.Status]||STATUS_COLORS.Active;
  const [changing,setChanging]=useState(false);
  async function handleStatus(s:Status){
    setChanging(true); await onStatusChange(deal.id,s); setChanging(false);
  }
  return(
    <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3 shadow-sm" style={{borderColor:sc.border}}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-black text-gray-900 text-sm leading-tight truncate">{deal.BusinessName}</div>
          <div className="text-xs text-gray-400 mt-0.5">{deal.Brand} · {deal.Plan||'—'}</div>
        </div>
        <div className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black border"
          style={{background:sc.bg,color:sc.text,borderColor:sc.border}}>{deal.Status}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{label:'Monthly',val:fmt$(deal.MonthlyValue)},{label:'Weekly',val:fmt$(deal.WeeklyValue)},{label:'Upfront',val:deal.UpfrontValue?fmt$(deal.UpfrontValue):'—'}].map(s=>(
          <div key={s.label} className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="text-[9px] text-gray-400 font-semibold uppercase">{s.label}</div>
            <div className="text-sm font-black text-gray-800">{s.val}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
        <span>📅 Close: <strong>{deal.CloseDate}</strong>{deal.CloseTime?` @ ${deal.CloseTime}`:''}</span>
        <span>🎯 {deal.GTH}</span>
        <span>👤 {deal.Closer}</span>
        <span>📞 {deal.Booker}</span>
      </div>
      {deal.Extras&&<div className="text-[10px] text-gray-400"><strong className="text-gray-500">Extras:</strong> {deal.Extras}</div>}
      {deal.NextContactDate&&<div className="text-[10px] text-gray-400"><strong className="text-gray-500">Next contact:</strong> {deal.NextContactDate}</div>}
      {deal.Notes&&<div className="text-[10px] text-gray-400 italic">{deal.Notes}</div>}
      {canEdit&&(
        <div className="flex gap-1.5 pt-1 border-t border-gray-100">
          {(['Active','Won','Lost'] as Status[]).map(s=>(
            <button key={s} onClick={()=>handleStatus(s)} disabled={changing||deal.Status===s}
              className="flex-1 rounded-lg py-1.5 text-[10px] font-black border transition-all"
              style={{background:deal.Status===s?STATUS_COLORS[s].bg:'#f9fafb',color:deal.Status===s?STATUS_COLORS[s].text:'#9ca3af',borderColor:deal.Status===s?STATUS_COLORS[s].border:'#e5e7eb'}}>
              {s==='Active'?'● Active':s==='Won'?'🏆 Won':'✕ Lost'}
            </button>
          ))}
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
            fill={fillPct>45?'#fff':color}>{fillPct.toFixed(0)}%</text>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-xs font-black text-gray-700">{fmt$(totalM)}</div>
        <div className="text-[10px] text-gray-400">of {fmt$(targetValue)}</div>
        {wonM>0&&<div className="text-[10px] text-emerald-600 font-semibold">🏆 {fmt$(wonM)} won</div>}
      </div>
    </div>
  );
}

export default function PipelinePage(){
  const [tab,setTab]=useState<'pipeline'|'log'>('pipeline');
  const [weekTab,setWeekTab]=useState<Bucket>('Week 1');
  const [user,setUser]=useState('');
  const [deals,setDeals]=useState<Deal[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [success,setSuccess]=useState(false);

  const [fDate,setFDate]=useState(todayStr());
  const [fCloseDate,setFCloseDate]=useState('');
  const [fCloseTime,setFCloseTime]=useState('');
  const [fBusiness,setFBusiness]=useState('');
  const [fCloser,setFCloser]=useState('');
  const [fBooker,setFBooker]=useState('');
  const [fMonthly,setFMonthly]=useState('');
  const [fWeekly,setFWeekly]=useState('');
  const [fUpfront,setFUpfront]=useState('');
  const [fGTH,setFGTH]=useState('');
  const [fNextContact,setFNextContact]=useState('');
  const [fBrand,setFBrand]=useState<Brand|''>('');
  const [fPlan,setFPlan]=useState('');
  const [fExtras,setFExtras]=useState<string[]>([]);
  const [fNotes,setFNotes]=useState('');

  const canLog=CLOSERS.includes(user);
  const canView=VIEWERS.includes(user);

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

  useEffect(()=>{if(canView)fetchDeals();},[canView,fetchDeals]);
  useEffect(()=>{setFPlan('');setFExtras([]);},[fBrand]);

  async function handleStatusChange(id:string,status:Status){
    const res=await fetch(`/api/pipeline/deals/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({Status:status})});
    if(res.ok){const u=await res.json();setDeals(prev=>prev.map(d=>d.id===id?{...d,...u}:d));}
  }

  async function submitDeal(){
    if(!fBusiness||!fCloseDate||!fCloser||!fBooker||!fMonthly||!fWeekly||!fGTH||!fBrand)return;
    setSaving(true);
    try{
      const bucket=getWeekBucket(fCloseDate);
      const body:Record<string,unknown>={
        BusinessName:fBusiness,DateOfMeeting:fDate,CloseDate:fCloseDate,
        ...(fCloseTime?{CloseTime:fCloseTime}:{}),
        Closer:fCloser,Booker:fBooker,
        MonthlyValue:Number(fMonthly),WeeklyValue:Number(fWeekly),
        ...(fUpfront?{UpfrontValue:Number(fUpfront)}:{}),
        GTH:fGTH,...(fNextContact?{NextContactDate:fNextContact}:{}),
        Brand:fBrand,...(fPlan?{Plan:fPlan}:{}),
        ...(fExtras.length?{Extras:fExtras.join(', ')}:{}),
        ...(fNotes?{Notes:fNotes}:{}),
        WeekBucket:bucket,Status:'Active',LoggedBy:user,
      };
      const res=await fetch('/api/pipeline/deals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(res.ok){
        const saved=await res.json();
        setDeals(prev=>[saved,...prev]);
        setSuccess(true);setTimeout(()=>setSuccess(false),3000);
        const closedBucket=getWeekBucket(fCloseDate);
        setFBusiness('');setFCloseDate('');setFCloseTime('');setFCloser('');
        setFBooker('');setFMonthly('');setFWeekly('');setFUpfront('');
        setFGTH('');setFNextContact('');setFBrand('');setFPlan('');
        setFExtras([]);setFNotes('');setFDate(todayStr());
        setTab('pipeline');setWeekTab(closedBucket);
      }
    }finally{setSaving(false);}
  }

  const dealsByBucket=useMemo(()=>{
    const map:Record<Bucket,Deal[]>={'Week 1':[],'Week 2':[],'Week 3':[],'Week 4+':[]};
    deals.forEach(d=>{if(map[d.WeekBucket])map[d.WeekBucket].push(d);});
    return map;
  },[deals]);

  const totalByBucket=useMemo(()=>{
    const map:Record<Bucket,number>={'Week 1':0,'Week 2':0,'Week 3':0,'Week 4+':0};
    deals.filter(d=>d.Status==='Active').forEach(d=>{map[d.WeekBucket]+=d.MonthlyValue;});
    return map;
  },[deals]);

  if(!user){
    return(
      <div className="min-h-screen flex items-center justify-center" style={{background:'#f4f6f9'}}>
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 w-full max-w-sm flex flex-col gap-5 shadow-sm">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Marketing Sweet</div>
            <h1 className="text-2xl font-black text-gray-900 mt-1">Pipeline</h1>
            <p className="text-sm text-gray-500 mt-1">Select your name to continue</p>
          </div>
          <div className="flex flex-col gap-2">
            {['Lucas','Dylan','Felipe','Thomas','Admin'].map(name=>(
              <button key={name} onClick={()=>setUser(name)}
                className="w-full rounded-xl border-2 border-gray-200 py-3 text-sm font-black text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-all">
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if(!canView){
    return(
      <div className="min-h-screen flex items-center justify-center" style={{background:'#f4f6f9'}}>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <div className="font-black text-gray-800">Access restricted</div>
          <button onClick={()=>setUser('')} className="mt-4 text-sm text-orange-500 underline">Switch user</button>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen" style={{background:'#f4f6f9'}}>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Marketing Sweet</div>
            <h1 className="text-xl font-black text-gray-900">Pipeline</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-semibold">{user}</span>
            <button onClick={()=>setUser('')} className="text-xs text-gray-400 hover:text-orange-500 transition-colors">Switch</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {[{key:'pipeline',label:'📊 Pipeline View'},...(canLog?[{key:'log',label:'✏️ Log a Deal'}]:[])].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key as any)}
              className="px-4 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{borderColor:tab===t.key?'#f97316':'transparent',color:tab===t.key?'#f97316':'#6b7280'}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {tab==='pipeline'&&(
          <div className="flex flex-col gap-6">
            {/* Bucket overview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="text-xs font-black uppercase tracking-widest text-gray-500">Pipeline Overview</div>
                <button onClick={fetchDeals} className="text-xs text-orange-500 font-bold hover:text-orange-600">↻ Refresh</button>
              </div>
              <div className="grid grid-cols-4 gap-6">
                {(['Week 1','Week 2','Week 3','Week 4+'] as Bucket[]).map(b=>(
                  <button key={b} onClick={()=>setWeekTab(b)} className="flex flex-col gap-2 transition-all"
                    style={{opacity:weekTab===b?1:0.6}}>
                    <BucketVisual bucket={b} deals={dealsByBucket[b]} targetValue={BUCKET_TARGETS[b]}/>
                    <div className="text-center">
                      <div className="text-xs font-black" style={{color:WEEK_COLORS[b]}}>{b}</div>
                      <div className="text-[10px] text-gray-400">{dealsByBucket[b].length} deals</div>
                    </div>
                    {weekTab===b&&<div className="w-full h-1 rounded-full" style={{background:WEEK_COLORS[b]}}/>}
                  </button>
                ))}
              </div>
            </div>

            {/* Active week deals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{background:WEEK_COLORS[weekTab]}}/>
                  <span className="text-sm font-black text-gray-800">{weekTab}</span>
                  <span className="text-xs text-gray-400">— {dealsByBucket[weekTab].length} deals · {fmt$(totalByBucket[weekTab])} active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Target: {fmt$(BUCKET_TARGETS[weekTab])}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{width:`${Math.min((totalByBucket[weekTab]/BUCKET_TARGETS[weekTab])*100,100)}%`,background:WEEK_COLORS[weekTab]}}/>
                  </div>
                </div>
              </div>
              {loading?(
                <div className="text-center py-12 text-gray-400 text-sm">Loading deals...</div>
              ):dealsByBucket[weekTab].length===0?(
                <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
                  <div className="text-3xl mb-2">📭</div>
                  <div className="text-sm text-gray-500 font-semibold">No deals in {weekTab} yet</div>
                  {canLog&&<button onClick={()=>setTab('log')} className="mt-3 text-sm text-orange-500 font-bold underline">Log a deal →</button>}
                </div>
              ):(
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dealsByBucket[weekTab].map(deal=>(
                    <DealCard key={deal.id} deal={deal} onStatusChange={handleStatusChange} canEdit={canLog||user==='Admin'}/>
                  ))}
                </div>
              )}
            </div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Date of Meeting" required><input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} className={inputCls}/></Field>
                <Field label="Close Date" required><input type="date" value={fCloseDate} onChange={e=>setFCloseDate(e.target.value)} className={inputCls}/></Field>
                <Field label="Close Time"><input type="time" value={fCloseTime} onChange={e=>setFCloseTime(e.target.value)} className={inputCls}/></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Business Name" required>
                  <input type="text" value={fBusiness} onChange={e=>setFBusiness(e.target.value)} placeholder="Client business name" className={inputCls}/>
                </Field>
                <Field label="Closer" required>
                  <select value={fCloser} onChange={e=>setFCloser(e.target.value)} className={selectCls}>
                    <option value="">Select closer...</option>
                    {CLOSERS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Booker" required>
                  <select value={fBooker} onChange={e=>setFBooker(e.target.value)} className={selectCls}>
                    <option value="">Select booker...</option>
                    {BOOKERS.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Monthly $ inc GST" required>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400">
                    <span className="pl-3 text-gray-400 font-bold text-sm">$</span>
                    <input type="number" value={fMonthly} onChange={e=>setFMonthly(e.target.value)} placeholder="0" className="flex-1 px-2 py-2.5 text-sm font-semibold text-gray-800 outline-none bg-white"/>
                  </div>
                </Field>
                <Field label="Weekly $ inc GST" required>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400">
                    <span className="pl-3 text-gray-400 font-bold text-sm">$</span>
                    <input type="number" value={fWeekly} onChange={e=>setFWeekly(e.target.value)} placeholder="0" className="flex-1 px-2 py-2.5 text-sm font-semibold text-gray-800 outline-none bg-white"/>
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
                  <select value={fGTH} onChange={e=>setFGTH(e.target.value)} className={selectCls}>
                    <option value="">Select...</option>
                    <option value="GTH">GTH — Gun to Head</option>
                    <option value="Non GTH">Non GTH</option>
                  </select>
                </Field>
                <Field label="Next Contact Date">
                  <input type="date" value={fNextContact} onChange={e=>setFNextContact(e.target.value)} className={inputCls}/>
                </Field>
                <Field label="Brand" required>
                  <select value={fBrand} onChange={e=>setFBrand(e.target.value as Brand)} className={selectCls}>
                    <option value="">Select brand...</option>
                    <option value="MS">Marketing Sweet</option>
                    <option value="Quodo">Quodo</option>
                    <option value="Both">Both (Double Deal)</option>
                  </select>
                </Field>
              </div>

              {fBrand&&(
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Membership / Plan">
                    <select value={fPlan} onChange={e=>setFPlan(e.target.value)} className={selectCls}>
                      <option value="">Select plan...</option>
                      {planOptions.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
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
  );
}
