'use client';

import {useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {MessageCircle,GraduationCap,UserRound,Users,CalendarDays,MapPin,Check,Sparkles} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';

export type InquirySelection={subject:string;grade?:string;programme?:string;slot?:string};
export type InquiryAnswers={student:string;grade:string;otherGrade:string;programme:string;otherProgramme:string;guardian:string;slot:string;message:string};
export const inquiryProgrammes=['බටපොල — ඔනායා ආයතනය','අම්බලන්ගොඩ — විශාකා ආයතනය','තල්ගස්ගොඩ — ඇරෝ ආයතනය','ප්‍රශ්න පත්‍ර පන්තිය — Paper Class','මෙවර විභාගයට පෙනී සිටින දරුවන් සඳහා Online Revision','Grade 10 Online Classes'];
const grades=['Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Paper Class','Online Class','වෙනත් / Other'];
const clean=(s:string)=>s.trim().replace(/\r\n/g,'\n');
export function formatInquiryMessage(a:InquiryAnswers,subject:string,brand='SCIENCE IN MOTION'){
 const grade=a.grade==='වෙනත් / Other'?a.otherGrade:a.grade;
 const programme=a.programme==='වෙනත් / Other'?a.otherProgramme:a.programme;
 return [`*පන්ති විමසීම | ${clean(brand)}*`,'', 'ආයුබෝවන් ගුරුතුමනි! පහත පන්තිය පිළිබඳ තොරතුරු දැනගැනීමට කැමතියි.','',`*තෝරාගත් පන්තිය:* ${clean(subject)}`,'',`1. *ශිෂ්‍යයාගේ නම:* ${clean(a.student)}`,`2. *ශ්‍රේණිය:* ${clean(grade)}`,`3. *ආයතනය / පන්ති වැඩසටහන:* ${clean(programme)}`,`4. *දෙමාපිය / භාරකරුගේ නම:* ${clean(a.guardian)}`,`5. *පන්තිය / දිනය / වේලාව:* ${clean(a.slot)}`,a.message.trim()?`6. *අමතර පණිවිඩය:* ${clean(a.message)}`:'', '', 'පන්ති වේලාවන් හා සම්බන්ධ වීමේ විස්තර දැනුම් දෙන්න. ස්තුතියි!'].filter((s,i,all)=>s!==''||all[i-1]!=='').join('\n').trim();
}
export function whatsappNumber(raw:string){const digits=raw.replace(/\D/g,'');return digits.startsWith('0')&&digits.length===10?'94'+digits.slice(1):digits.startsWith('0094')?digits.slice(2):digits}

export default function WhatsAppInquiry({selection,onClose,phone,programmes,brand}:{selection:InquirySelection|null;onClose:()=>void;phone:string;programmes:string[];brand:string}){
 return <Dialog open={!!selection} onOpenChange={open=>!open&&onClose()}><DialogContent className="inquiry-dialog">{selection&&<InquiryForm key={selection.subject+'|'+selection.slot} selection={selection} phone={phone} programmes={programmes} brand={brand}/>}</DialogContent></Dialog>
}
function InquiryForm({selection,phone,programmes,brand}:{selection:InquirySelection;phone:string;programmes:string[];brand:string}){
 const reduced=useReducedMotion();
 const choices=[...new Set([...inquiryProgrammes,...programmes.filter(Boolean),'වෙනත් / Other'])];
 const [answers,setAnswers]=useState<InquiryAnswers>({student:'',grade:selection.grade||'',otherGrade:'',programme:selection.programme||'',otherProgramme:'',guardian:'',slot:selection.slot||'',message:''});
 const [error,setError]=useState(''),[preview,setPreview]=useState(false);
 const set=(key:keyof InquiryAnswers,value:string)=>{setAnswers(a=>({...a,[key]:value}));setError('')};
 const completed=[!!answers.student.trim(),!!answers.grade&&(answers.grade!=='වෙනත් / Other'||!!answers.otherGrade.trim()),!!answers.programme&&(answers.programme!=='වෙනත් / Other'||!!answers.otherProgramme.trim()),!!answers.guardian.trim(),!!answers.slot.trim()].filter(Boolean).length;
 const number=whatsappNumber(phone);
 return <><div className="inquiry-header"><div className="inquiry-emblem"><MessageCircle size={27}/><span><Sparkles size={12}/></span></div><div><span className="inquiry-eyebrow">LET’S FIND YOUR CLASS</span><DialogTitle>පන්ති විමසීම</DialogTitle><DialogDescription>ඔබේ තොරතුරු එක් කර WhatsApp හරහා විමසන්න.</DialogDescription></div></div>
 <div className="inquiry-summary"><span><GraduationCap size={20}/><small>තෝරාගත් පන්ති සාරාංශය</small><b>{selection.subject}</b></span><span className="inquiry-recipient"><MessageCircle size={16}/>{number==='94712901714'?'071 290 1714':'+'+number}</span></div>
 <div className="inquiry-progress"><div><span>අවශ්‍ය තොරතුරු</span><b>{completed} / 5</b></div><span className="inquiry-track"><motion.span animate={{width:`${completed/5*100}%`}} transition={{duration:reduced?0:.4}}/></span></div>
 <form onSubmit={e=>{e.preventDefault();if(completed!==5){setError('කරුණාකර අවශ්‍ය තොරතුරු සියල්ල සම්පූර්ණ කරන්න.');return}if(!/^\d{8,15}$/.test(number)){setError('WhatsApp අංකය නිවැරදි නොවේ. කරුණාකර දුරකථනයෙන් විමසන්න.');return}window.open(`https://wa.me/${number}?text=${encodeURIComponent(formatInquiryMessage(answers,selection.subject,brand))}`,'_blank','noopener,noreferrer')}}>
 <div className="inquiry-fields">
 <label className="inquiry-field"><span className="question-heading"><i>01</i><UserRound size={17}/><b>ශිෂ්‍යයාගේ නම <em>*</em></b></span><input autoComplete="name" required maxLength={120} value={answers.student} onChange={e=>set('student',e.target.value)} placeholder="ශිෂ්‍යයාගේ සම්පූර්ණ නම"/></label>
 <div className="inquiry-field"><label id="inquiry-grade-label" className="question-heading"><i>02</i><GraduationCap size={17}/><b>ශ්‍රේණිය <em>*</em></b></label><Select required value={answers.grade} onValueChange={v=>set('grade',v)}><SelectTrigger aria-labelledby="inquiry-grade-label"><SelectValue placeholder="ශ්‍රේණිය තෝරන්න"/></SelectTrigger><SelectContent className="inquiry-options" position="popper">{grades.map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>{answers.grade==='වෙනත් / Other'&&<input className="other-answer" aria-label="වෙනත් ශ්‍රේණිය" placeholder="ශ්‍රේණිය සඳහන් කරන්න" required maxLength={100} value={answers.otherGrade} onChange={e=>set('otherGrade',e.target.value)}/>}</div>
 <div className="inquiry-field wide"><label id="inquiry-programme-label" className="question-heading"><i>03</i><MapPin size={17}/><b>ආයතනය / පන්ති වැඩසටහන <em>*</em></b></label><Select required value={answers.programme} onValueChange={v=>set('programme',v)}><SelectTrigger aria-labelledby="inquiry-programme-label"><SelectValue placeholder="ආයතනය / පන්ති වැඩසටහන තෝරන්න"/></SelectTrigger><SelectContent className="inquiry-options" position="popper">{choices.map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>{answers.programme==='වෙනත් / Other'&&<input className="other-answer" aria-label="වෙනත් ආයතනය හෝ වැඩසටහන" placeholder="ආයතනය හෝ වැඩසටහන සඳහන් කරන්න" required maxLength={160} value={answers.otherProgramme} onChange={e=>set('otherProgramme',e.target.value)}/>}</div>
 <label className="inquiry-field"><span className="question-heading"><i>04</i><Users size={17}/><b>දෙමාපිය / භාරකරුගේ නම <em>*</em></b></span><input required maxLength={120} value={answers.guardian} onChange={e=>set('guardian',e.target.value)} placeholder="දෙමාපිය හෝ භාරකරුගේ නම"/></label>
 <label className="inquiry-field"><span className="question-heading"><i>05</i><CalendarDays size={17}/><b>පන්තිය / දිනය / වේලාව <em>*</em></b></span><input required maxLength={200} value={answers.slot} onChange={e=>set('slot',e.target.value)} placeholder="උදා: Grade 10 • ඉරිදා • පෙ.ව. 8.00"/></label>
 <label className="inquiry-field wide"><span className="question-heading"><i>06</i><MessageCircle size={17}/><b>අමතර පණිවිඩය <small>Optional</small></b></span><textarea rows={3} maxLength={1000} value={answers.message} onChange={e=>set('message',e.target.value)} placeholder="ඔබට දැනගන්න අවශ්‍ය තවත් දෙයක් තියෙනවද?"/></label>
 </div>
 {error&&<p role="alert" className="inquiry-error">{error}</p>}
 <button className="inquiry-preview-toggle" type="button" onClick={()=>setPreview(!preview)}><Check size={16}/>{preview?'පණිවිඩය සඟවන්න':'WhatsApp පණිවිඩය බලන්න'}</button>
 {preview&&<motion.pre initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} className="inquiry-message-preview">{formatInquiryMessage(answers,selection.subject,brand)}</motion.pre>}
 <button className="inquiry-submit" type="submit"><MessageCircle size={21}/> WhatsApp වෙත යන්න</button><p className="inquiry-send-note">WhatsApp පණිවිඩය විවෘත වූ පසු Send ඔබන්න.</p>
 </form></>;
}
