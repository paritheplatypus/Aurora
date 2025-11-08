import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Stars, Sparkles, Telescope } from 'lucide-react'
import { sfx } from './sfx'
import { useBadges } from './badges'
import { useTour } from './tour'
import { Howler } from "howler"
import entitiesData from '../public/data/entities.json'
import Starfield from './components/Starfield'
import { useGrandTour } from './store/grandTour'
import { useRouteTour } from './store/routeTour'
import SolarSystem3D from './modes/SolarSystem3D'

type Entity = typeof entitiesData[number]

function Nav({ onHome, onToggle3D, interactive }: { onHome: () => void, onToggle3D: () => void, interactive: boolean }) {
  const [muted, setMuted] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem("muted") || "false"); } catch { return false; }
  });
  useEffect(() => {
    Howler.mute(muted);
    localStorage.setItem("muted", JSON.stringify(muted));
  }, [muted]);

  return (
    <div className="sticky top-0 z-40 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-white/90" />
          <button className="font-semibold tracking-wide" onClick={onHome}>AURORA</button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md px-3 py-1 text-sm glass hover:bg-white/10"
            onClick={() => setMuted(m => !m)}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            className="rounded-md px-3 py-1 text-sm glass hover:bg-white/10"
            onClick={() => { sfx.woosh.play(); onToggle3D(); }}
            title={interactive ? "Exit Interactive Mode" : "Launch Interactive Mode"}
          >
            {interactive ? "Exit 3D" : "Launch 3D"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({children}:{children: any}){
  return <div className='glass rounded-xl p-4'>{children}</div>
}

function Home({ open }: { open: (slug:string)=>void }) {
  const grandTour = useGrandTour();
  const route = useRouteTour();

  // entities first, then derive available slugs
  const entities: Entity[] = entitiesData as any
  const availableSlugs = entities.map(e => e.slug);

  // Defaults that make sense for a demo
  const [fromSlug, setFromSlug] = useState<string>(availableSlugs[0] || "");
  const [toSlug, setToSlug] = useState<string>(availableSlugs[availableSlugs.length - 1] || "");

  return (
    <section className='relative mx-auto max-w-6xl px-4 pt-12 pb-12'>
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.6}} className='mx-auto max-w-3xl text-center'>
        <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 shadow-sm'>
          <Sparkles className='h-3.5 w-3.5' /> A serene interface for cosmic explorers
        </div>
        <h1 id='hero-title' className='mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl'>
          Elegance among the <span className='bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent'>stars</span>
        </h1>
        <p className='mx-auto mt-4 max-w-2xl text-white/70 md:text-lg'>
          Explore curated worlds—interactive, tactile, and fast.
        </p>
      </motion.div>

      {/* Route Mode panel (bidirectional) */}
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr_auto_auto] items-center justify-center max-w-3xl mx-auto">
        <select
          className="glass rounded-md px-3 py-2 text-sm"
          value={fromSlug}
          onChange={e => setFromSlug(e.target.value)}
        >
          {availableSlugs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <span className="mx-2 text-white/60 text-sm text-center">to</span>

        <select
          className="glass rounded-md px-3 py-2 text-sm"
          value={toSlug}
          onChange={e => setToSlug(e.target.value)}
        >
          {availableSlugs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <span className="hidden sm:inline-block mx-2 text-white/30">|</span>

        <button
          className="glass rounded-md px-4 py-2 text-sm hover:bg-white/10"
          onClick={() => {
            sfx.woosh.play();
            route.start(fromSlug, toSlug, availableSlugs);
            // open starting body immediately
            if (fromSlug) open(fromSlug);
          }}
        >
          Start Route
        </button>
      </div>

      <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {entities.map(e => (
          <motion.button
            key={e.slug}
            data-slug={e.slug}
            onClick={()=>{sfx.woosh.play(); open(e.slug)}}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className='text-left'
          >
            <Card>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-full' style={{background: `radial-gradient(circle at 40% 35%, ${e.heroColor}, transparent 60%), #1b2340`}} />
                <div>
                  <div className='font-medium'>{e.title}</div>
                  <div className='text-xs text-white/60'>{e.tags?.join(' • ')}</div>
                </div>
              </div>
            </Card>
          </motion.button>
        ))}
      </div>

      <div className='mt-8 grid gap-4 md:grid-cols-3'>
        <Card><div className='flex items-center gap-2'><Telescope className='h-4 w-4'/>Deep Sky Mode</div><p className='text-sm text-white/70 mt-2'>Glassy dark theme with soft gradients.</p></Card>
        <Card><div className='flex items-center gap-2'><Stars className='h-4 w-4'/>Orbital Layouts</div><p className='text-sm text-white/70 mt-2'>Radial grouping and orbit rings.</p></Card>
        <Card><div className='flex items-center gap-2'><Sparkles className='h-4 w-4'/>Parallax Flow</div><p className='text-sm text-white/70 mt-2'>Subtle motion cues to guide attention.</p></Card>
      </div>
    </section>
  )
}

function CardWrap({children}:{children:any}){ return <div className='glass rounded-xl p-4'>{children}</div> } // (kept for consistency if needed)

function OrbitScrubber({ color }: { color: string }){
  const [angle, setAngle] = useState(0)
  const r = 100
  const cx=140, cy=110
  const rad = angle * Math.PI / 180
  const x = cx + r * Math.cos(rad)
  const y = cy + r * Math.sin(rad)
  const dist = (1 + 0.3*Math.cos(rad))
  return (
    <div className='glass rounded-xl p-4'>
      <div className='flex items-center justify-between mb-2'>
        <div className='font-medium'>Orbit Scrubber</div>
        <input type='range' min={0} max={360} value={angle} onChange={e=>setAngle(parseInt(e.target.value))}/>
      </div>
      <svg viewBox='0 0 300 220' className='w-full h-56'>
        <defs>
          <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='3' result='coloredBlur'/>
            <feMerge><feMergeNode in='coloredBlur'/><feMergeNode in='SourceGraphic'/></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} stroke='rgba(255,255,255,0.25)' strokeWidth='1.5' fill='none' />
        <circle cx={x} cy={y} r='14' fill={color} filter='url(#glow)' />
        <circle cx={cx} cy={cy} r='6' fill='white' />
      </svg>
      <div className='text-xs text-white/70'>Scrub along the orbit. Dist factor: {dist.toFixed(2)}</div>
    </div>
  )
}

