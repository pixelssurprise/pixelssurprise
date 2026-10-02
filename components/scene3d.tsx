"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";

const GOLD = "#e5c575";
const WINE = "#4a0d28";

const ramp = (x: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------- Phone screens (invitation + surprise), drawn once ---------- */
function makeScreenTexture(kind: "invite" | "surprise") {
  const W = 700;
  const H = 1450;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const spacing = (v: string) => {
    (g as unknown as { letterSpacing: string }).letterSpacing = v;
  };
  const text = (s: string, y: number, font: string, color: string, ls = "0px") => {
    g.font = font;
    g.fillStyle = color;
    g.textAlign = "center";
    spacing(ls);
    g.fillText(s, W / 2, y);
  };
  const panel = (x: number, y: number, w: number, h: number) => {
    g.fillStyle = "rgba(255,255,255,0.05)";
    g.strokeStyle = "rgba(229,197,117,0.4)";
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(x, y, w, h, 24);
    g.fill();
    g.stroke();
  };
  const ornament = (y: number) => {
    g.strokeStyle = GOLD;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(210, y); g.lineTo(315, y);
    g.moveTo(385, y); g.lineTo(490, y);
    g.stroke();
    g.fillStyle = GOLD;
    g.beginPath();
    g.moveTo(350, y - 12); g.lineTo(362, y); g.lineTo(350, y + 12); g.lineTo(338, y);
    g.closePath();
    g.fill();
  };

  g.beginPath();
  g.roundRect(0, 0, W, H, 50);
  g.clip();

  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#430b22");
  bg.addColorStop(0.5, "#1e0510");
  bg.addColorStop(1, "#0a0105");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, 440, 0, W / 2, 440, 480);
  glow.addColorStop(0, "rgba(224,82,122,0.32)");
  glow.addColorStop(1, "rgba(224,82,122,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);

  g.strokeStyle = "rgba(229,197,117,0.75)";
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(35, 35, W - 70, H - 70, 35);
  g.stroke();

  if (kind === "invite") {
    text("ROYAL INVITATION", 170, "600 28px Georgia, serif", GOLD, "8px");
    ornament(225);
    text("Aarav", 400, "italic 130px Georgia, serif", "#fff8ec");
    text("&", 485, "italic 70px Georgia, serif", "#f08fae");
    text("Meera", 610, "italic 130px Georgia, serif", "#fff8ec");
    text("invite you to celebrate", 700, "italic 30px Georgia, serif", "rgba(255,248,236,0.8)");
    text("their wedding", 742, "italic 30px Georgia, serif", "rgba(255,248,236,0.8)");
    panel(70, 810, W - 140, 190);
    text("14 FEB 2027", 890, "600 46px Georgia, serif", GOLD, "6px");
    text("Jaipur Palace, 7:00 PM", 945, "28px Georgia, serif", "rgba(255,248,236,0.75)", "1px");
    text("RSVP and guestbook included", 1075, "italic 26px Georgia, serif", "#f08fae", "1px");
  } else {
    text("CUSTOM SURPRISE KEEPSAKE", 170, "600 26px Georgia, serif", GOLD, "6px");
    ornament(225);
    text("Happy Birthday", 385, "italic 84px Georgia, serif", "#fff8ec");
    text("Ananya", 545, "italic 150px Georgia, serif", "#f6d9a0");
    text("Unlockable vault of memories", 625, "italic 30px Georgia, serif", "#f08fae");
    panel(70, 700, W - 140, 340);
    text("Photo milestones and letters", 770, "600 28px Georgia, serif", GOLD, "2px");
    const tints = ["rgba(224,82,122,0.55)", "rgba(229,197,117,0.5)", "rgba(240,143,174,0.5)"];
    tints.forEach((col, i) => {
      g.fillStyle = col;
      g.beginPath();
      g.roundRect(100 + i * 175, 805, 150, 130, 14);
      g.fill();
    });
    text("\u201COur favorite coffee date in Pune\u201D", 990, "italic 26px Georgia, serif", "rgba(255,248,236,0.85)");
    text("Now playing: Romantic melodies", 1090, "26px Georgia, serif", "#f08fae", "1px");
  }

  const btn = g.createLinearGradient(110, 0, W - 110, 0);
  btn.addColorStop(0, "#f06a92");
  btn.addColorStop(1, "#b8325c");
  g.fillStyle = btn;
  g.beginPath();
  g.roundRect(110, 1180, W - 220, 96, 48);
  g.fill();
  text(kind === "invite" ? "Open Invitation" : "Open Surprise", 1242, "600 34px Georgia, serif", "#ffffff", "2px");
  text("PixelsSurprise", 1360, "22px Georgia, serif", "rgba(229,197,117,0.7)", "5px");

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

/* ---------- Small love letter that slides out of the envelope ---------- */
function makeLetterTexture() {
  const W = 520;
  const H = 320;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff7e6";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "#c9a24f";
  g.lineWidth = 3;
  g.strokeRect(14, 14, W - 28, H - 28);
  g.lineWidth = 1;
  g.strokeRect(24, 24, W - 48, H - 48);
  g.textAlign = "center";
  g.fillStyle = WINE;
  g.font = "italic 84px Georgia, serif";
  g.fillText("For You", W / 2, 150);
  g.fillStyle = "#e0527a";
  g.beginPath();
  g.moveTo(260, 270);
  g.bezierCurveTo(200, 230, 212, 178, 245, 192);
  g.bezierCurveTo(255, 196, 260, 204, 260, 208);
  g.bezierCurveTo(260, 204, 265, 196, 275, 192);
  g.bezierCurveTo(308, 178, 320, 230, 260, 270);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ---------- Phone: the screen cross-fades between two experiences ---------- */
function Phone({ x = 0.9 }: { x?: number }) {
  const ref = useRef<THREE.Group>(null!);
  const matB = useRef<THREE.MeshBasicMaterial>(null!);
  const [texA, texB] = useMemo(() => [makeScreenTexture("invite"), makeScreenTexture("surprise")], []);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    ref.current.rotation.y = -0.2 + Math.sin(t * 0.4) * 0.12 + pointer.x * 0.15;
    ref.current.rotation.x = 0.05 - pointer.y * 0.06;
    ref.current.position.y = Math.sin(t * 0.9) * 0.05;
    matB.current.opacity = ramp(Math.sin(t * 0.7), -0.06, 0.06);
  });

  return (
    <group ref={ref} position={[x, 0, 0]}>
      <RoundedBox args={[1.55, 3.1, 0.15]} radius={0.18} smoothness={8}>
        <meshStandardMaterial color={GOLD} metalness={0.95} roughness={0.2} envMapIntensity={1.6} />
      </RoundedBox>
      <RoundedBox args={[1.47, 3.02, 0.16]} radius={0.16} smoothness={8}>
        <meshStandardMaterial color="#110509" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0, 0.084]}>
        <planeGeometry args={[1.4, 2.9]} />
        <meshBasicMaterial map={texA} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.0845]}>
        <planeGeometry args={[1.4, 2.9]} />
        <meshBasicMaterial ref={matB} map={texB} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------- Envelope: flap opens, letter slides out, then closes again ---------- */
