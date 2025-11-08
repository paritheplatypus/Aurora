// imports...
import SolarSystem3D from './modes/SolarSystem3D'
import { Canvas } from '@react-three/fiber'

// inside the default App component:
const [interactive, setInteractive] = useState(false);
const [slug, setSlug] = useState<string|null>(null);

return (
  <div className="min-h-screen relative bg-gradient-to-b from-[#0a0c19] via-[#0a0d1f] to-[#0b1024]">
    <Starfield />
    <Nav onHome={()=>{ setSlug(null); setInteractive(false); }} />
    <div className="fixed right-4 top-16 z-40">
      <button className="glass rounded px-3 py-1 text-sm"
        onClick={()=>setInteractive(v=>!v)}>
        {interactive ? "Exit 3D" : "Launch 3D"}
      </button>
    </div>

    {interactive && (
      <div className="fixed inset-0 z-30">
        <Canvas camera={{ position:[0,6,26], fov:45 }}>
          <SolarSystem3D onSelect={(s)=>{ setInteractive(false); setSlug(s); }} />
        </Canvas>
      </div>
    )}

    {slug ? <Entity slug={slug} back={()=>setSlug(null)} /> : <Home open={setSlug} />}

    {/* footer ... */}
  </div>
);