function Entity({ slug, back }: { slug: string, back: () => void }){
  const e: Entity | undefined = (entitiesData as any).find((x:Entity)=>x.slug===slug)
  const { award, has } = useBadges()
  const { start, ensureAIGenerated, activeStep, steps, next, reset } = useTour(e)

  // Route store access for reroute / prev / next
  const route = useRouteTour();
  const allEntities: Entity[] = entitiesData as any;
  const availableSlugs = allEntities.map(e => e.slug);

  // helper: navigate to a slug from inside Entity by “clicking” the Home card
  const openBySlug = (targetSlug: string) => {
    back();
    setTimeout(() => {
      (document.querySelector(`[data-slug="${targetSlug}"]`) as HTMLButtonElement)?.click();
    }, 40);
  };

  useEffect(()=>{
    award('tourist')
  },[])

  if(!e) return <div className='p-6'>Not found.</div>
  return (
    <section className='mx-auto max-w-4xl px-4 pt-6 pb-16'>
      <button className='text-sm opacity-80 hover:opacity-100' onClick={()=>{sfx.woosh.play(); back()}}>← Back</button>
      <div className='mt-4 flex items-center gap-3'>
        <div className='h-6 w-6 rounded-full' style={{background:e.heroColor}}/>
        <h2 className='text-2xl font-semibold'>{e.title}</h2>
        {has('tourist') && <span className='text-xs glass rounded px-2 py-0.5'>Badge: Tourist</span>}
      </div>
      <div className='mt-4 grid gap-4 md:grid-cols-2'>
        <div className='glass rounded-xl p-4'>
          <div className='text-sm text-white/70'>
            {e.sections[0]?.md}
          </div>
        </div>
        <OrbitScrubber color={e.heroColor} />
      </div>

      {/* Route controls: reroute + prev/next */}
      <div className='mt-4 flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-white/60'>Reroute to:</span>
          <select
            className='glass rounded px-2 py-1 text-xs'
            value={route.to ?? slug}
            onChange={e => {
              route.reroute(e.target.value, availableSlugs);
              const first = route.current();
              if (first) { sfx.woosh.play(); openBySlug(first); }
            }}
          >
            {availableSlugs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <button
            className='glass rounded px-3 py-1'
            onClick={() => {
              route.prev();
              const prevSlug = route.current();
              if (prevSlug) { sfx.woosh.play(); openBySlug(prevSlug); }
            }}
          >
            ← Previous stop
          </button>
          <button
            className='glass rounded px-3 py-1'
            onClick={() => {
              route.next();
              const nextSlug = route.current();
              if (nextSlug) { sfx.woosh.play(); openBySlug(nextSlug); }
            }}
          >
            Next stop →
          </button>
        </div>
      </div>

      <div className='mt-6 flex items-center gap-3'>
        <button className='glass rounded px-3 py-1' onClick={async()=>{ await ensureAIGenerated(); start(); sfx.chime.play(); }}>Start Guided Tour (AI)</button>
        <a className='text-xs opacity-70 hover:opacity-100' href={e.sources?.[0]} target='_blank'>Source</a>
      </div>

      {/* Tour overlay */}
      {activeStep>=0 && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='glass max-w-lg mx-4 rounded-xl p-4'>
            <div className='text-sm opacity-80'>Step {activeStep+1} / {steps.length}</div>
            <div className='mt-2 text-lg'>{steps[activeStep].text}</div>
            <div className='mt-4 flex justify-end gap-2'>
              <button className='px-3 py-1 rounded glass' onClick={()=>{ reset() }}>Close</button>
              <button
                className='px-3 py-1 rounded glass'
                onClick={()=>{
                  if (activeStep + 1 === steps.length) {
                    // Finished this body's AI tour: auto-advance route if active
                    reset();
                    if (route.active && !route.atEnd()) {
                      route.next();
                      const nextSlug = route.current();
                      if (nextSlug) { sfx.chime.play(); openBySlug(nextSlug); }
                    } else {
                      sfx.chime.play();
                    }
                  } else {
                    next();
                    sfx.woosh.play();
                  }
                }}
              >
                {activeStep+1===steps.length?'Finish':'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default function App(){
  const [slug, setSlug] = useState<string | null>(null)
  const [interactive, setInteractive] = useState<boolean>(false)

  return (
    <div className='min-h-screen relative bg-gradient-to-b from-[#0a0c19] via-[#0a0d1f] to-[#0b1024]'>
      {/* Hide starfield when interactive 3D is active */}
      {!interactive && <Starfield />}

      <Nav onHome={()=>setSlug(null)} onToggle3D={()=>setInteractive(i=>!i)} interactive={interactive} />

      {/* Interactive 3D layer */}
      {interactive && (
        <SolarSystem3D
          entities={entitiesData as any}
          onSelect={(slug)=>{ sfx.woosh.play(); setInteractive(false); setSlug(slug); }}
          onExit={()=>setInteractive(false)}
        />
      )}

      {/* Classic UI */}
      {!interactive && (
        slug ? <Entity slug={slug} back={()=>setSlug(null)} /> : <Home open={setSlug} />
      )}

      <footer className='border-t border-white/10 bg-black/30'>
        <div className='mx-auto max-w-6xl px-4 py-8 text-xs text-white/70'>
          © {new Date().getFullYear()} Aurora Interface Lab
        </div>
      </footer>
    </div>
  )
}