function Envelope() {
  const flap = useRef<THREE.Group>(null!);
  const card = useRef<THREE.Mesh>(null!);
  const letterTex = useMemo(makeLetterTexture, []);

  const pocketGeo = useMemo(() => {
    const L = new THREE.Shape();
    L.moveTo(-0.75, 0.5); L.lineTo(0, -0.02); L.lineTo(-0.75, -0.5); L.closePath();
    const R = new THREE.Shape();
    R.moveTo(0.75, 0.5); R.lineTo(0.75, -0.5); R.lineTo(0, -0.02); R.closePath();
    const B = new THREE.Shape();
    B.moveTo(-0.75, -0.5); B.lineTo(0, -0.02); B.lineTo(0.75, -0.5); B.closePath();
    return new THREE.ShapeGeometry([L, R, B]);
  }, []);

  const flapGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.75, 0); s.lineTo(0.75, 0); s.lineTo(0, -0.58); s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);

  useFrame(({ clock }) => {
    const c = clock.elapsedTime % 7;
    const open = ramp(c, 1.2, 2.4) - ramp(c, 5.8, 6.8);
    const letter = ramp(c, 2.4, 3.6) - ramp(c, 5.0, 5.8);
    flap.current.rotation.x = -open * Math.PI * 0.97;
    flap.current.position.z = 0.03 - 0.07 * ramp(open, 0.3, 0.6);
    card.current.position.y = -0.08 + letter * 0.66;
  });

  return (
    <group>
      {/* back */}
      <mesh>
        <boxGeometry args={[1.5, 1.0, 0.03]} />
        <meshStandardMaterial color="#efd9b2" roughness={0.7} />
      </mesh>
      {/* letter */}
      <mesh ref={card} position={[0, -0.08, 0.02]}>
        <planeGeometry args={[1.3, 0.8]} />
        <meshBasicMaterial map={letterTex} toneMapped={false} />
      </mesh>
      {/* front pocket */}
      <mesh geometry={pocketGeo} position={[0, 0, 0.026]}>
        <meshStandardMaterial color="#e8d0a3" roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* flap, hinged on the top edge */}
      <group ref={flap} position={[0, 0.5, 0.03]}>
        <mesh geometry={flapGeo}>
          <meshStandardMaterial color="#dfc590" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.43, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
          <meshStandardMaterial color={WINE} roughness={0.3} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- Glossy pearl balls in the logo's rose-gold palette ---------- */
