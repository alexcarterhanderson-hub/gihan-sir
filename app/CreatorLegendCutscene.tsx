'use client';

import {useEffect, useRef, useState} from 'react';

type SceneStage = 'voxel' | 'blast' | 'title' | 'portal' | 'laptop' | 'terminal' | 'success' | 'finale' | 'depart';
const sequence: {stage: SceneStage; duration: number}[] = [
  {stage: 'voxel', duration: 8200},
  {stage: 'blast', duration: 1450},
  {stage: 'title', duration: 7200},
  {stage: 'portal', duration: 5600},
  {stage: 'laptop', duration: 7600},
  {stage: 'terminal', duration: 7600},
  {stage: 'success', duration: 8500},
  {stage: 'finale', duration: 7800},
  {stage: 'depart', duration: 1500},
];
const errorLines = [
  'FATAL: curiosity exceeded expected limits',
  'ERROR 0x0000: the old code has lost its way',
  'TRACE: searching the last known good memory...',
  'WARNING: a bug is hiding in plain sight',
  'SYSTEM: every broken line has a story',
  'DIAGNOSTIC: patience is still online',
  'SEARCH: courage found in the quiet between keystrokes',
  'SYSTEM: awaiting a legendary intervention',
  'ERROR: reality.dll needs a little wonder',
];
const codeLines = [
  'const legend = new SadeeshaJayasinghe();',
  'legend.listen(toTheProblem);',
  'const bug = trace(theUnexpected);',
  'bug.understand().repair().release();',
  'runTests({ result: "all green" });',
  'restore({ wonder: true, hope: true });',
  'shipWithCuriosity();',
];

