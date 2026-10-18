import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Baby, ChevronDown, Cloud, CloudMoon, Heart,
  Lightbulb, Map, Moon, Music2, PackageCheck, Pause, Play, Power, Send, Sparkles, Sun, Volume2,
  VolumeX, X,
} from 'lucide-react';

const projects = [
  { id: 'lullaby', name: 'Lullaby Lab', kind: 'sound studio', icon: Music2, color: 'lavender' },
  { id: 'nightlight', name: 'Nightlight Studio', kind: 'mood maker', icon: Lightbulb, color: 'peach' },
  { id: 'delivery', name: 'Dream Delivery Map', kind: 'field notes', icon: Map, color: 'mint' },
  { id: 'story', name: 'Pip’s origin story', kind: 'the beginning', icon: Baby, color: 'rose' },
];

const scenes = [
  { number: '01', title: 'A little light', text: 'On the quietest night of the year, a tiny star slipped through the nursery window and landed in a bassinet.', icon: Sparkles, sky: 'scene-one' },
  { number: '02', title: 'A very soft landing', text: 'Out tumbled Pip: a curious little skull baby with a nightcap, a pink bow, and an enormous capacity for wonder.', icon: Moon, sky: 'scene-two' },
  { number: '03', title: 'Dreams to share', text: 'Pip found that every sleepy head held a different dream. So he built a tiny dream-delivery service, right from his nursery desk.', icon: Send, sky: 'scene-three' },
];

const lullabies = [
  { name: 'Star drift', notes: [523.25, 659.25, 783.99, 659.25] },
  { name: 'Moon puddle', notes: [392, 493.88, 587.33, 493.88] },
  { name: 'Cloud nine', notes: [440, 554.37, 659.25, 880] },
];

const destinations = [
  { name: 'The Moon Garden', x: 69, y: 33 },
  { name: 'Cloudberry Cove', x: 48, y: 62 },
  { name: 'The Pillow Fort', x: 82, y: 53 },
];
const lights = [
  { name: 'Moon glow', color: '#b7c6ff', mood: 'Moon-soft skies', icon: '☾' },
  { name: 'Berry blush', color: '#e69ab0', mood: 'A rosy little evening', icon: '✿' },
  { name: 'Star gold', color: '#ffd778', mood: 'Golden-hour dreams', icon: '✦' },
  { name: 'Sleepy mint', color: '#b8dbc8', mood: 'A cool, quiet night', icon: '☁' },
];

function PipPortrait({ secret, onTap }) {
  const portraitRef = useRef(null);
  const animationFrameRef = useRef(0);

  useEffect(() => () => {
    window.cancelAnimationFrame(animationFrameRef.current);
  }, []);

  function followPointer(event) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const tilt = Math.max(-3, Math.min(3, ((event.clientX - bounds.left) / bounds.width - 0.5) * 6));
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = window.requestAnimationFrame(() => {
      portraitRef.current?.style.setProperty('--pip-tilt', `${tilt.toFixed(2)}deg`);
    });
  }

  function resetTilt() {
    window.cancelAnimationFrame(animationFrameRef.current);
    portraitRef.current?.style.setProperty('--pip-tilt', '0deg');
  }

  return (
    <button ref={portraitRef} className={`pip-portrait ${secret ? 'pip-secret' : ''}`} onClick={onTap} onPointerMove={followPointer} onPointerLeave={resetTilt} aria-label="Pip, a friendly skull baby wearing a starry nightcap and pink bow" title="Pip says hello">
      <img src="/assets/pip_avatar_cloud.png" alt="" />
      {secret && <span className="secret-star">you found my lucky star!</span>}
    </button>
  );
}

function WindowFrame({ title, subtitle, icon: Icon, onClose, children, className = '' }) {
  return (
    <section className={`window ${className}`} aria-label={title}>
      <div className="window-bar">
        <span className="window-title"><Icon size={15} aria-hidden="true" /> {title}</span>
        <span className="window-subtitle">{subtitle}</span>
        <button className="close-button" onClick={onClose} aria-label={`Close ${title}`}><X size={16} /></button>
      </div>
      {children}
    </section>
  );
}