function GlossBall({
  position,
  scale,
  color,
  emissive,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  emissive: string;
}) {
  return (
    <Float speed={1.6} rotationIntensity={0} floatIntensity={0.9}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.45}
          metalness={0.55}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.3}
        />
      </mesh>
    </Float>
  );
}

function World({ compact }: { compact: boolean }) {
  const { viewport } = useThree();
  const s = Math.min(1, viewport.width / 4.7);

  // Phones: one clean centred phone, no extra objects
  if (compact) {
    return (
      <group>
        <Phone x={0} />
        <Sparkles count={18} scale={[3.4, 4, 2]} size={2.4} speed={0.25} color="#fce2a3" opacity={0.85} />
      </group>
    );
  }

  return (
    <group scale={s}>
      <Phone />
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
        <group position={[-1.2, -0.8, 0.4]} rotation={[0.08, 0.3, -0.06]} scale={1.1}>
          <Envelope />
        </group>
      </Float>
      <GlossBall position={[-1.3, 1.25, 0.2]} scale={0.9} color="#d9a1a7" emissive="#7a3f4a" />
      <GlossBall position={[-0.3, 1.95, -0.3]} scale={0.38} color="#ecd39e" emissive="#7a6130" />
      <GlossBall position={[-2.05, 0.5, -0.2]} scale={0.28} color="#f4cfd6" emissive="#8a5560" />
      <Sparkles count={40} scale={[6, 5, 4]} size={2.6} speed={0.3} color="#fce2a3" opacity={0.9} />
    </group>
  );
}

export default function Scene3D() {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setCompact(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Canvas
      key={compact ? "mobile" : "desktop"}
      camera={{ position: [0, 0, compact ? 7.4 : 8.4], fov: 30 }}
      dpr={compact ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 6]} intensity={1.6} color="#fff8ec" />
      <pointLight position={[-4, 2, -2]} intensity={30} color="#ff5c8d" />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 6, 4]} scale={[10, 3, 1]} color="#fff3df" />
        <Lightformer form="rect" intensity={3} position={[-6, 2, 2]} scale={[3, 8, 1]} color="#ff9db9" />
        <Lightformer form="rect" intensity={3} position={[6, 2, 2]} scale={[3, 8, 1]} color="#f2d48f" />
        <Lightformer form="circle" intensity={2} position={[0, 0, 9]} scale={10} color="#ffe6ec" />
      </Environment>

      <World compact={compact} />
    </Canvas>
  );
}