export default function CreatorLegendCutscene({open, onComplete}: {open: boolean; onComplete: () => void}) {
  const [stage, setStage] = useState<SceneStage>('voxel');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let timer = 0;
    let index = 0;
    const advance = () => {
      const step = sequence[index];
      if (!step) {
        onCompleteRef.current();
        return;
      }
      setStage(step.stage);
      index += 1;
      timer = window.setTimeout(advance, step.duration);
    };
    advance();
    const skip = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCompleteRef.current();
    };
    window.addEventListener('keydown', skip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', skip);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="legend-cutscene" data-stage={stage} role="dialog" aria-modal="true" aria-label="The Legend Sadeesha Jayasinghe">
      <button className="legend-skip" onClick={onComplete} aria-label="Skip the legend animation">Skip <span aria-hidden="true">↗</span></button>
      {stage === 'voxel' && <div className="legend-voxel-world" aria-hidden="true">
        <div className="legend-world-sun"/>
        <div className="legend-block-horizon"/>
        <div className="legend-voxel-floor"/>
        {Array.from({length: 34}, (_, i) => <span key={i} className={`legend-cube cube-${i % 5}`} style={{left: `${(i * 37) % 100}%`, top: `${12 + (i * 23) % 66}%`, animationDelay: `${(i % 8) * -0.37}s`}}/>)}
        {Array.from({length: 5}, (_, i) => <span key={i} className="legend-tnt" style={{left: `${12 + i * 19}%`, animationDelay: `${i * 0.32}s`}}><b>TNT</b></span>)}
        <div className="legend-world-hud"><span>FIELD NOTES <b>01 / 04</b></span><i/><small>WORLD STATUS <strong>UNSTABLE</strong></small><small>QUEST <strong>FIND THE BUG</strong></small></div>
        <div className="legend-crosshair" aria-hidden="true"><i/><i/></div>
        <div className="legend-voxel-caption"><span>CHAPTER I — THE BLOCKWORLD</span><strong>A BUG IN THE BLOCKWORLD</strong><small>Five clicks opened a hidden world.<br/>The ground trembles. Something is falling from the sky.</small></div>
      </div>}
      {stage === 'blast' && <div className="legend-blast" aria-hidden="true"><div className="blast-ring"/><div className="blast-core"/><span>✦</span></div>}
      {stage === 'title' && <div className="legend-title-scene">
        <div className="legend-title-orbit" aria-hidden="true"><i/><i/><i/></div>
        <span className="legend-overline">A STORY OF CURIOSITY • COURAGE • CODE</span>
        <h1>The Legend Is Here<br/><em>To Fix the Bug</em></h1>
        <p className="legend-name">The Legend <strong>Sadeesha Jayasinghe</strong> is here.</p>
        <p className="legend-poem">When circuits lose their way,<br/>a brighter mind becomes the dawn.</p>
        <span className="legend-title-prompt">A small spark. A brave question. A world made whole.</span>
        <span className="legend-title-star" aria-hidden="true">✳</span>
      </div>}
      {stage === 'portal' && <div className="legend-portal-scene">
        <div className="legend-portal-stars" aria-hidden="true">{Array.from({length: 34}, (_, i) => <i key={i} style={{left: `${(i * 31) % 100}%`, top: `${(i * 47) % 100}%`, animationDelay: `${(i % 7) * -.6}s`}}/>)}</div>
        <div className="legend-portal-rings" aria-hidden="true"><i/><i/><i/><span/></div>
        <div className="legend-portal-copy"><span>CHAPTER II — THROUGH THE SIGNAL</span><h2>Beyond the blocks,<br/><em>a little light is waiting.</em></h2><p>Follow the red glow through the dark.<br/>Every error is a doorway to understanding.</p><small>CONNECTING TO THE MACHINE <b>•••</b></small></div>
        <div className="legend-portal-floor" aria-hidden="true"/>
      </div>}
      {stage === 'laptop' && <div className="legend-laptop-scene" aria-hidden="true">
        <div className="legend-room-glow"/>
        <div className="legend-room-dust" aria-hidden="true">{Array.from({length: 18}, (_, i) => <i key={i} style={{left: `${(i * 43) % 100}%`, top: `${(i * 29) % 80}%`, animationDelay: `${(i % 8) * -.4}s`}}/>)}</div>
        <div className="legend-laptop">
          <div className="legend-laptop-screen"><span>CRITICAL ERROR</span><i/><i/><i/><i/><b>SYSTEM UNSTABLE</b></div>
          <div className="legend-laptop-base"><span/></div>
        </div>
        <div className="legend-desk"/>
        <div className="legend-laptop-caption"><span>CHAPTER III — THE LAST LIGHT ON</span><p>Somewhere in the quiet,<br/>a screen is asking for help.</p><small>SCANNING FOR A WAY FORWARD</small></div>
      </div>}
      {(stage === 'terminal' || stage === 'success') && <div className={`legend-terminal-scene ${stage === 'success' ? 'is-success' : ''}`}>
        <div className="legend-terminal-window">
          <div className="legend-terminal-top"><span/><span/><span/><b>{stage === 'success' ? 'LEGENDARY_FIX.exe' : 'SYSTEM_DIAGNOSTICS.exe'}</b></div>
          <div className="legend-terminal-lines">
            {(stage === 'success' ? codeLines : errorLines).map((line, i) => <p key={line} style={{animationDelay: `${i * (stage === 'success' ? 0.72 : 0.62)}s`}}>{stage === 'success' && <b>✓ </b>}{line}</p>)}
            {stage === 'success' && <strong className="legend-all-clear">ALL SYSTEMS: BRIGHT AND BEAUTIFUL</strong>}
            {stage === 'terminal' && <small className="legend-terminal-prompt">TYPE <b>hope</b> TO CONTINUE <i>▌</i></small>}
          </div>
        </div>
        <div className="legend-terminal-copy">
          <span>{stage === 'success' ? 'CHAPTER V — THE REPAIR IS COMPLETE' : 'CHAPTER IV — INSIDE THE MACHINE'}</span>
          <h2>{stage === 'success' ? 'The legend has started—' : 'Every error tells'}<br/><em>{stage === 'success' ? 'where errors end, a new dawn begins.' : 'a story waiting to be rewritten.'}</em></h2>
          <p>{stage === 'success' ? 'One careful line at a time, the dark gives way to green.' : 'No panic. No shortcuts. Just one curious mind, finding the truth.'}</p>
        </div>
      </div>}
      {stage === 'finale' && <div className="legend-finale">
        <div className="legend-finale-stars" aria-hidden="true">{Array.from({length: 24}, (_, i) => <i key={i} style={{left: `${(i * 41) % 100}%`, top: `${(i * 29) % 100}%`, animationDelay: `${(i % 9) * -0.5}s`}}/>)}</div>
        <span className="legend-overline">THE BUG IS GONE. THE WONDER REMAINS.</span>
        <div className="legend-seal" aria-hidden="true">✳</div>
        <h2>This website is created by<br/><strong>the Legend Called<br/>Sadeesha Jayasinghe</strong></h2>
        <p>May every line you write<br/>leave the world a little brighter.</p>
        <div className="legend-finale-poem">For every tangled thread, a patient hand;<br/>for every night, a dawn that understands.</div>
        <span className="legend-finale-signoff">— WITH CURIOSITY, ALWAYS —</span>
      </div>}
      {stage === 'depart' && <div className="legend-depart" aria-hidden="true"><span>✦</span><span>✳</span><span>✧</span></div>}
    </div>
  );
}