function App() {
  const [active, setActive] = useState('');
  const [desktopScrollEnabled, setDesktopScrollEnabled] = useState(() => window.location.hash === '#dream-desktop');
  const [night, setNight] = useState(false);
  const [muted, setMuted] = useState(true);
  const [tune, setTune] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lightIndex, setLightIndex] = useState(0);
  const [destination, setDestination] = useState('');
  const [delivered, setDelivered] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState(() => new Set());
  const [filePositions, setFilePositions] = useState({});
  const [draggingFile, setDraggingFile] = useState('');
  const [storyScene, setStoryScene] = useState(0);
  const [storyPlaying, setStoryPlaying] = useState(false);
  const [secret, setSecret] = useState(false);
  const pipTaps = useRef(0);
  const dragState = useRef(null);
  const suppressClickUntil = useRef(0);
  const desktopFilesRef = useRef(null);
  const audioRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
    audioRef.current?.close();
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setActive('');
        setStoryPlaying(false);
      }
      if (active === 'story' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        setStoryScene((current) => Math.max(0, Math.min(scenes.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1))));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  useEffect(() => {
    if (!storyPlaying || active !== 'story') return undefined;
    const timer = window.setInterval(() => setStoryScene((current) => (current + 1) % scenes.length), 3200);
    return () => window.clearInterval(timer);
  }, [active, storyPlaying]);

  function playLullaby() {
    if (muted) {
      setMuted(false);
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioRef.current || audioRef.current.state === 'closed') audioRef.current = new AudioContextClass();
    const context = audioRef.current;
    context.resume();
    setPlaying(true);
    timers.current.forEach(window.clearTimeout);
    timers.current = lullabies[tune].notes.map((frequency, index) => {
      const timer = window.setTimeout(() => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.65);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.68);
        if (index === lullabies[tune].notes.length - 1) setPlaying(false);
      }, index * 360);
      return timer;
    });
  }

  function toggleMute() {
    setMuted((current) => {
      if (audioRef.current) audioRef.current.suspend();
      return !current;
    });
    if (!muted) setPlaying(false);
  }

  function sendDream() {
    if (!destination) return;
    setDelivered(true);
  }

  function beginFileDrag(event, id) {
    if (event.button !== 0) return;
    const file = event.currentTarget;
    const rect = file.getBoundingClientRect();
    dragState.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: filePositions[id] || { x: 0, y: 0 },
      rect,
      didMove: false,
    };
    file.setPointerCapture(event.pointerId);
  }

  function moveFile(event) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.didMove && Math.hypot(deltaX, deltaY) < 6) return;
    drag.didMove = true;
    const bounds = desktopFilesRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = Math.max(
      drag.startPosition.x + bounds.left - drag.rect.left,
      Math.min(drag.startPosition.x + bounds.right - drag.rect.right, drag.startPosition.x + deltaX),
    );
    const y = Math.max(
      drag.startPosition.y + bounds.top - drag.rect.top,
      Math.min(drag.startPosition.y + bounds.bottom - drag.rect.bottom, drag.startPosition.y + deltaY),
    );
    setFilePositions((current) => ({ ...current, [drag.id]: { x, y } }));
    setDraggingFile(drag.id);
  }

  function moveFileByKeyboard(event, id) {
    const directions = {
      ArrowLeft: [-12, 0],
      ArrowRight: [12, 0],
      ArrowUp: [0, -12],
      ArrowDown: [0, 12],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const file = event.currentTarget;
    const bounds = desktopFilesRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const rect = file.getBoundingClientRect();
    const current = filePositions[id] || { x: 0, y: 0 };
    const x = Math.max(current.x + bounds.left - rect.left, Math.min(current.x + bounds.right - rect.right, current.x + direction[0]));
    const y = Math.max(current.y + bounds.top - rect.top, Math.min(current.y + bounds.bottom - rect.bottom, current.y + direction[1]));
    setFilePositions((positions) => ({ ...positions, [id]: { x, y } }));
    setDraggedFiles((files) => new Set(files).add(id));
  }

  function finishFileDrag(event) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.didMove) {
      suppressClickUntil.current = Date.now() + 250;
      setDraggedFiles((current) => new Set(current).add(drag.id));
    }
    dragState.current = null;
    setDraggingFile('');
  }

  function cancelFileDrag() {
    dragState.current = null;
    setDraggingFile('');
  }

  function tapPip() {
    pipTaps.current += 1;
    if (pipTaps.current >= 5) {
      setSecret(true);
      pipTaps.current = 0;
    }
  }

  function openWindow(id) {
    setStoryPlaying(false);
    setActive((current) => current === id ? '' : id);
  }

  function closeWindow() {
    setActive('');
    setStoryPlaying(false);
  }

  const dreamFiles = draggedFiles.size === projects.length
    ? [...projects, { id: 'secret', name: 'SECRET.DRM', kind: 'found in the stars', icon: Sparkles, color: 'gold' }]
    : projects;

  return (
    <main className={`desktop ${night ? 'is-night' : ''} ${lights[lightIndex].name === 'Moon glow' ? 'moon-glow' : ''} ${desktopScrollEnabled ? 'desktop-scroll-enabled' : ''}`} style={{ '--mood-glow': lights[lightIndex].color }}>
      <div className="ambient-orb orb-one" /><div className="ambient-orb orb-two" />
      <header className="menubar">
        <a className="brand" href="#home" aria-label="Pip's Dream OS home"><span className="brand-mark">p</span><span>Pip’s Dream OS</span></a>
        <span className="menu-divider" />
        <button className="menu-link" onClick={() => openWindow('story')}>About Pip</button>
        <a
          className="menu-link desktop-link"
          href="#dream-desktop"
          onClick={(event) => {
            event.preventDefault();
            window.history.pushState(null, '', '#dream-desktop');
            setDesktopScrollEnabled(true);
            requestAnimationFrame(() => {
              document.getElementById("dream-desktop")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        >
          Desktop
        </a>
        <div className="menu-actions">
          <span className="status-pill"><span className="status-dot" /> Nursery is dreaming</span>
          <button className="icon-button sound-toggle" onClick={toggleMute} aria-label={muted ? 'Unmute sound' : 'Mute sound'} title={muted ? 'Sound off' : 'Sound on'}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button className="theme-toggle" onClick={() => setNight((current) => !current)} aria-pressed={night}>
            {night ? <Sun size={15} /> : <Moon size={15} />} <span>{night ? 'Day mode' : 'Night mode'}</span>
          </button>
          <span className="clock">11:11 <Sparkles size={13} /></span>
        </div>
      </header>

      <div className="desktop-layout" id="home">
        <section className="welcome-panel">
          <div className="welcome-copy">
            <div className="eyebrow"><span className="eyebrow-star">✳</span> Welcome to the nursery</div>
            <h1>A little desktop<br />for <span>big dreams.</span></h1>
            <p className="intro">Hi, I’m Pip! I make tiny tools for the lovely things that happen after lights-out.</p>
            <button className="primary-button" onClick={() => openWindow('story')}>Meet Pip <ArrowDownRight size={16} /></button>
            <div className="tiny-caption"><span className="caption-line" /> Made with moon dust &amp; goodnight kisses</div>
          </div>
          <div className="hero-art">
            <div className="hero-spark spark-a">✦</div><div className="hero-spark spark-b">✧</div>
            <div className="hero-planet"><div className="planet-ring" /><span>☾</span></div>
            <div className="hero-halo" />
            <PipPortrait secret={secret} onTap={tapPip} />
            <div className="hello-note"><span>✳</span> hi, dreamer! <ArrowUpRight size={13} /></div>
            <div className="star-label">PIP<br /><small>the dream maker</small></div>
          </div>
          <div className="date-stamp"><span>EST.</span><b>AFTER</b><b>BEDTIME</b><i>✧</i></div>
        </section>

        <section className="desktop-workspace" id="dream-desktop" aria-label="Dream OS applications">
          <div className="workspace-heading">
            <div><span className="section-kicker">THE DREAM DESKTOP</span><h2>Where shall we wander?</h2></div>
            <span className="window-count"><span /> {dreamFiles.length.toString().padStart(2, '0')} little files</span>
          </div>
          <div className="app-grid" ref={desktopFilesRef} onPointerMove={moveFile} onPointerUp={finishFileDrag} onPointerCancel={cancelFileDrag} aria-label="Draggable dream files">
            {dreamFiles.map(({ id, name, kind, icon: Icon, color }, index) => (
              <button
                className={`app-icon ${active === id ? 'selected' : ''} ${draggingFile === id ? 'is-dragging' : ''} ${id === 'secret' ? 'secret-file' : ''}`}
                key={id}
                style={{ '--drag-x': `${filePositions[id]?.x || 0}px`, '--drag-y': `${filePositions[id]?.y || 0}px` }}
                onPointerDown={(event) => beginFileDrag(event, id)}
                onKeyDown={(event) => moveFileByKeyboard(event, id)}
                onClick={(event) => {
                  if (event.detail !== 0 && Date.now() < suppressClickUntil.current) return;
                  openWindow(id);
                }}
                aria-label={`Open ${name}`}
                aria-grabbed={draggingFile === id}
                title="Drag or use arrow keys to rearrange · click to open"
                aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
              >
                <span className={`app-illustration ${color}`}>
                  <Icon size={25} strokeWidth={1.6} />
                  {id === 'lullaby' && <span className="icon-twinkle">✦</span>}
                  {id === 'nightlight' && <span className="lamp-glow" />}
                  {id === 'delivery' && <span className="map-pin">♥</span>}
                  {id === 'story' && <span className="story-heart">♡</span>}
                </span>
                <span className="app-name">{name}</span>
                <span className="app-kind">{kind}</span>
                <span className="app-index">0{index + 1}</span>
              </button>
            ))}
          </div>
          <div className="workspace-bottom">
            <div className="tiny-tip"><Sparkles size={14} /> <span>Dream-file secret: give every icon a little wander.</span></div>
            <span className="desk-version">PIP OS <b>v.01</b></span>
          </div>
        </section>

        <aside className="side-note">
          <div className="note-stamp">PIP’S<br />POSTCARD</div>
          <span className="note-rule" />
          <p>Every dream<br />starts somewhere<br />soft.</p>
          <span className="note-signature">— Pip <Heart size={12} fill="currentColor" /></span>
          <span className="note-doodle">☾</span>
        </aside>

        <div className="dock-wrap">
          <div className="dock" role="toolbar" aria-label="Dream app dock">
            {projects.map(({ id, name, icon: Icon, color }) => (
              <button key={id} className={`dock-item ${active === id ? 'dock-active' : ''}`} onClick={() => openWindow(id)} aria-label={`Open ${name}`} title={name}>
                <span className={`dock-icon ${color}`}><Icon size={20} /></span>
              </button>
            ))}
            <span className="dock-separator" />
            <button className="dock-item power-item" onClick={() => { closeWindow(); setNight(false); }} aria-label="Return to dreamy desktop" title="Desktop"><Power size={18} /></button>
          </div>
          <div className="dock-caption">your little dream tools</div>
        </div>
      </div>

      <footer className="site-footer">
        <span>© Pip’s Dream OS <span className="footer-heart">♡</span></span>
        <span className="footer-credit">Art: official haX.baby Pip pack · Audio: Web Audio API · Icons: Lucide React · Type: Google Fonts</span>
        <button onClick={() => openWindow('story')}>Pip’s story <ArrowUpRight size={12} /></button>
      </footer>

      {active === 'lullaby' && (
        <WindowFrame title="Lullaby Lab" subtitle="SOUND STUDIO  /  001" icon={Music2} onClose={closeWindow} className="project-window lullaby-window">
          <div className="window-content">
            <div className="project-eyebrow">A music box for your imagination</div>
            <h2>Pick a little tune.</h2>
            <p>Choose a melody, then press play. Pip made each one out of soft sine-wave notes.</p>
            <div className="music-box">
              <img className="lullaby-art" src="/assets/pip_lullaby_box.png" alt="Pip’s pastel music box with star chimes" loading="lazy" />
              <div className="music-orbit"><span>♪</span><i>✦</i><b>✧</b><em>·</em></div>
              <div className="music-picks">
                {lullabies.map((item, index) => <button key={item.name} className={`tune-chip ${tune === index ? 'chosen' : ''}`} onClick={() => { setTune(index); setPlaying(false); }}>{item.name}</button>)}
              </div>
              <button className="play-button" onClick={playLullaby}><Play size={15} fill="currentColor" /> {playing ? 'Playing softly…' : muted ? 'Turn sound on to play' : 'Play ' + lullabies[tune].name}</button>
              <span className="music-footnote">{muted ? 'Sound is off — tap the speaker in the top bar to listen.' : 'A tiny, original melody made just for this little window.'}</span>
            </div>
          </div>
        </WindowFrame>
      )}

      {active === 'nightlight' && (
        <WindowFrame title="Nightlight Studio" subtitle="MOOD MAKER  /  002" icon={Lightbulb} onClose={closeWindow} className="project-window">
          <div className="window-content">
            <div className="project-eyebrow">Set the scene before sleep</div>
            <h2>What color is tonight?</h2>
            <p>Tap a light and watch the whole nursery take on a new little mood.</p>
            <div className="nightlight-display" style={{ '--lamp-color': lights[lightIndex].color }}><span className="lamp-bloom" /><img src="/assets/pip_dream_lantern.png" alt="Pip’s glowing crescent moon dream lantern" loading="lazy" /><b>{lights[lightIndex].mood}</b></div>
            <div className="light-options" role="group" aria-label="Choose nightlight color">
              {lights.map((light, index) => <button key={light.name} onClick={() => setLightIndex(index)} className={`light-choice ${lightIndex === index ? 'light-selected' : ''}`} aria-pressed={lightIndex === index} aria-label={light.name} style={{ '--swatch': light.color }}><span>{light.icon}</span><small>{light.name}</small></button>)}
            </div>
            <div className="ambient-help"><Sun size={14} /> These little lights also tint the desktop.</div>
          </div>
        </WindowFrame>
      )}

      {active === 'delivery' && (
        <WindowFrame title="Dream Delivery Map" subtitle="FIELD NOTES  /  003" icon={Map} onClose={closeWindow} className="project-window delivery-window">
          <div className="window-content">
            <div className="project-eyebrow">One dream, packed with care</div>
            <h2>Where should Pip fly?</h2>
            <p>Pick a faraway sleepy place. Pip will send a little goodnight dream your way.</p>
            <div className={`delivery-map ${delivered ? 'has-delivered' : ''}`} role="group" aria-label="Choose Pip's dream delivery destination on the map">
              <span className="map-cloud cloud-left">☁</span><span className="map-cloud cloud-right">☁</span>
              <span className="map-moon">☾</span>
              <svg className="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d={(() => {
                  const selected = destinations.find((place) => place.name === destination);
                  if (!selected) return 'M 16 76 Q 39 30 69 33';
                  return `M 16 76 Q ${(16 + selected.x) / 2 + 8} ${(76 + selected.y) / 2 - 20} ${selected.x} ${selected.y}`;
                })()} />
              </svg>
              <span className="map-house" aria-hidden="true">⌂</span>
              {destinations.map((place, index) => (
                <button
                  className={`map-destination ${destination === place.name ? 'destination-selected' : ''}`}
                  key={place.name}
                  style={{ left: `${place.x}%`, top: `${place.y}%` }}
                  onClick={() => { setDestination(place.name); setDelivered(false); }}
                  aria-label={`Choose ${place.name} on the map`}
                  aria-pressed={destination === place.name}
                >
                  <span>{['✿', '☁', '⌂'][index]}</span>
                  <small>{place.name}</small>
                </button>
              ))}
              <span className={`map-plane ${delivered ? 'plane-delivered' : ''}`} style={delivered ? { left: `${destinations.find((place) => place.name === destination)?.x || 16}%`, top: `${destinations.find((place) => place.name === destination)?.y || 76}%` } : undefined}>{delivered ? '✦' : '✈'}</span>
              <span className="map-place">THE DREAM SKY</span>
            </div>
            <label className="destination-label" htmlFor="dream-destination">Choose a destination</label>
            <div className="destination-row">
              <div className="select-wrap"><select id="dream-destination" value={destination} onChange={(event) => { setDestination(event.target.value); setDelivered(false); }}><option value="">Pick a sleepy place…</option>{destinations.map((place) => <option key={place.name} value={place.name}>{place.name}</option>)}</select><ChevronDown size={15} /></div>
              <button className="send-button" onClick={sendDream} disabled={!destination}><Send size={14} /> Send</button>
            </div>
            {delivered && <p className="delivery-confirm" role="status"><PackageCheck size={16} /> Dream dispatched to {destination}. Sweet travels!</p>}
          </div>
        </WindowFrame>
      )}

      {active === 'story' && (
        <WindowFrame title="Pip’s origin story" subtitle="THE BEGINNING  /  000" icon={Baby} onClose={closeWindow} className="project-window story-window">
          <div className="window-content">
            <div className="project-eyebrow">A story in three sleepy scenes</div>
            <h2>Before the first goodnight.</h2>
            <div className="story-profile">
              <p>Pip is a curious little dream maker, always ready with a soft light and a goodnight wish.</p>
              <img src="/assets/pip_portrait.png" alt="Official portrait of Pip in a starry nightcap and pink bow" loading="lazy" />
            </div>
            <div className="story-scenes" role="group" aria-label="Choose a story scene">
              {scenes.map(({ number, title, icon: Icon, sky }, index) => <button type="button" aria-pressed={storyScene === index} className={`story-scene ${storyScene === index ? 'scene-selected' : ''}`} key={number} onClick={() => { setStoryScene(index); setStoryPlaying(false); }}>
                <span className={`scene-art ${sky}`}><Icon size={25} strokeWidth={1.5} /><span className="scene-doodle">{number === '02' ? '♡' : '✦'}</span></span>
                <span className="scene-number">SCENE {number}</span><span className="scene-title">{title}</span>
              </button>)}
            </div>
            <div className="story-narration" aria-live="polite" key={storyScene}>
              <span className="story-narration-number">SCENE {scenes[storyScene].number}</span>
              <h3>{scenes[storyScene].title}</h3>
              <p>{scenes[storyScene].text}</p>
              <button type="button" className="story-play" onClick={() => setStoryPlaying((current) => !current)}>{storyPlaying ? <Pause size={13} /> : <Play size={13} />} {storyPlaying ? 'Pause story' : 'Play story'}</button>
            </div>
            <div className="story-signoff">And that’s how the dream desk got its very first dreamer. <span>— Pip ✧</span></div>
          </div>
        </WindowFrame>
      )}

      {active === 'secret' && (
        <WindowFrame title="A hidden dream" subtitle="FOUND IN THE STARS  /  ✦" icon={Sparkles} onClose={closeWindow} className="project-window secret-window">
          <div className="window-content">
            <div className="project-eyebrow">A little constellation, just for you</div>
            <h2>You found Pip’s secret dream!</h2>
            <div className="secret-reward">
              <img src="/assets/pip_portrait.png" alt="Pip smiling beneath a crescent moon" />
              <p>Somewhere between the moon garden and the pillow fort, Pip saved one last dream: a sky where every curious click becomes a tiny star.</p>
            </div>
            <button type="button" className="primary-button" onClick={() => setActive('')}>Keep exploring <Sparkles size={14} /></button>
          </div>
        </WindowFrame>
      )}

      <div className="bottom-flourish" aria-hidden="true"><Cloud size={19} /><span>sweet dreams, little internet</span><CloudMoon size={17} /></div>
    </main>
  );
}

export default App;
