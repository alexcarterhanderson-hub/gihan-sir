'use client';

import {useEffect, useRef, useState} from 'react';

type SceneStage = 'voxel' | 'blast' | 'title' | 'laptop' | 'terminal' | 'success' | 'finale' | 'depart';
const sequence: {stage: SceneStage; duration: number}[] = [
  {stage: 'voxel', duration: 3200},
  {stage: 'blast', duration: 850},
  {stage: 'title', duration: 2800},
  {stage: 'laptop', duration: 2600},
  {stage: 'terminal', duration: 2700},
  {stage: 'success', duration: 3600},
  {stage: 'finale', duration: 3200},
  {stage: 'depart', duration: 1100},
];
const errorLines = [
  'FATAL: curiosity exceeded expected limits',
  'ERROR 0x0000: the old code has lost its way',
  'TRACE: searching for a brighter solution...',
  'WARNING: bug detected in the fabric of this world',
  'SYSTEM: awaiting a legendary intervention',
  'ERROR: reality.dll needs a little wonder',
];
const codeLines = [
  'const legend = new SadeeshaJayasinghe();',
  'legend.find(bug);',
  'bug.trace().understand().fix();',
  'runTests({ result: "all green" });',
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
        <div className="legend-voxel-caption"><span>WORLD 01 / THE BLOCKS ARE FALLING</span><strong>A BUG IN THE BLOCKWORLD</strong><small>Five clicks opened a hidden world...</small></div>
      </div>}
      {stage === 'blast' && <div className="legend-blast" aria-hidden="true"><div className="blast-ring"/><div className="blast-core"/><span>✦</span></div>}
      {stage === 'title' && <div className="legend-title-scene">
        <div className="legend-title-orbit" aria-hidden="true"><i/><i/><i/></div>
        <span className="legend-overline">A STORY OF CURIOSITY • COURAGE • CODE</span>
        <h1>The Legend Is Here<br/><em>To Fix the Bug</em></h1>
        <p className="legend-name">The Legend <strong>Sadeesha Jayasinghe</strong> is here.</p>
        <p className="legend-poem">When circuits lose their way,<br/>a brighter mind becomes the dawn.</p>
        <span className="legend-title-star" aria-hidden="true">✳</span>
      </div>}
      {stage === 'laptop' && <div className="legend-laptop-scene" aria-hidden="true">
        <div className="legend-room-glow"/>
        <div className="legend-laptop">
          <div className="legend-laptop-screen"><span>CRITICAL ERROR</span><i/><i/><i/><i/><b>SYSTEM UNSTABLE</b></div>
          <div className="legend-laptop-base"><span/></div>
        </div>
        <div className="legend-desk"/>
        <p>Somewhere in the quiet, a screen is asking for help.</p>
      </div>}
      {(stage === 'terminal' || stage === 'success') && <div className={`legend-terminal-scene ${stage === 'success' ? 'is-success' : ''}`}>
        <div className="legend-terminal-window">
          <div className="legend-terminal-top"><span/><span/><span/><b>{stage === 'success' ? 'LEGENDARY_FIX.exe' : 'SYSTEM_DIAGNOSTICS.exe'}</b></div>
          <div className="legend-terminal-lines">
            {(stage === 'success' ? codeLines : errorLines).map((line, i) => <p key={line} style={{animationDelay: `${i * 0.34}s`}}>{stage === 'success' && <b>✓ </b>}{line}</p>)}
            {stage === 'success' && <strong className="legend-all-clear">ALL SYSTEMS: BRIGHT AND BEAUTIFUL</strong>}
          </div>
        </div>
        <div className="legend-terminal-copy">
          <span>{stage === 'success' ? 'THE REPAIR IS COMPLETE' : 'ENTERING THE MACHINE'}</span>
          <h2>{stage === 'success' ? 'The legend has started—' : 'Every error tells'}<br/><em>{stage === 'success' ? 'where errors end, a new dawn begins.' : 'a story waiting to be rewritten.'}</em></h2>
        </div>
      </div>}
      {stage === 'finale' && <div className="legend-finale">
        <div className="legend-finale-stars" aria-hidden="true">{Array.from({length: 24}, (_, i) => <i key={i} style={{left: `${(i * 41) % 100}%`, top: `${(i * 29) % 100}%`, animationDelay: `${(i % 9) * -0.5}s`}}/>)}</div>
        <span className="legend-overline">THE BUG IS GONE. THE WONDER REMAINS.</span>
        <div className="legend-seal" aria-hidden="true">✳</div>
        <h2>This website is created by<br/><strong>the Legend Called<br/>Sadeesha Jayasinghe</strong></h2>
        <p>May every line you write<br/>leave the world a little brighter.</p>
        <span className="legend-finale-signoff">— WITH CURIOSITY, ALWAYS —</span>
      </div>}
      {stage === 'depart' && <div className="legend-depart" aria-hidden="true"><span>✦</span><span>✳</span><span>✧</span></div>}
    </div>
  );
}
