import React from 'react';
import Svg, { Circle, Rect, Path, Ellipse, G, Line, Polygon } from 'react-native-svg';

type I = (c: string) => React.ReactNode;

// ── EMOTIONS ──────────────────────────────────────────────────────────────────
const happy: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFD5A8" />
  <Ellipse cx="35" cy="59" rx="7" ry="5" fill="#FF9B9B" opacity={0.45} />
  <Ellipse cx="65" cy="59" rx="7" ry="5" fill="#FF9B9B" opacity={0.45} />
  <Circle cx="40" cy="46" r="4" fill="#2D1B0E" /><Circle cx="42" cy="44" r="1.5" fill="#fff" />
  <Circle cx="60" cy="46" r="4" fill="#2D1B0E" /><Circle cx="62" cy="44" r="1.5" fill="#fff" />
  <Path d="M38,57 Q50,68 62,57" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
</>);

const sad: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFD5A8" />
  <Circle cx="40" cy="45" r="4" fill="#2D1B0E" />
  <Circle cx="60" cy="45" r="4" fill="#2D1B0E" />
  <Path d="M38,56 Q41,49 44,52" stroke="#888" strokeWidth="1.5" fill="none" />
  <Path d="M56,52 Q59,49 62,56" stroke="#888" strokeWidth="1.5" fill="none" />
  <Path d="M38,63 Q50,54 62,63" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <Ellipse cx="42" cy="58" rx="3" ry="4" fill="#88CCFF" opacity={0.7} />
</>);

const angry: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFCCA8" />
  <Path d="M34,40 L44,46" stroke="#2D1B0E" strokeWidth="2.5" strokeLinecap="round" />
  <Path d="M56,46 L66,40" stroke="#2D1B0E" strokeWidth="2.5" strokeLinecap="round" />
  <Circle cx="40" cy="48" r="4" fill="#2D1B0E" />
  <Circle cx="60" cy="48" r="4" fill="#2D1B0E" />
  <Path d="M38,62 Q50,53 62,62" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <Ellipse cx="35" cy="58" rx="7" ry="5" fill="#FF6B6B" opacity={0.4} />
  <Ellipse cx="65" cy="58" rx="7" ry="5" fill="#FF6B6B" opacity={0.4} />
</>);

const scared: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#E8D5C0" />
  <Circle cx="40" cy="46" r="5.5" fill="#2D1B0E" /><Circle cx="41" cy="43" r="2" fill="#fff" />
  <Circle cx="60" cy="46" r="5.5" fill="#2D1B0E" /><Circle cx="61" cy="43" r="2" fill="#fff" />
  <Ellipse cx="50" cy="61" rx="8" ry="6" fill="#2D1B0E" />
  <Ellipse cx="50" cy="61" rx="5" ry="4" fill="#CC6633" />
</>);

const calm: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFD5A8" />
  <Ellipse cx="40" cy="46" rx="5" ry="3.5" fill="#2D1B0E" />
  <Ellipse cx="60" cy="46" rx="5" ry="3.5" fill="#2D1B0E" />
  <Path d="M40,58 Q50,64 60,58" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Ellipse cx="35" cy="58" rx="7" ry="4" fill="#FFB3BA" opacity={0.35} />
  <Ellipse cx="65" cy="58" rx="7" ry="4" fill="#FFB3BA" opacity={0.35} />
</>);

const excited: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFD5A8" />
  <Path d="M35,44 L37,48 L41,46 L39,50" stroke="#2D1B0E" strokeWidth="1.5" fill="none" />
  <Path d="M59,46 L61,42 L65,44 L63,48" stroke="#2D1B0E" strokeWidth="1.5" fill="none" />
  <Ellipse cx="35" cy="58" rx="7" ry="5" fill="#FF9B9B" opacity={0.5} />
  <Ellipse cx="65" cy="58" rx="7" ry="5" fill="#FF9B9B" opacity={0.5} />
  <Path d="M36,57 Q50,70 64,57" stroke="#2D1B0E" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Circle cx="22" cy="35" r="4" fill="#FFD700" opacity={0.8} />
  <Circle cx="78" cy="35" r="4" fill="#FFD700" opacity={0.8} />
</>);

const tired: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFD5A8" />
  <Path d="M34,44 Q40,40 46,44" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <Path d="M54,44 Q60,40 66,44" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <Ellipse cx="40" cy="45" rx="5" ry="3" fill="#2D1B0E" opacity={0.6} />
  <Ellipse cx="60" cy="45" rx="5" ry="3" fill="#2D1B0E" opacity={0.6} />
  <Path d="M40,59 Q50,63 60,59" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Path d="M72,28 L76,24 M72,24 L76,28" stroke="#888" strokeWidth="2" strokeLinecap="round" />
  <Path d="M80,32 L84,28 M80,28 L84,32" stroke="#AAA" strokeWidth="1.5" strokeLinecap="round" />
</>);

const surprised: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFD5A8" />
  <Circle cx="40" cy="45" r="5.5" fill="#2D1B0E" /><Circle cx="41" cy="42" r="2" fill="#fff" />
  <Circle cx="60" cy="45" r="5.5" fill="#2D1B0E" /><Circle cx="61" cy="42" r="2" fill="#fff" />
  <Path d="M33,38 Q36,33 40,36" stroke="#2D1B0E" strokeWidth="2" fill="none" />
  <Path d="M60,36 Q64,33 67,38" stroke="#2D1B0E" strokeWidth="2" fill="none" />
  <Circle cx="50" cy="62" r="7" fill="#2D1B0E" />
  <Ellipse cx="50" cy="62" rx="5" ry="4.5" fill="#CC6633" />
</>);

const proud: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFD5A8" />
  <Ellipse cx="35" cy="58" rx="7" ry="5" fill="#FF9B9B" opacity={0.45} />
  <Ellipse cx="65" cy="58" rx="7" ry="5" fill="#FF9B9B" opacity={0.45} />
  <Circle cx="40" cy="46" r="4" fill="#2D1B0E" /><Circle cx="41" cy="44" r="1.5" fill="#fff" />
  <Circle cx="60" cy="46" r="4" fill="#2D1B0E" /><Circle cx="61" cy="44" r="1.5" fill="#fff" />
  <Path d="M36,56 Q50,70 64,56" stroke="#2D1B0E" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Path d="M50,16 L53,24 L62,24 L55,30 L57,39 L50,34 L43,39 L45,30 L38,24 L47,24 Z" fill="#FFD700" />
</>);

const worried: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="52" r="30" fill="#FFD5A8" />
  <Path d="M35,40 Q40,37 45,40" stroke="#2D1B0E" strokeWidth="2" fill="none" />
  <Path d="M55,40 Q60,37 65,40" stroke="#2D1B0E" strokeWidth="2" fill="none" />
  <Circle cx="40" cy="46" r="4" fill="#2D1B0E" />
  <Circle cx="60" cy="46" r="4" fill="#2D1B0E" />
  <Path d="M40,60 Q45,55 50,59 Q55,63 60,58" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <Ellipse cx="42" cy="55" rx="3" ry="3.5" fill="#88CCFF" opacity={0.6} />
</>);

// ── ANIMALS ───────────────────────────────────────────────────────────────────
const dog: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="68" rx="26" ry="18" fill="#C8A06E" />
  <Ellipse cx="30" cy="42" rx="11" ry="18" fill="#A0724A" />
  <Ellipse cx="70" cy="42" rx="11" ry="18" fill="#A0724A" />
  <Circle cx="50" cy="38" r="22" fill="#C8A06E" />
  <Ellipse cx="50" cy="50" rx="11" ry="8" fill="#E8C090" />
  <Circle cx="41" cy="34" r="4" fill="#2D1B0E" /><Circle cx="42" cy="32" r="1.5" fill="#fff" />
  <Circle cx="59" cy="34" r="4" fill="#2D1B0E" /><Circle cx="60" cy="32" r="1.5" fill="#fff" />
  <Ellipse cx="50" cy="48" rx="5" ry="3.5" fill="#2D1B0E" />
  <Path d="M46,50 L50,55 L54,50" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
</>);

const cat: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="68" rx="24" ry="18" fill="#D4A8D4" />
  <Polygon points="28,38 36,22 44,38" fill="#D4A8D4" />
  <Polygon points="31,38 36,26 41,38" fill="#FFB3D9" />
  <Polygon points="56,38 64,22 72,38" fill="#D4A8D4" />
  <Polygon points="59,38 64,26 69,38" fill="#FFB3D9" />
  <Circle cx="50" cy="44" r="22" fill="#D4A8D4" />
  <Ellipse cx="40" cy="42" rx="5" ry="3.5" fill="#2D1B0E" />
  <Ellipse cx="60" cy="42" rx="5" ry="3.5" fill="#2D1B0E" />
  <Circle cx="50" cy="50" r="4" fill="#CC8899" />
  <Path d="M50,54 L47,58 M50,54 L53,58" stroke="#2D1B0E" strokeWidth="1.5" strokeLinecap="round" />
  <Line x1="28" y1="48" x2="42" y2="52" stroke="#2D1B0E" strokeWidth="1" />
  <Line x1="28" y1="52" x2="42" y2="54" stroke="#2D1B0E" strokeWidth="1" />
  <Line x1="58" y1="52" x2="72" y2="48" stroke="#2D1B0E" strokeWidth="1" />
  <Line x1="58" y1="54" x2="72" y2="52" stroke="#2D1B0E" strokeWidth="1" />
</>);

const bird: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="60" rx="22" ry="18" fill="#5B8DEF" />
  <Circle cx="50" cy="36" r="16" fill="#5B8DEF" />
  <Polygon points="58,36 70,32 66,42" fill="#FFD700" />
  <Circle cx="44" cy="32" r="4" fill="#1A1A2E" /><Circle cx="45" cy="30" r="1.5" fill="#fff" />
  <Path d="M30,55 Q22,45 28,38" stroke="#4A7DE0" strokeWidth="8" fill="none" strokeLinecap="round" />
  <Path d="M70,55 Q78,45 72,38" stroke="#4A7DE0" strokeWidth="8" fill="none" strokeLinecap="round" />
  <Ellipse cx="50" cy="76" rx="8" ry="5" fill="#FFD700" />
</>);

const fish: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#DDEEFF" opacity={0.6} />
  <Polygon points="76,50 90,36 90,64" fill="#FF8B6A" />
  <Ellipse cx="50" cy="50" rx="30" ry="18" fill="#FF8B6A" />
  <Ellipse cx="44" cy="46" rx="10" ry="8" fill="#FF6B4A" opacity={0.4} />
  <Ellipse cx="44" cy="54" rx="10" ry="8" fill="#FF6B4A" opacity={0.4} />
  <Circle cx="28" cy="46" r="5" fill="#1A1A2E" /><Circle cx="29" cy="44" r="2" fill="#fff" />
  <Ellipse cx="38" cy="58" rx="6" ry="4" fill="#FF6B4A" />
</>);

const rabbit: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="66" rx="22" ry="16" fill="#F0D0E8" />
  <Ellipse cx="36" cy="28" rx="8" ry="20" fill="#F0D0E8" />
  <Ellipse cx="37" cy="28" rx="5" ry="16" fill="#FFB3D9" />
  <Ellipse cx="64" cy="28" rx="8" ry="20" fill="#F0D0E8" />
  <Ellipse cx="63" cy="28" rx="5" ry="16" fill="#FFB3D9" />
  <Circle cx="50" cy="48" r="20" fill="#F0D0E8" />
  <Circle cx="42" cy="44" r="4" fill="#CC4488" opacity={0.8} />
  <Circle cx="58" cy="44" r="4" fill="#CC4488" opacity={0.8} />
  <Circle cx="50" cy="52" r="4" fill="#FFB3D9" />
  <Line x1="32" y1="50" x2="46" y2="54" stroke="#2D1B0E" strokeWidth="0.8" />
  <Line x1="32" y1="54" x2="46" y2="56" stroke="#2D1B0E" strokeWidth="0.8" />
  <Line x1="54" y1="54" x2="68" y2="50" stroke="#2D1B0E" strokeWidth="0.8" />
  <Line x1="54" y1="56" x2="68" y2="54" stroke="#2D1B0E" strokeWidth="0.8" />
</>);

const bear: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="65" rx="26" ry="20" fill="#8B5E3C" />
  <Circle cx="33" cy="30" r="12" fill="#8B5E3C" />
  <Circle cx="67" cy="30" r="12" fill="#8B5E3C" />
  <Circle cx="33" cy="30" r="7" fill="#6B4423" />
  <Circle cx="67" cy="30" r="7" fill="#6B4423" />
  <Circle cx="50" cy="46" r="24" fill="#8B5E3C" />
  <Ellipse cx="50" cy="56" rx="13" ry="9" fill="#A07850" />
  <Circle cx="40" cy="40" r="4.5" fill="#2D1B0E" /><Circle cx="41" cy="38" r="1.5" fill="#fff" />
  <Circle cx="60" cy="40" r="4.5" fill="#2D1B0E" /><Circle cx="61" cy="38" r="1.5" fill="#fff" />
  <Ellipse cx="50" cy="53" rx="5" ry="3.5" fill="#2D1B0E" />
</>);

const lion: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="48" r="34" fill="#E8A030" opacity={0.5} />
  <Circle cx="50" cy="48" r="28" fill="#E8A030" opacity={0.6} />
  <Circle cx="50" cy="50" r="22" fill="#FFD5A8" />
  <Ellipse cx="50" cy="60" rx="13" ry="8" fill="#E8C090" />
  <Circle cx="40" cy="44" r="4.5" fill="#2D1B0E" /><Circle cx="41" cy="42" r="1.5" fill="#fff" />
  <Circle cx="60" cy="44" r="4.5" fill="#2D1B0E" /><Circle cx="61" cy="42" r="1.5" fill="#fff" />
  <Ellipse cx="50" cy="57" rx="5" ry="3.5" fill="#2D1B0E" />
  <Line x1="30" y1="56" x2="44" y2="60" stroke="#2D1B0E" strokeWidth="1" />
  <Line x1="30" y1="60" x2="44" y2="62" stroke="#2D1B0E" strokeWidth="1" />
  <Line x1="56" y1="60" x2="70" y2="56" stroke="#2D1B0E" strokeWidth="1" />
  <Line x1="56" y1="62" x2="70" y2="60" stroke="#2D1B0E" strokeWidth="1" />
</>);

const elephant: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="68" rx="28" ry="18" fill="#9090B0" />
  <Ellipse cx="22" cy="48" rx="14" ry="20" fill="#9090B0" />
  <Ellipse cx="78" cy="48" rx="14" ry="20" fill="#9090B0" />
  <Circle cx="50" cy="42" r="24" fill="#9090B0" />
  <Path d="M44,62 Q46,78 40,86" stroke="#9090B0" strokeWidth="8" fill="none" strokeLinecap="round" />
  <Circle cx="38" cy="38" r="5" fill="#1A1A2E" /><Circle cx="39" cy="36" r="2" fill="#fff" />
  <Circle cx="62" cy="38" r="5" fill="#1A1A2E" /><Circle cx="63" cy="36" r="2" fill="#fff" />
</>);

const duck: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#DDF5FF" opacity={0.6} />
  <Ellipse cx="50" cy="64" rx="26" ry="18" fill="#F5F0D0" />
  <Circle cx="50" cy="38" r="18" fill="#F5F0D0" />
  <Polygon points="64,38 78,34 76,44" fill="#FF9900" />
  <Circle cx="43" cy="34" r="4" fill="#1A1A2E" /><Circle cx="44" cy="32" r="1.5" fill="#fff" />
  <Ellipse cx="50" cy="76" rx="12" ry="6" fill="#FF9900" />
</>);

const frog: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="62" rx="28" ry="22" fill="#5DBB5D" />
  <Circle cx="35" cy="38" r="14" fill="#5DBB5D" />
  <Circle cx="65" cy="38" r="14" fill="#5DBB5D" />
  <Circle cx="35" cy="36" r="8" fill="#fff" />
  <Circle cx="65" cy="36" r="8" fill="#fff" />
  <Circle cx="35" cy="36" r="5" fill="#1A1A2E" /><Circle cx="36" cy="34" r="2" fill="#fff" />
  <Circle cx="65" cy="36" r="5" fill="#1A1A2E" /><Circle cx="66" cy="34" r="2" fill="#fff" />
  <Path d="M35,60 Q50,70 65,60" stroke="#3A8A3A" strokeWidth="3" fill="none" strokeLinecap="round" />
</>);

const butterfly: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.12} />
  <Ellipse cx="28" cy="36" rx="20" ry="16" fill="#FF88CC" opacity={0.85} />
  <Ellipse cx="72" cy="36" rx="20" ry="16" fill="#FF88CC" opacity={0.85} />
  <Ellipse cx="30" cy="62" rx="16" ry="12" fill="#FFB3E6" opacity={0.85} />
  <Ellipse cx="70" cy="62" rx="16" ry="12" fill="#FFB3E6" opacity={0.85} />
  <Circle cx="28" cy="36" r="8" fill="#CC44AA" opacity={0.4} />
  <Circle cx="72" cy="36" r="8" fill="#CC44AA" opacity={0.4} />
  <Ellipse cx="50" cy="50" rx="4" ry="18" fill="#2D1B0E" />
  <Path d="M46,36 Q44,32 46,28" stroke="#2D1B0E" strokeWidth="1.5" fill="none" />
  <Path d="M54,36 Q56,32 54,28" stroke="#2D1B0E" strokeWidth="1.5" fill="none" />
  <Circle cx="46" cy="27" r="2" fill="#2D1B0E" />
  <Circle cx="54" cy="27" r="2" fill="#2D1B0E" />
</>);

const cow: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="65" rx="28" ry="20" fill="#F5F5F5" />
  <Circle cx="50" cy="42" r="22" fill="#F5F5F5" />
  <Ellipse cx="36" cy="24" rx="7" ry="10" fill="#F5F5F5" />
  <Ellipse cx="64" cy="24" rx="7" ry="10" fill="#F5F5F5" />
  <Circle cx="26" cy="50" r="7" fill="#2D1B0E" opacity={0.7} />
  <Circle cx="68" cy="42" r="9" fill="#2D1B0E" opacity={0.7} />
  <Ellipse cx="50" cy="50" rx="10" ry="7" fill="#FFCCCC" />
  <Circle cx="47" cy="50" r="2" fill="#2D1B0E" />
  <Circle cx="53" cy="50" r="2" fill="#2D1B0E" />
  <Circle cx="41" cy="37" r="4" fill="#1A1A2E" /><Circle cx="42" cy="35" r="1.5" fill="#fff" />
  <Circle cx="59" cy="37" r="4" fill="#1A1A2E" /><Circle cx="60" cy="35" r="1.5" fill="#fff" />
</>);

const horse: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="65" rx="26" ry="18" fill="#C8824A" />
  <Ellipse cx="62" cy="38" rx="14" ry="20" fill="#C8824A" />
  <Path d="M50,30 Q46,18 38,14" stroke="#8B5E3C" strokeWidth="6" fill="none" strokeLinecap="round" />
  <Circle cx="66" cy="30" r="4.5" fill="#1A1A2E" /><Circle cx="67" cy="28" r="1.5" fill="#fff" />
  <Ellipse cx="72" cy="50" rx="5" ry="3" fill="#FFCCAA" />
  <Circle cx="60" cy="24" r="3" fill="#2D1B0E" />
  <Circle cx="62" cy="24" r="3" fill="#2D1B0E" />
</>);

const monkey: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="65" rx="22" ry="16" fill="#C8824A" />
  <Circle cx="30" cy="44" r="14" fill="#C8824A" />
  <Circle cx="70" cy="44" r="14" fill="#C8824A" />
  <Circle cx="30" cy="44" r="8" fill="#E8A870" />
  <Circle cx="70" cy="44" r="8" fill="#E8A870" />
  <Circle cx="50" cy="46" r="22" fill="#C8824A" />
  <Ellipse cx="50" cy="56" rx="14" ry="10" fill="#E8A870" />
  <Circle cx="41" cy="40" r="4.5" fill="#1A1A2E" /><Circle cx="42" cy="38" r="1.5" fill="#fff" />
  <Circle cx="59" cy="40" r="4.5" fill="#1A1A2E" /><Circle cx="60" cy="38" r="1.5" fill="#fff" />
  <Path d="M42,60 Q50,65 58,60" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
</>);

const turtle: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="54" rx="28" ry="22" fill="#5A9A5A" />
  <Ellipse cx="50" cy="52" rx="22" ry="18" fill="#3A7A3A" />
  <Path d="M50,38 L50,66 M36,44 L64,44 M36,60 L64,60" stroke="#5A9A5A" strokeWidth="2" />
  <Ellipse cx="50" cy="34" rx="10" ry="8" fill="#5A9A5A" />
  <Circle cx="46" cy="30" r="3" fill="#1A1A2E" /><Circle cx="47" cy="29" r="1" fill="#fff" />
  <Circle cx="54" cy="30" r="3" fill="#1A1A2E" /><Circle cx="55" cy="29" r="1" fill="#fff" />
  <Ellipse cx="22" cy="54" rx="8" ry="5" fill="#5A9A5A" />
  <Ellipse cx="78" cy="54" rx="8" ry="5" fill="#5A9A5A" />
  <Ellipse cx="35" cy="72" rx="8" ry="5" fill="#5A9A5A" />
  <Ellipse cx="65" cy="72" rx="8" ry="5" fill="#5A9A5A" />
</>);

// ── FOOD ──────────────────────────────────────────────────────────────────────
const apple: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="55" r="30" fill="#FF4444" />
  <Ellipse cx="35" cy="45" rx="16" ry="20" fill="#FF6666" />
  <Path d="M50,22 Q54,14 60,18" stroke="#4A8A2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <Ellipse cx="58" cy="15" rx="6" ry="10" fill="#5A9A3A" />
  <Ellipse cx="36" cy="44" rx="8" ry="10" fill="#fff" opacity={0.2} />
</>);

const banana: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M30,70 Q22,50 30,30 Q38,14 56,18 Q74,22 78,38" stroke="#FFD700" strokeWidth="18" fill="none" strokeLinecap="round" />
  <Path d="M30,70 Q22,50 30,30 Q38,14 56,18 Q74,22 78,38" stroke="#FFE44A" strokeWidth="12" fill="none" strokeLinecap="round" />
  <Path d="M30,70 Q38,68 56,70" stroke="#D4A800" strokeWidth="2" fill="none" strokeLinecap="round" />
</>);

const bread: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="18" y="52" width="64" height="30" rx="6" fill="#C8824A" />
  <Ellipse cx="50" cy="50" rx="34" ry="18" fill="#E8A060" />
  <Ellipse cx="50" cy="48" rx="28" ry="12" fill="#F0C080" />
  <Line x1="30" y1="62" x2="30" y2="76" stroke="#B06830" strokeWidth="2" />
  <Line x1="40" y1="62" x2="40" y2="76" stroke="#B06830" strokeWidth="2" />
  <Line x1="50" y1="62" x2="50" y2="76" stroke="#B06830" strokeWidth="2" />
  <Line x1="60" y1="62" x2="60" y2="76" stroke="#B06830" strokeWidth="2" />
  <Line x1="70" y1="62" x2="70" y2="76" stroke="#B06830" strokeWidth="2" />
</>);

const milk: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="30" y="35" width="40" height="48" rx="4" fill="#fff" stroke="#DDD" strokeWidth="1.5" />
  <Polygon points="30,35 40,20 60,20 70,35" fill="#E8F0FF" stroke="#DDD" strokeWidth="1.5" />
  <Rect x="30" y="35" width="40" height="14" fill="#E8F0FF" />
  <Rect x="35" y="52" width="30" height="4" rx="2" fill="#4466CC" />
  <Rect x="35" y="60" width="22" height="3" rx="1.5" fill="#AAA" />
  <Circle cx="50" cy="42" r="5" fill="#FFD700" />
</>);

const egg: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="54" rx="26" ry="32" fill="#FFF8E8" stroke="#E8D8A0" strokeWidth="2" />
  <Circle cx="50" cy="58" r="14" fill="#FFD700" />
  <Circle cx="50" cy="58" r="10" fill="#FFA500" />
  <Ellipse cx="44" cy="44" rx="6" ry="10" fill="#fff" opacity={0.6} />
</>);

const rice: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M20,72 Q50,80 80,72 L75,50 Q50,55 25,50 Z" fill="#F0F0E0" stroke="#DDD" strokeWidth="1.5" />
  <Ellipse cx="50" cy="50" rx="30" ry="8" fill="#E8E8D0" />
  <Circle cx="36" cy="46" r="3" fill="#fff" />
  <Circle cx="44" cy="44" r="3" fill="#fff" />
  <Circle cx="52" cy="45" r="3" fill="#fff" />
  <Circle cx="60" cy="44" r="3" fill="#fff" />
  <Circle cx="40" cy="52" r="3" fill="#fff" />
  <Circle cx="50" cy="51" r="3" fill="#fff" />
  <Circle cx="60" cy="51" r="3" fill="#fff" />
</>);

const pizza: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Polygon points="50,14 88,80 12,80" fill="#F0C060" />
  <Polygon points="50,20 84,76 16,76" fill="#E85530" />
  <Polygon points="50,26 78,72 22,72" fill="#F0C060" />
  <Circle cx="42" cy="52" r="5" fill="#C0392B" />
  <Circle cx="58" cy="48" r="5" fill="#C0392B" />
  <Circle cx="50" cy="62" r="5" fill="#C0392B" />
  <Circle cx="36" cy="64" r="4" fill="#2D8A2D" />
  <Circle cx="62" cy="60" r="4" fill="#2D8A2D" />
  <Ellipse cx="50" cy="14" rx="10" ry="5" fill="#E8C080" />
</>);

const cookie: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="50" r="32" fill="#C8824A" />
  <Circle cx="50" cy="50" r="28" fill="#D89A5A" />
  <Circle cx="38" cy="40" r="5" fill="#4A2800" />
  <Circle cx="56" cy="36" r="5" fill="#4A2800" />
  <Circle cx="64" cy="52" r="5" fill="#4A2800" />
  <Circle cx="42" cy="58" r="5" fill="#4A2800" />
  <Circle cx="58" cy="62" r="4" fill="#4A2800" />
  <Circle cx="36" cy="56" r="4" fill="#4A2800" />
</>);

const cake: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="18" y="56" width="64" height="26" rx="5" fill="#FFB3D9" />
  <Rect x="22" y="42" width="56" height="18" rx="4" fill="#FF88CC" />
  <Rect x="26" y="55" width="48" height="4" fill="#fff" opacity={0.5} />
  <Line x1="38" y1="20" x2="38" y2="42" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
  <Line x1="50" y1="18" x2="50" y2="42" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
  <Line x1="62" y1="20" x2="62" y2="42" stroke="#5B8DEF" strokeWidth="3" strokeLinecap="round" />
  <Circle cx="38" cy="19" r="4" fill="#FF8800" />
  <Circle cx="50" cy="17" r="4" fill="#FF8800" />
  <Circle cx="62" cy="19" r="4" fill="#FF8800" />
  <Rect x="26" y="68" width="8" height="14" rx="2" fill="#fff" opacity={0.4} />
  <Rect x="46" y="68" width="8" height="14" rx="2" fill="#fff" opacity={0.4} />
  <Rect x="66" y="68" width="8" height="14" rx="2" fill="#fff" opacity={0.4} />
</>);

const orange: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="54" r="30" fill="#FF8C00" />
  <Circle cx="50" cy="54" r="28" fill="#FFA500" />
  <Path d="M50,26 Q54,18 62,22" stroke="#4A8A2A" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Ellipse cx="60" cy="20" rx="6" ry="9" fill="#5A9A3A" />
  <Line x1="50" y1="26" x2="50" y2="82" stroke="#E07800" strokeWidth="1.5" />
  <Line x1="22" y1="54" x2="78" y2="54" stroke="#E07800" strokeWidth="1.5" />
  <Line x1="30" y1="35" x2="70" y2="73" stroke="#E07800" strokeWidth="1.5" />
  <Line x1="70" y1="35" x2="30" y2="73" stroke="#E07800" strokeWidth="1.5" />
</>);

const carrot: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M38,30 L62,30 L54,84 L46,84 Z" fill="#FF7722" />
  <Path d="M38,30 L62,30 L58,50 L42,50 Z" fill="#FF9944" />
  <Line x1="50" y1="30" x2="50" y2="84" stroke="#E06618" strokeWidth="1.5" />
  <Line x1="42" y1="44" x2="58" y2="44" stroke="#E06618" strokeWidth="1" />
  <Line x1="43" y1="58" x2="57" y2="58" stroke="#E06618" strokeWidth="1" />
  <Line x1="44" y1="70" x2="56" y2="70" stroke="#E06618" strokeWidth="1" />
  <Path d="M40,28 Q36,14 44,10" stroke="#4A8A2A" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Path d="M50,28 Q50,14 50,8" stroke="#5A9A3A" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Path d="M60,28 Q64,14 56,10" stroke="#4A8A2A" strokeWidth="3" fill="none" strokeLinecap="round" />
</>);

const strawberry: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M50,18 Q78,28 76,58 Q72,80 50,84 Q28,80 24,58 Q22,28 50,18 Z" fill="#FF3355" />
  <Path d="M50,18 Q72,28 70,55 Q50,25 30,55 Q28,28 50,18 Z" fill="#FF6677" opacity={0.5} />
  <Circle cx="42" cy="44" r="2" fill="#FFD700" />
  <Circle cx="54" cy="40" r="2" fill="#FFD700" />
  <Circle cx="60" cy="52" r="2" fill="#FFD700" />
  <Circle cx="56" cy="64" r="2" fill="#FFD700" />
  <Circle cx="44" cy="68" r="2" fill="#FFD700" />
  <Circle cx="36" cy="58" r="2" fill="#FFD700" />
  <Circle cx="40" cy="56" r="2" fill="#FFD700" />
  <Path d="M42,16 Q38,8 44,6" stroke="#5A9A3A" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Path d="M50,14 Q50,6 50,4" stroke="#4A8A2A" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Path d="M58,16 Q62,8 56,6" stroke="#5A9A3A" strokeWidth="3" fill="none" strokeLinecap="round" />
</>);

const grape: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="36" cy="44" r="12" fill="#8B44CC" />
  <Circle cx="64" cy="44" r="12" fill="#8B44CC" />
  <Circle cx="50" cy="40" r="12" fill="#9B54DC" />
  <Circle cx="36" cy="62" r="12" fill="#8B44CC" />
  <Circle cx="64" cy="62" r="12" fill="#8B44CC" />
  <Circle cx="50" cy="58" r="12" fill="#9B54DC" />
  <Circle cx="50" cy="76" r="12" fill="#8B44CC" />
  <Circle cx="38" cy="43" r="4" fill="#BB88EE" opacity={0.5} />
  <Circle cx="52" cy="39" r="4" fill="#BB88EE" opacity={0.5} />
  <Circle cx="66" cy="43" r="4" fill="#BB88EE" opacity={0.5} />
  <Path d="M50,26 Q54,16 62,14" stroke="#4A8A2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
</>);

const watermelon: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M14,58 Q14,82 50,82 Q86,82 86,58 Z" fill="#FF4444" />
  <Path d="M14,58 Q14,78 50,78 Q86,78 86,58 Z" fill="#FF6666" />
  <Path d="M14,58 Q50,52 86,58" stroke="#5A9A3A" strokeWidth="8" fill="none" />
  <Path d="M14,58 Q50,54 86,58" stroke="#7ABB4A" strokeWidth="4" fill="none" />
  <Circle cx="36" cy="66" r="3" fill="#2D1B0E" />
  <Circle cx="50" cy="70" r="3" fill="#2D1B0E" />
  <Circle cx="64" cy="66" r="3" fill="#2D1B0E" />
  <Circle cx="43" cy="74" r="3" fill="#2D1B0E" />
  <Circle cx="57" cy="74" r="3" fill="#2D1B0E" />
</>);

const chicken: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M42,72 Q36,56 40,44 Q44,32 56,34 Q68,36 68,52 Q68,66 62,72 Z" fill="#F0C060" />
  <Ellipse cx="52" cy="68" rx="10" ry="20" fill="#E8A840" />
  <Circle cx="52" cy="46" r="5" fill="#2D1B0E" />
  <Ellipse cx="35" cy="72" rx="8" ry="5" fill="#CC6600" />
</>);

// ── ACTIONS ───────────────────────────────────────────────────────────────────
const eat: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="44" y="22" width="5" height="36" rx="2.5" fill="#C8A060" />
  <Ellipse cx="46" cy="18" rx="5" ry="7" fill="#C8A060" />
  <Rect x="51" y="22" width="5" height="36" rx="2.5" fill="#C8A060" />
  <Ellipse cx="53" cy="18" rx="5" ry="7" fill="#C8A060" />
  <Circle cx="74" cy="54" r="22" fill="#FF8B6A" />
  <Circle cx="74" cy="54" r="18" fill="#FFD5A8" />
  <Circle cx="70" cy="50" r="3" fill="#2D1B0E" />
  <Circle cx="78" cy="50" r="3" fill="#2D1B0E" />
  <Path d="M68,58 Q74,64 80,58" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
</>);

const drink: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="28" y="38" width="44" height="48" rx="8" fill="#88CCFF" opacity={0.4} />
  <Rect x="28" y="38" width="44" height="48" rx="8" fill="none" stroke="#5599CC" strokeWidth="2.5" />
  <Rect x="28" y="38" width="44" height="24" rx="8" fill="#44AAFF" opacity={0.3} />
  <Rect x="28" y="22" width="44" height="18" rx="5" fill="#DDEEFF" stroke="#5599CC" strokeWidth="2" />
  <Line x1="66" y1="22" x2="80" y2="12" stroke="#5599CC" strokeWidth="2.5" strokeLinecap="round" />
</>);

const sleep: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#1A1A3E" />
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.1} />
  <Circle cx="30" cy="32" r="18" fill="#FFE080" />
  <Circle cx="42" cy="22" r="10" fill="#1A1A3E" />
  <Circle cx="18" cy="18" r="5" fill="#fff" opacity={0.8} />
  <Circle cx="60" cy="20" r="4" fill="#fff" opacity={0.7} />
  <Circle cx="78" cy="35" r="3" fill="#fff" opacity={0.6} />
  <Circle cx="70" cy="60" r="3.5" fill="#fff" opacity={0.5} />
  <Circle cx="22" cy="65" r="2.5" fill="#fff" opacity={0.5} />
  <Path d="M58,30 Q62,26 66,30 Q64,34 66,38 Q62,42 58,38 Q60,34 58,30 Z" fill="#fff" opacity={0.9} />
  <Path d="M70,44 Q73,40 76,44 Q74,47 76,50 Q73,53 70,50 Q72,47 70,44 Z" fill="#fff" opacity={0.7} />
</>);

const play: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="60" r="26" fill="#FF6B6B" />
  <Path d="M22,60 Q50,68 78,60" stroke="#CC2222" strokeWidth="2" fill="none" />
  <Path d="M50,34 Q50,60 50,86" stroke="#CC2222" strokeWidth="2" fill="none" />
  <Circle cx="50" cy="34" r="8" fill="#FFD700" />
  <Circle cx="46" cy="30" r="2.5" fill="#FF8800" />
</>);

const run: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="56" cy="20" r="9" fill="#FFD5A8" />
  <Rect x="48" y="30" width="14" height="20" rx="5" fill="#5B8DEF" />
  <Path d="M62,34 L74,28" stroke="#FFD5A8" strokeWidth="6" strokeLinecap="round" />
  <Path d="M48,34 L36,40" stroke="#FFD5A8" strokeWidth="6" strokeLinecap="round" />
  <Path d="M56,50 L50,68" stroke="#2D4080" strokeWidth="6" strokeLinecap="round" />
  <Path d="M60,50 L72,60" stroke="#2D4080" strokeWidth="6" strokeLinecap="round" />
  <Path d="M50,68 L42,76" stroke="#5B8DEF" strokeWidth="5" strokeLinecap="round" />
  <Path d="M72,60 L80,70" stroke="#5B8DEF" strokeWidth="5" strokeLinecap="round" />
</>);

const walk: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="20" r="9" fill="#FFD5A8" />
  <Rect x="43" y="30" width="14" height="22" rx="5" fill="#6EC6A1" />
  <Path d="M43,34 L32,44" stroke="#FFD5A8" strokeWidth="6" strokeLinecap="round" />
  <Path d="M57,34 L64,42" stroke="#FFD5A8" strokeWidth="6" strokeLinecap="round" />
  <Path d="M46,52 L40,70" stroke="#2D6050" strokeWidth="6" strokeLinecap="round" />
  <Path d="M54,52 L60,70" stroke="#2D6050" strokeWidth="6" strokeLinecap="round" />
  <Path d="M40,70 L30,78" stroke="#6EC6A1" strokeWidth="5" strokeLinecap="round" />
  <Path d="M60,70 L70,80" stroke="#6EC6A1" strokeWidth="5" strokeLinecap="round" />
  <Line x1="15" y1="84" x2="85" y2="84" stroke="#CCC" strokeWidth="2" strokeDasharray="6,4" />
</>);

const jump: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="14" r="9" fill="#FFD5A8" />
  <Rect x="43" y="24" width="14" height="20" rx="5" fill="#C3AED6" />
  <Path d="M43,28 L30,20" stroke="#FFD5A8" strokeWidth="6" strokeLinecap="round" />
  <Path d="M57,28 L70,20" stroke="#FFD5A8" strokeWidth="6" strokeLinecap="round" />
  <Path d="M46,44 L36,62" stroke="#6B4490" strokeWidth="6" strokeLinecap="round" />
  <Path d="M54,44 L64,62" stroke="#6B4490" strokeWidth="6" strokeLinecap="round" />
  <Path d="M36,62 L26,72" stroke="#C3AED6" strokeWidth="5" strokeLinecap="round" />
  <Path d="M64,62 L74,72" stroke="#C3AED6" strokeWidth="5" strokeLinecap="round" />
  <Ellipse cx="50" cy="86" rx="20" ry="6" fill="#DDD" />
</>);

const sit: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="20" r="9" fill="#FFD5A8" />
  <Rect x="43" y="30" width="14" height="18" rx="5" fill="#FF8B94" />
  <Path d="M43,34 L32,28" stroke="#FFD5A8" strokeWidth="6" strokeLinecap="round" />
  <Path d="M57,34 L68,28" stroke="#FFD5A8" strokeWidth="6" strokeLinecap="round" />
  <Path d="M50,48 L50,62" stroke="#CC4455" strokeWidth="6" strokeLinecap="round" />
  <Path d="M50,62 L70,62" stroke="#CC4455" strokeWidth="6" strokeLinecap="round" />
  <Rect x="18" y="62" width="64" height="8" rx="4" fill="#C8A060" />
  <Rect x="22" y="70" width="8" height="16" rx="4" fill="#A07840" />
  <Rect x="70" y="70" width="8" height="16" rx="4" fill="#A07840" />
</>);

const stop: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="50" r="36" fill="#FF4444" />
  <Rect x="24" y="44" width="52" height="12" rx="6" fill="#fff" />
</>);

const help: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M22,70 Q22,52 34,48 Q46,44 46,36 Q46,24 50,24 Q54,24 54,36 Q54,44 66,48 Q78,52 78,70" fill="#FFD5A8" stroke="#C8A070" strokeWidth="2" />
  <Circle cx="40" cy="58" r="6" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="60" cy="58" r="6" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="50" cy="46" r="12" fill="#5B8DEF" />
  <Rect x="46" y="38" width="8" height="16" rx="4" fill="#fff" />
  <Rect x="42" y="46" width="16" height="6" rx="3" fill="#fff" />
</>);

const share: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M14,68 Q14,52 22,48 Q30,44 30,38 L30,38" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="26" cy="38" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Path d="M86,68 Q86,52 78,48 Q70,44 70,38 L70,38" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="74" cy="38" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="50" cy="52" r="16" fill="#FFD700" />
  <Circle cx="50" cy="52" r="12" fill="#FFA500" />
  <Path d="M40,68 Q50,76 60,68" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
</>);

const listen: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M32,50 Q32,26 50,26 Q68,26 68,50 Q68,64 56,68 L56,76" stroke="#FFD5A8" strokeWidth="14" fill="none" strokeLinecap="round" />
  <Circle cx="56" cy="80" r="5" fill="#FFD5A8" />
  <Path d="M74,44 Q80,44 80,50 Q80,56 74,56" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
  <Path d="M78,38 Q88,38 88,50 Q88,62 78,62" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
</>);

const wait: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="20" rx="22" ry="8" fill="#C8A060" />
  <Ellipse cx="50" cy="80" rx="22" ry="8" fill="#C8A060" />
  <Path d="M28,20 Q28,40 50,50 Q72,60 72,80" stroke="#C8A060" strokeWidth="2.5" fill="none" />
  <Path d="M72,20 Q72,40 50,50 Q28,60 28,80" stroke="#C8A060" strokeWidth="2.5" fill="none" />
  <Ellipse cx="50" cy="54" rx="10" ry="6" fill="#FFD700" opacity={0.8} />
</>);

const wash: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M26,42 Q22,52 22,62 Q22,76 50,76 Q78,76 78,62 Q78,52 74,42" fill="#88CCFF" opacity={0.5} />
  <Path d="M26,42 Q22,52 22,62 Q22,76 50,76 Q78,76 78,62 Q78,52 74,42" fill="none" stroke="#5599CC" strokeWidth="2.5" />
  <Path d="M22,52 Q50,58 78,52" stroke="#5599CC" strokeWidth="1.5" fill="none" />
  <Path d="M34,22 Q34,14 38,20 Q42,26 42,18 Q42,10 46,18 Q50,26 50,16" stroke="#88DDFF" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Path d="M54,22 Q54,14 58,20 Q62,26 62,18 Q62,10 66,18" stroke="#88DDFF" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Ellipse cx="36" cy="36" rx="5" ry="5" fill="#88DDFF" opacity={0.6} />
  <Ellipse cx="64" cy="30" rx="4" ry="4" fill="#88DDFF" opacity={0.6} />
</>);

const read: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="18" y="30" width="64" height="50" rx="5" fill="#F5E8D0" />
  <Rect x="48" y="30" width="4" height="50" fill="#C8A060" />
  <Rect x="22" y="36" width="22" height="3" rx="1.5" fill="#888" />
  <Rect x="22" y="43" width="22" height="3" rx="1.5" fill="#888" />
  <Rect x="22" y="50" width="18" height="3" rx="1.5" fill="#888" />
  <Rect x="22" y="57" width="22" height="3" rx="1.5" fill="#888" />
  <Rect x="22" y="64" width="14" height="3" rx="1.5" fill="#888" />
  <Rect x="56" y="36" width="22" height="3" rx="1.5" fill="#888" />
  <Rect x="56" y="43" width="22" height="3" rx="1.5" fill="#888" />
  <Rect x="56" y="50" width="16" height="3" rx="1.5" fill="#888" />
  <Rect x="56" y="57" width="22" height="3" rx="1.5" fill="#888" />
  <Rect x="56" y="64" width="18" height="3" rx="1.5" fill="#888" />
</>);

// ── PEOPLE ────────────────────────────────────────────────────────────────────
const personBase = (hairColor: string, extras?: React.ReactNode) => (c: string) => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="72" rx="22" ry="14" fill="#5B8DEF" />
  <Circle cx="50" cy="42" r="18" fill="#FFD5A8" />
  {extras}
  <Circle cx="44" cy="40" r="3" fill="#2D1B0E" />
  <Circle cx="56" cy="40" r="3" fill="#2D1B0E" />
  <Path d="M44,50 Q50,55 56,50" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
</>);

const mom: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="72" rx="22" ry="14" fill="#FF88CC" />
  <Path d="M32,34 Q32,22 50,22 Q68,22 68,34 Q68,26 60,24 Q50,20 40,24 Q32,30 32,34 Z" fill="#4A2800" />
  <Path d="M68,34 Q74,50 68,60 L32,60 Q26,50 32,34" fill="#FFD5A8" />
  <Path d="M68,34 Q76,44 72,60 Q80,52 74,38" fill="#4A2800" />
  <Path d="M32,34 Q24,44 28,60 Q20,52 26,38" fill="#4A2800" />
  <Circle cx="44" cy="46" r="3.5" fill="#2D1B0E" />
  <Circle cx="56" cy="46" r="3.5" fill="#2D1B0E" />
  <Path d="M44,54 Q50,60 56,54" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Ellipse cx="38" cy="54" rx="5" ry="3.5" fill="#FF9B9B" opacity={0.4} />
  <Ellipse cx="62" cy="54" rx="5" ry="3.5" fill="#FF9B9B" opacity={0.4} />
</>);

const dad: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="74" rx="22" ry="14" fill="#5B8DEF" />
  <Rect x="44" y="64" width="12" height="12" fill="#FFD700" />
  <Path d="M34,38 Q34,22 50,22 Q66,22 66,38 L66,58 Q50,64 34,58 Z" fill="#FFD5A8" />
  <Path d="M34,38 Q34,24 50,24 Q66,24 66,38 Q66,28 58,26 Q50,22 42,26 Q34,30 34,38 Z" fill="#2D1B0E" />
  <Circle cx="43" cy="46" r="3.5" fill="#2D1B0E" />
  <Circle cx="57" cy="46" r="3.5" fill="#2D1B0E" />
  <Rect x="42" y="54" width="16" height="4" rx="2" fill="#C8A070" />
</>);

const baby: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="72" rx="18" ry="12" fill="#FFD5A8" />
  <Circle cx="50" cy="44" r="22" fill="#FFD5A8" />
  <Ellipse cx="36" cy="56" rx="5" ry="4" fill="#FF9B9B" opacity={0.4} />
  <Ellipse cx="64" cy="56" rx="5" ry="4" fill="#FF9B9B" opacity={0.4} />
  <Circle cx="43" cy="42" r="4.5" fill="#2D1B0E" opacity={0.7} />
  <Circle cx="57" cy="42" r="4.5" fill="#2D1B0E" opacity={0.7} />
  <Circle cx="44" cy="41" r="1.5" fill="#fff" />
  <Circle cx="58" cy="41" r="1.5" fill="#fff" />
  <Ellipse cx="50" cy="52" rx="5" ry="4" fill="#FF9B9B" opacity={0.6} />
  <Path d="M44,58 Q50,64 56,58" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Rect x="32" y="20" width="36" height="12" rx="6" fill="#88CCFF" />
</>);

const teacher: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="72" rx="22" ry="14" fill="#5B8DEF" />
  <Path d="M34,38 Q34,22 50,22 Q66,22 66,38 L66,58 Q50,64 34,58 Z" fill="#FFD5A8" />
  <Path d="M34,38 Q34,24 50,24 Q66,24 66,38 Q66,28 58,26 Q50,22 42,26 Q34,30 34,38 Z" fill="#2D1B0E" />
  <Circle cx="43" cy="46" r="3.5" fill="#2D1B0E" />
  <Circle cx="57" cy="46" r="3.5" fill="#2D1B0E" />
  <Path d="M44,54 Q50,59 56,54" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Rect x="14" y="62" width="36" height="24" rx="3" fill="#fff" stroke="#DDD" strokeWidth="1.5" />
  <Line x1="18" y1="70" x2="46" y2="70" stroke="#5B8DEF" strokeWidth="2" />
  <Line x1="18" y1="76" x2="40" y2="76" stroke="#5B8DEF" strokeWidth="2" />
  <Line x1="18" y1="82" x2="44" y2="82" stroke="#5B8DEF" strokeWidth="2" />
</>);

const doctor: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="72" rx="22" ry="14" fill="#fff" />
  <Path d="M34,38 Q34,22 50,22 Q66,22 66,38 L66,58 Q50,64 34,58 Z" fill="#FFD5A8" />
  <Path d="M34,38 Q34,24 50,24 Q66,24 66,38 Q66,28 58,26 Q50,22 42,26 Q34,30 34,38 Z" fill="#4A2800" />
  <Circle cx="43" cy="46" r="3.5" fill="#2D1B0E" />
  <Circle cx="57" cy="46" r="3.5" fill="#2D1B0E" />
  <Path d="M44,54 Q50,59 56,54" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Circle cx="72" cy="54" r="16" fill="#fff" stroke="#FF4444" strokeWidth="2" />
  <Rect x="69" y="48" width="6" height="12" rx="3" fill="#FF4444" />
  <Rect x="66" y="51" width="12" height="6" rx="3" fill="#FF4444" />
</>);

const friend: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="34" cy="74" rx="16" ry="12" fill="#FF8B94" />
  <Circle cx="34" cy="46" r="14" fill="#FFD5A8" />
  <Circle cx="30" cy="43" r="2.5" fill="#2D1B0E" />
  <Circle cx="38" cy="43" r="2.5" fill="#2D1B0E" />
  <Path d="M30,51 Q34,56 38,51" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  <Ellipse cx="66" cy="74" rx="16" ry="12" fill="#5B8DEF" />
  <Circle cx="66" cy="46" r="14" fill="#FFD5A8" />
  <Circle cx="62" cy="43" r="2.5" fill="#2D1B0E" />
  <Circle cx="70" cy="43" r="2.5" fill="#2D1B0E" />
  <Path d="M62,51 Q66,56 70,51" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  <Path d="M44,68 Q50,72 56,68" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" fill="none" />
</>);

const boy: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="74" rx="22" ry="14" fill="#5B8DEF" />
  <Path d="M34,38 Q34,22 50,22 Q66,22 66,38 L66,58 Q50,64 34,58 Z" fill="#FFD5A8" />
  <Path d="M34,38 Q34,24 50,24 Q66,24 66,38 Q66,28 58,26 Q50,22 42,26 Q34,30 34,38 Z" fill="#8B5E3C" />
  <Circle cx="43" cy="46" r="3.5" fill="#2D1B0E" />
  <Circle cx="57" cy="46" r="3.5" fill="#2D1B0E" />
  <Path d="M44,54 Q50,59 56,54" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
</>);

const girl: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="74" rx="22" ry="14" fill="#FF88CC" />
  <Path d="M32,34 Q32,20 50,20 Q68,20 68,34 L68,58 Q50,66 32,58 Z" fill="#FFD5A8" />
  <Path d="M32,34 Q32,20 50,20 Q68,20 68,34 Q60,22 50,20 Q40,22 32,34 Z" fill="#8B5E3C" />
  <Path d="M68,34 Q78,44 72,60" fill="#8B5E3C" stroke="#8B5E3C" strokeWidth="1" />
  <Path d="M32,34 Q22,44 28,60" fill="#8B5E3C" stroke="#8B5E3C" strokeWidth="1" />
  <Circle cx="43" cy="46" r="3.5" fill="#2D1B0E" />
  <Circle cx="57" cy="46" r="3.5" fill="#2D1B0E" />
  <Path d="M44,54 Q50,59 56,54" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Circle cx="68" cy="26" r="6" fill="#FF44AA" />
</>);

const grandma: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="74" rx="22" ry="14" fill="#C3AED6" />
  <Path d="M34,38 Q34,22 50,22 Q66,22 66,38 L66,58 Q50,64 34,58 Z" fill="#FFD5A8" />
  <Path d="M34,38 Q34,24 50,24 Q66,24 66,38 Q66,28 58,26 Q50,22 42,26 Q34,30 34,38 Z" fill="#DDD" />
  <Path d="M66,34 Q76,40 72,58 Q80,46 74,34" fill="#DDD" />
  <Path d="M34,34 Q24,40 28,58 Q20,46 26,34" fill="#DDD" />
  <Ellipse cx="40" cy="47" rx="5" ry="3" fill="none" stroke="#2D1B0E" strokeWidth="1.5" />
  <Ellipse cx="60" cy="47" rx="5" ry="3" fill="none" stroke="#2D1B0E" strokeWidth="1.5" />
  <Circle cx="40" cy="47" r="2" fill="#2D1B0E" />
  <Circle cx="60" cy="47" r="2" fill="#2D1B0E" />
  <Path d="M44,55 Q50,59 56,55" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
</>);

const grandpa: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="74" rx="22" ry="14" fill="#888" />
  <Path d="M34,38 Q34,22 50,22 Q66,22 66,38 L66,58 Q50,64 34,58 Z" fill="#FFD5A8" />
  <Path d="M34,38 Q34,24 50,24 Q66,24 66,38 Q66,28 58,26 Q50,22 42,26 Q34,30 34,38 Z" fill="#DDD" />
  <Rect x="28" y="18" width="44" height="12" rx="6" fill="#555" />
  <Ellipse cx="40" cy="47" rx="5" ry="3" fill="none" stroke="#2D1B0E" strokeWidth="1.5" />
  <Ellipse cx="60" cy="47" rx="5" ry="3" fill="none" stroke="#2D1B0E" strokeWidth="1.5" />
  <Circle cx="40" cy="47" r="2" fill="#2D1B0E" />
  <Circle cx="60" cy="47" r="2" fill="#2D1B0E" />
  <Path d="M42,56 Q50,52 58,56" stroke="#DDD" strokeWidth="3" strokeLinecap="round" fill="none" />
</>);

// ── COLORS ────────────────────────────────────────────────────────────────────
const colorCard = (fill: string, shape: React.ReactNode) => (_c: string) => (<>
  <Rect x="0" y="0" width="100" height="100" fill={fill} opacity={0.15} />
  <Circle cx="50" cy="50" r="36" fill={fill} />
  {shape}
</>);

const red: I = colorCard('#FF2222', <><Circle cx="50" cy="50" r="28" fill="#FF4444" /><Circle cx="50" cy="50" r="18" fill="#FF6666" /><Circle cx="44" cy="44" r="5" fill="#FF8888" opacity={0.6} /></>);
const blue: I = colorCard('#1144CC', <><Circle cx="50" cy="50" r="28" fill="#3366EE" /><Circle cx="50" cy="50" r="18" fill="#5588FF" /><Circle cx="44" cy="44" r="5" fill="#88AAFF" opacity={0.6} /></>);
const green: I = colorCard('#228822', <><Circle cx="50" cy="50" r="28" fill="#44AA44" /><Circle cx="50" cy="50" r="18" fill="#66CC66" /><Circle cx="44" cy="44" r="5" fill="#99EE99" opacity={0.6} /></>);
const yellow: I = colorCard('#EE9900', <><Circle cx="50" cy="50" r="28" fill="#FFBB00" /><Circle cx="50" cy="50" r="18" fill="#FFD700" /><Circle cx="44" cy="44" r="5" fill="#FFE880" opacity={0.6} /></>);
const colorOrange: I = colorCard('#DD6600', <><Circle cx="50" cy="50" r="28" fill="#FF8800" /><Circle cx="50" cy="50" r="18" fill="#FFAA33" /><Circle cx="44" cy="44" r="5" fill="#FFCC77" opacity={0.6} /></>);
const purple: I = colorCard('#660099', <><Circle cx="50" cy="50" r="28" fill="#8822BB" /><Circle cx="50" cy="50" r="18" fill="#AA44DD" /><Circle cx="44" cy="44" r="5" fill="#CC88EE" opacity={0.6} /></>);
const pink: I = colorCard('#CC2277', <><Circle cx="50" cy="50" r="28" fill="#EE44AA" /><Circle cx="50" cy="50" r="18" fill="#FF77CC" /><Circle cx="44" cy="44" r="5" fill="#FFAAEE" opacity={0.6} /></>);
const white: I = _c => (<>
  <Circle cx="50" cy="50" r="46" fill="#EEF0FF" />
  <Circle cx="50" cy="50" r="36" fill="#fff" stroke="#DDD" strokeWidth="2" />
  <Circle cx="50" cy="50" r="28" fill="#F8F8F8" stroke="#DDD" strokeWidth="1.5" />
  <Circle cx="44" cy="44" r="5" fill="#fff" stroke="#DDD" strokeWidth="1" />
</>);
const black: I = _c => (<>
  <Circle cx="50" cy="50" r="46" fill="#222233" />
  <Circle cx="50" cy="50" r="36" fill="#111122" />
  <Circle cx="50" cy="50" r="28" fill="#1A1A2E" />
  <Circle cx="30" cy="30" r="4" fill="#fff" opacity={0.8} />
  <Circle cx="60" cy="20" r="3" fill="#fff" opacity={0.7} />
  <Circle cx="74" cy="40" r="2.5" fill="#fff" opacity={0.6} />
  <Circle cx="20" cy="55" r="2" fill="#fff" opacity={0.5} />
  <Circle cx="70" cy="66" r="3" fill="#fff" opacity={0.6} />
</>);
const brown: I = colorCard('#6B3F10', <><Circle cx="50" cy="50" r="28" fill="#8B5E3C" /><Circle cx="50" cy="50" r="18" fill="#A07850" /><Circle cx="44" cy="44" r="5" fill="#C09870" opacity={0.6} /></>);

// ── PLACES ────────────────────────────────────────────────────────────────────
const home: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Polygon points="50,14 84,40 16,40" fill="#FF8B6A" />
  <Rect x="18" y="40" width="64" height="44" rx="2" fill="#F0D0B0" />
  <Rect x="40" y="54" width="20" height="30" rx="3" fill="#8B5E3C" />
  <Rect x="24" y="48" width="16" height="16" rx="2" fill="#88CCFF" />
  <Rect x="60" y="48" width="16" height="16" rx="2" fill="#88CCFF" />
  <Line x1="32" y1="48" x2="32" y2="64" stroke="#5599CC" strokeWidth="1.5" />
  <Line x1="24" y1="56" x2="40" y2="56" stroke="#5599CC" strokeWidth="1.5" />
  <Circle cx="58" cy="70" r="3" fill="#C8A060" />
</>);

const school: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="14" y="36" width="72" height="48" rx="3" fill="#E8D0A0" />
  <Rect x="14" y="36" width="72" height="12" rx="3" fill="#C8A060" />
  <Rect x="44" y="62" width="12" height="22" rx="2" fill="#8B5E3C" />
  <Rect x="22" y="48" width="16" height="14" rx="2" fill="#88CCFF" />
  <Rect x="62" y="48" width="16" height="14" rx="2" fill="#88CCFF" />
  <Line x1="50" y1="14" x2="50" y2="36" stroke="#C8A060" strokeWidth="3" />
  <Ellipse cx="50" cy="12" rx="6" ry="6" fill="#FFD700" stroke="#C8A060" strokeWidth="2" />
</>);

const park: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#E8FFE8" opacity={0.8} />
  <Rect x="0" y="68" width="100" height="32" rx="0" fill="#6EC6A1" />
  <Ellipse cx="28" cy="52" rx="18" ry="22" fill="#4A9A4A" />
  <Ellipse cx="28" cy="50" rx="14" ry="18" fill="#6ABB6A" />
  <Rect x="24" y="60" width="8" height="20" rx="3" fill="#8B5E3C" />
  <Ellipse cx="68" cy="54" rx="16" ry="20" fill="#4A9A4A" />
  <Ellipse cx="68" cy="52" rx="12" ry="16" fill="#6ABB6A" />
  <Rect x="64" y="62" width="8" height="16" rx="3" fill="#8B5E3C" />
  <Rect x="40" y="68" width="20" height="6" rx="3" fill="#C8A060" />
  <Rect x="42" y="60" width="3" height="10" rx="1.5" fill="#8B5E3C" />
  <Rect x="55" y="60" width="3" height="10" rx="1.5" fill="#8B5E3C" />
</>);

const hospital: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="16" y="32" width="68" height="52" rx="3" fill="#fff" stroke="#DDD" strokeWidth="2" />
  <Rect x="16" y="32" width="68" height="14" rx="3" fill="#5B8DEF" />
  <Rect x="44" y="58" width="12" height="26" rx="2" fill="#8B5E3C" />
  <Rect x="26" y="50" width="14" height="14" rx="2" fill="#88CCFF" />
  <Rect x="60" y="50" width="14" height="14" rx="2" fill="#88CCFF" />
  <Rect x="44" y="20" width="5" height="14" rx="2.5" fill="#FF4444" />
  <Rect x="39" y="25" width="15" height="5" rx="2.5" fill="#FF4444" />
</>);

const store: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="14" y="38" width="72" height="46" rx="3" fill="#F0D0A0" />
  <Path d="M14,38 Q14,26 26,26 L74,26 Q86,26 86,38" fill="#FF8B6A" />
  <Rect x="18" y="50" width="28" height="34" rx="2" fill="#88CCFF" />
  <Rect x="54" y="58" width="28" height="26" rx="2" fill="#C8A060" />
  <Rect x="14" y="36" width="72" height="6" fill="#E07040" />
  <Line x1="32" y1="50" x2="32" y2="84" stroke="#5599CC" strokeWidth="1.5" />
  <Line x1="18" y1="67" x2="46" y2="67" stroke="#5599CC" strokeWidth="1.5" />
  <Circle cx="68" cy="70" r="3" fill="#FFD700" />
</>);

// ── OBJECTS ───────────────────────────────────────────────────────────────────
const ball: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="50" r="34" fill="#FF6B6B" />
  <Path d="M18,42 Q34,30 50,42 Q66,54 82,42" stroke="#CC2222" strokeWidth="2.5" fill="none" />
  <Path d="M50,16 Q40,34 50,50 Q60,66 50,84" stroke="#CC2222" strokeWidth="2.5" fill="none" />
  <Ellipse cx="36" cy="36" rx="8" ry="5" fill="#fff" opacity={0.25} />
</>);

const book: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="18" y="26" width="64" height="54" rx="4" fill="#5B8DEF" />
  <Rect x="46" y="26" width="4" height="54" fill="#3A6BD4" />
  <Rect x="22" y="32" width="20" height="3" rx="1.5" fill="#fff" opacity={0.7} />
  <Rect x="22" y="39" width="20" height="3" rx="1.5" fill="#fff" opacity={0.7} />
  <Rect x="22" y="46" width="16" height="3" rx="1.5" fill="#fff" opacity={0.7} />
  <Rect x="22" y="53" width="20" height="3" rx="1.5" fill="#fff" opacity={0.7} />
  <Rect x="22" y="60" width="14" height="3" rx="1.5" fill="#fff" opacity={0.7} />
  <Rect x="54" y="32" width="20" height="3" rx="1.5" fill="#fff" opacity={0.7} />
  <Rect x="54" y="39" width="20" height="3" rx="1.5" fill="#fff" opacity={0.7} />
  <Rect x="54" y="46" width="16" height="3" rx="1.5" fill="#fff" opacity={0.7} />
  <Rect x="54" y="53" width="20" height="3" rx="1.5" fill="#fff" opacity={0.7} />
</>);

const bag: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M36,30 Q36,20 50,20 Q64,20 64,30" stroke="#5B8DEF" strokeWidth="5" fill="none" strokeLinecap="round" />
  <Rect x="22" y="30" width="56" height="52" rx="8" fill="#5B8DEF" />
  <Rect x="22" y="30" width="56" height="14" rx="8" fill="#3A6BD4" />
  <Rect x="36" y="52" width="28" height="6" rx="3" fill="#fff" opacity={0.4} />
  <Line x1="36" y1="52" x2="36" y2="82" stroke="#3A6BD4" strokeWidth="2" />
  <Line x1="64" y1="52" x2="64" y2="82" stroke="#3A6BD4" strokeWidth="2" />
</>);

const chair: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="18" y="42" width="64" height="12" rx="4" fill="#C8824A" />
  <Rect x="18" y="34" width="8" height="42" rx="4" fill="#A07840" />
  <Rect x="74" y="34" width="8" height="42" rx="4" fill="#A07840" />
  <Rect x="18" y="54" width="8" height="22" rx="4" fill="#A07840" />
  <Rect x="74" y="54" width="8" height="22" rx="4" fill="#A07840" />
</>);

const bed: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="14" y="50" width="72" height="32" rx="5" fill="#C8824A" />
  <Rect x="14" y="50" width="72" height="8" rx="4" fill="#A07840" />
  <Rect x="16" y="30" width="68" height="26" rx="5" fill="#F5E8D0" />
  <Rect x="16" y="26" width="26" height="18" rx="4" fill="#fff" />
  <Rect x="58" y="26" width="26" height="18" rx="4" fill="#fff" />
  <Rect x="14" y="72" width="72" height="6" rx="3" fill="#8B5E3C" />
</>);

const door: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="26" y="18" width="48" height="68" rx="4" fill="#C8824A" />
  <Rect x="28" y="20" width="44" height="64" rx="3" fill="#E8A060" />
  <Rect x="30" y="22" width="40" height="28" rx="2" fill="#F0C080" />
  <Rect x="30" y="54" width="40" height="28" rx="2" fill="#F0C080" />
  <Circle cx="58" cy="52" r="4" fill="#FFD700" />
</>);

const car: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="12" y="52" width="76" height="24" rx="6" fill="#5B8DEF" />
  <Path d="M22,52 Q28,32 44,32 L56,32 Q72,32 78,52 Z" fill="#5B8DEF" />
  <Rect x="26" y="36" width="20" height="16" rx="3" fill="#88CCFF" />
  <Rect x="54" y="36" width="20" height="16" rx="3" fill="#88CCFF" />
  <Circle cx="28" cy="76" r="10" fill="#2D1B0E" />
  <Circle cx="28" cy="76" r="6" fill="#888" />
  <Circle cx="72" cy="76" r="10" fill="#2D1B0E" />
  <Circle cx="72" cy="76" r="6" fill="#888" />
  <Circle cx="82" cy="58" r="5" fill="#FFD700" opacity={0.9} />
</>);

const bus: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="10" y="30" width="80" height="46" rx="6" fill="#FFD700" />
  <Rect x="10" y="30" width="80" height="14" rx="6" fill="#E8C000" />
  <Rect x="16" y="34" width="14" height="10" rx="2" fill="#88CCFF" />
  <Rect x="34" y="34" width="14" height="10" rx="2" fill="#88CCFF" />
  <Rect x="52" y="34" width="14" height="10" rx="2" fill="#88CCFF" />
  <Rect x="70" y="34" width="14" height="10" rx="2" fill="#88CCFF" />
  <Rect x="16" y="48" width="14" height="10" rx="2" fill="#88CCFF" />
  <Rect x="34" y="48" width="14" height="10" rx="2" fill="#88CCFF" />
  <Rect x="52" y="48" width="14" height="10" rx="2" fill="#88CCFF" />
  <Rect x="70" y="48" width="14" height="10" rx="2" fill="#88CCFF" />
  <Circle cx="24" cy="76" r="8" fill="#2D1B0E" /><Circle cx="24" cy="76" r="4" fill="#888" />
  <Circle cx="76" cy="76" r="8" fill="#2D1B0E" /><Circle cx="76" cy="76" r="4" fill="#888" />
</>);

const bicycle: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="26" cy="62" r="18" fill="none" stroke="#5B8DEF" strokeWidth="4" />
  <Circle cx="74" cy="62" r="18" fill="none" stroke="#5B8DEF" strokeWidth="4" />
  <Circle cx="26" cy="62" r="4" fill="#5B8DEF" />
  <Circle cx="74" cy="62" r="4" fill="#5B8DEF" />
  <Line x1="26" y1="62" x2="50" y2="44" stroke="#5B8DEF" strokeWidth="4" strokeLinecap="round" />
  <Line x1="74" y1="62" x2="50" y2="44" stroke="#5B8DEF" strokeWidth="4" strokeLinecap="round" />
  <Line x1="50" y1="44" x2="50" y2="62" stroke="#5B8DEF" strokeWidth="4" strokeLinecap="round" />
  <Line x1="44" y1="62" x2="56" y2="62" stroke="#FF8B6A" strokeWidth="4" strokeLinecap="round" />
  <Line x1="42" y1="36" x2="58" y2="36" stroke="#C8824A" strokeWidth="4" strokeLinecap="round" />
  <Line x1="50" y1="36" x2="50" y2="44" stroke="#C8824A" strokeWidth="4" strokeLinecap="round" />
</>);

const phone: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="28" y="14" width="44" height="74" rx="8" fill="#1A1A2E" />
  <Rect x="30" y="20" width="40" height="60" rx="5" fill="#4466FF" opacity={0.3} />
  <Rect x="30" y="20" width="40" height="60" rx="5" fill="none" stroke="#88AAFF" strokeWidth="1" />
  <Circle cx="50" cy="82" r="4" fill="#444" />
  <Rect x="42" y="16" width="16" height="3" rx="1.5" fill="#444" />
  <Rect x="34" y="34" width="32" height="3" rx="1.5" fill="#88AAFF" opacity={0.6} />
  <Rect x="34" y="42" width="24" height="3" rx="1.5" fill="#88AAFF" opacity={0.6} />
  <Rect x="34" y="50" width="28" height="3" rx="1.5" fill="#88AAFF" opacity={0.6} />
</>);

// ── NUMBERS ───────────────────────────────────────────────────────────────────
const one: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M42,22 L50,16 L50,70" stroke={c} strokeWidth="10" fill="none" strokeLinecap="round" />
  <Line x1="36" y1="70" x2="64" y2="70" stroke={c} strokeWidth="8" strokeLinecap="round" />
  <Circle cx="80" cy="24" r="10" fill={c} opacity={0.8} />
</>);

const two: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M32,28 Q32,16 50,16 Q68,16 68,28 Q68,44 32,66 L68,66" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  <Circle cx="74" cy="20" r="9" fill={c} opacity={0.8} />
  <Circle cx="88" cy="36" r="9" fill={c} opacity={0.8} />
</>);

const three: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M32,18 L66,18 L46,42 Q68,42 68,58 Q68,74 50,74 Q34,74 32,62" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  <Circle cx="72" cy="18" r="8" fill={c} opacity={0.8} />
  <Circle cx="84" cy="34" r="8" fill={c} opacity={0.8} />
  <Circle cx="84" cy="52" r="8" fill={c} opacity={0.8} />
</>);

const four: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M56,16 L20,56 L72,56" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  <Line x1="56" y1="16" x2="56" y2="76" stroke={c} strokeWidth="8" strokeLinecap="round" />
  <Circle cx="18" cy="18" r="8" fill={c} opacity={0.8} />
  <Circle cx="6" cy="34" r="8" fill={c} opacity={0.8} />
  <Circle cx="6" cy="52" r="8" fill={c} opacity={0.8} />
  <Circle cx="18" cy="68" r="8" fill={c} opacity={0.8} />
</>);

const five: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M64,18 L36,18 L32,44 Q38,38 50,38 Q68,38 68,56 Q68,74 50,74 Q34,74 32,62" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  <Circle cx="14" cy="18" r="8" fill={c} opacity={0.8} />
  <Circle cx="2" cy="34" r="8" fill={c} opacity={0.8} />
  <Circle cx="2" cy="52" r="8" fill={c} opacity={0.8} />
  <Circle cx="14" cy="68" r="8" fill={c} opacity={0.8} />
  <Circle cx="30" cy="78" r="8" fill={c} opacity={0.8} />
</>);

// ── ROUTINES ──────────────────────────────────────────────────────────────────
const wakeup: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#FFF8E8" opacity={0.9} />
  <Circle cx="50" cy="50" r="32" fill="#FFD700" />
  <Circle cx="50" cy="50" r="24" fill="#FFE840" />
  <Line x1="50" y1="8" x2="50" y2="18" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
  <Line x1="50" y1="82" x2="50" y2="92" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
  <Line x1="8" y1="50" x2="18" y2="50" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
  <Line x1="82" y1="50" x2="92" y2="50" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
  <Line x1="21" y1="21" x2="28" y2="28" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
  <Line x1="72" y1="72" x2="79" y2="79" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
  <Line x1="79" y1="21" x2="72" y2="28" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
  <Line x1="28" y1="72" x2="21" y2="79" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
</>);

const brushteeth: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="44" y="16" width="12" height="52" rx="6" fill="#5B8DEF" />
  <Rect x="36" y="16" width="28" height="18" rx="6" fill="#88CCFF" />
  <Rect x="38" y="20" width="5" height="10" rx="2.5" fill="#fff" />
  <Rect x="45" y="20" width="5" height="10" rx="2.5" fill="#fff" />
  <Rect x="52" y="20" width="5" height="10" rx="2.5" fill="#fff" />
  <Path d="M24,72 Q32,64 50,68 Q68,72 76,64" stroke="#5B8DEF" strokeWidth="6" fill="none" strokeLinecap="round" />
  <Ellipse cx="60" cy="56" rx="16" ry="8" fill="#FF4499" opacity={0.3} />
</>);

const getdressed: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M30,28 L20,44 L34,46 L34,80 L66,80 L66,46 L80,44 L70,28 Q62,36 50,36 Q38,36 30,28 Z" fill="#C3AED6" />
  <Path d="M30,28 Q38,36 50,36 Q62,36 70,28 L62,24 Q56,20 50,20 Q44,20 38,24 Z" fill="#FFD5A8" />
  <Rect x="44" y="46" width="12" height="4" rx="2" fill="#fff" opacity={0.4} />
  <Rect x="44" y="54" width="12" height="4" rx="2" fill="#fff" opacity={0.4} />
</>);

const eatbreakfast: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M18,70 Q18,86 50,86 Q82,86 82,70 L78,50 Q50,56 22,50 Z" fill="#F5E8D0" stroke="#DDD" strokeWidth="1.5" />
  <Ellipse cx="50" cy="50" rx="30" ry="10" fill="#E8D8B0" />
  <Circle cx="50" cy="48" r="12" fill="#FFD700" />
  <Circle cx="50" cy="48" r="8" fill="#FFA500" />
  <Line x1="80" y1="40" x2="80" y2="78" stroke="#C8A060" strokeWidth="5" strokeLinecap="round" />
  <Ellipse cx="80" cy="38" rx="5" ry="4" fill="#C8A060" />
</>);

const packbag: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M36,26 Q36,18 50,18 Q64,18 64,26" stroke="#FF8B6A" strokeWidth="5" fill="none" strokeLinecap="round" />
  <Rect x="20" y="26" width="60" height="58" rx="10" fill="#FF8B6A" />
  <Rect x="20" y="26" width="60" height="18" rx="10" fill="#E06040" />
  <Rect x="34" y="54" width="32" height="8" rx="4" fill="#fff" opacity={0.4} />
  <Line x1="34" y1="54" x2="34" y2="84" stroke="#E06040" strokeWidth="2" />
  <Line x1="66" y1="54" x2="66" y2="84" stroke="#E06040" strokeWidth="2" />
  <Circle cx="50" cy="38" r="6" fill="#FFD700" opacity={0.8} />
</>);

// ── AAC CORE VOCABULARY ───────────────────────────────────────────────────────
const yes: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="50" r="34" fill="#4CAF82" opacity={0.2} />
  <Path d="M22,50 L40,68 L78,28" stroke="#4CAF82" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const no: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="50" r="34" fill="#EF5350" opacity={0.2} />
  <Line x1="28" y1="28" x2="72" y2="72" stroke="#EF5350" strokeWidth="10" strokeLinecap="round" />
  <Line x1="72" y1="28" x2="28" y2="72" stroke="#EF5350" strokeWidth="10" strokeLinecap="round" />
</>);

const more: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M28,60 Q28,40 40,36 L50,32 L60,36 Q72,40 72,60" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Path d="M28,60 Q28,40 40,36 L50,32 L60,36 Q72,40 72,60" fill="none" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="36" cy="64" r="8" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="64" cy="64" r="8" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Rect x="44" y="44" width="12" height="6" rx="3" fill={c} opacity={0.8} />
  <Rect x="47" y="41" width="6" height="12" rx="3" fill={c} opacity={0.8} />
</>);

const done: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M22,52 Q22,36 32,32 L44,44 L50,38" fill="#FFD5A8" stroke="#C8A070" strokeWidth="2" strokeLinecap="round" />
  <Circle cx="36" cy="56" r="8" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Path d="M78,52 Q78,36 68,32 L56,44 L50,38" fill="#FFD5A8" stroke="#C8A070" strokeWidth="2" strokeLinecap="round" />
  <Circle cx="64" cy="56" r="8" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Rect x="34" y="70" width="32" height="6" rx="3" fill={c} opacity={0.8} />
</>);

const want: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M22,68 Q22,50 30,44 L50,56 L70,44 Q78,50 78,68" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="36" cy="56" r="8" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="64" cy="56" r="8" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Path d="M36,44 L50,30 L64,44" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const like: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M50,24 Q66,12 74,28 Q82,44 50,64 Q18,44 26,28 Q34,12 50,24 Z" fill="#FF6B6B" />
  <Path d="M50,24 Q66,12 74,28 Q82,44 50,64 Q18,44 26,28 Q34,12 50,24 Z" fill="none" stroke="#CC2222" strokeWidth="2" />
  <Ellipse cx="38" cy="34" rx="8" ry="5" fill="#FF9B9B" opacity={0.5} />
</>);

const good: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M38,70 L38,46 Q38,36 46,34 Q52,32 54,38 L60,28 Q66,22 70,28 Q74,34 68,42 L76,42 Q82,44 80,52 Q80,58 72,60 Q70,68 64,68 Z" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" strokeLinejoin="round" />
  <Rect x="28" y="54" width="12" height="18" rx="4" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
</>);

const bad: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M38,30 L38,54 Q38,64 46,66 Q52,68 54,62 L60,72 Q66,78 70,72 Q74,66 68,58 L76,58 Q82,56 80,48 Q80,42 72,40 Q70,32 64,32 Z" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" strokeLinejoin="round" />
  <Rect x="28" y="28" width="12" height="18" rx="4" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
</>);

const me: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="28" r="14" fill="#FFD5A8" />
  <Ellipse cx="50" cy="60" rx="20" ry="16" fill="#5B8DEF" />
  <Path d="M50,44 L50,82" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,65 L32,56" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="38" cy="78" r="5" fill="#FFD5A8" />
</>);

const you: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="34" cy="28" r="12" fill="#FFD5A8" />
  <Ellipse cx="34" cy="56" rx="16" ry="14" fill="#6EC6A1" />
  <Path d="M50,44 Q56,38 72,36" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="76" cy="34" r="7" fill="#FFD5A8" />
</>);

const i_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="26" r="14" fill="#FFD5A8" />
  <Ellipse cx="50" cy="58" rx="20" ry="16" fill="#C3AED6" />
  <Path d="M50,44 L50,82" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,58 L36,76" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="34" cy="78" r="5" fill="#FFD5A8" />
  <Circle cx="50" cy="46" r="5" fill={c} opacity={0.8} />
</>);

const we: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="34" cy="26" r="11" fill="#FFD5A8" />
  <Circle cx="66" cy="26" r="11" fill="#FFD5A8" />
  <Ellipse cx="34" cy="54" rx="15" ry="13" fill="#FF8B94" />
  <Ellipse cx="66" cy="54" rx="15" ry="13" fill="#5B8DEF" />
  <Path d="M44,68 Q50,74 56,68" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" fill="none" />
</>);

const go: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="50" r="34" fill="#4CAF82" opacity={0.2} />
  <Path d="M28,50 L62,50 M50,36 L64,50 L50,64" stroke="#4CAF82" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const big: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M20,70 Q14,50 20,30" stroke="#FFD5A8" strokeWidth="8" strokeLinecap="round" fill="none" />
  <Circle cx="14" cy="72" r="7" fill="#FFD5A8" />
  <Path d="M80,70 Q86,50 80,30" stroke="#FFD5A8" strokeWidth="8" strokeLinecap="round" fill="none" />
  <Circle cx="86" cy="72" r="7" fill="#FFD5A8" />
  <Path d="M28,50 L72,50" stroke={c} strokeWidth="4" strokeDasharray="6,4" strokeLinecap="round" />
</>);

const little: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M30,58 Q26,50 30,42" stroke="#FFD5A8" strokeWidth="8" strokeLinecap="round" fill="none" />
  <Circle cx="24" cy="60" r="7" fill="#FFD5A8" />
  <Path d="M70,58 Q74,50 70,42" stroke="#FFD5A8" strokeWidth="8" strokeLinecap="round" fill="none" />
  <Circle cx="76" cy="60" r="7" fill="#FFD5A8" />
  <Path d="M36,50 L64,50" stroke={c} strokeWidth="4" strokeDasharray="4,4" strokeLinecap="round" />
</>);

const hot: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#FFF0E0" opacity={0.9} />
  <Circle cx="50" cy="50" r="26" fill="#FF8C00" />
  <Circle cx="50" cy="50" r="18" fill="#FFD700" />
  <Line x1="50" y1="12" x2="50" y2="20" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />
  <Line x1="50" y1="80" x2="50" y2="88" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />
  <Line x1="12" y1="50" x2="20" y2="50" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />
  <Line x1="80" y1="50" x2="88" y2="50" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />
  <Line x1="24" y1="24" x2="30" y2="30" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />
  <Line x1="70" y1="70" x2="76" y2="76" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />
  <Line x1="76" y1="24" x2="70" y2="30" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />
  <Line x1="30" y1="70" x2="24" y2="76" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />
</>);

const cold: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#E8F4FF" opacity={0.9} />
  <Line x1="50" y1="10" x2="50" y2="90" stroke="#88CCFF" strokeWidth="5" strokeLinecap="round" />
  <Line x1="10" y1="50" x2="90" y2="50" stroke="#88CCFF" strokeWidth="5" strokeLinecap="round" />
  <Line x1="22" y1="22" x2="78" y2="78" stroke="#88CCFF" strokeWidth="5" strokeLinecap="round" />
  <Line x1="78" y1="22" x2="22" y2="78" stroke="#88CCFF" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="50" cy="50" r="10" fill="#88CCFF" />
  <Circle cx="50" cy="20" r="5" fill="#88CCFF" />
  <Circle cx="50" cy="80" r="5" fill="#88CCFF" />
  <Circle cx="20" cy="50" r="5" fill="#88CCFF" />
  <Circle cx="80" cy="50" r="5" fill="#88CCFF" />
</>);

const bathroom: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="66" rx="26" ry="14" fill="#E8E8FF" stroke="#AAAACC" strokeWidth="2" />
  <Rect x="24" y="54" width="52" height="14" rx="5" fill="#F0F0FF" stroke="#AAAACC" strokeWidth="2" />
  <Path d="M32,54 L32,40 Q32,32 40,32 L50,32" stroke="#AAAACC" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Circle cx="50" cy="30" r="5" fill="#AAAACC" />
  <Circle cx="46" cy="72" r="4" fill="#AAAACC" />
  <Circle cx="54" cy="72" r="4" fill="#AAAACC" />
</>);

const outside: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#E8FFE8" opacity={0.9} />
  <Rect x="0" y="60" width="100" height="40" fill="#6EC6A1" />
  <Circle cx="72" cy="30" r="18" fill="#FFD700" />
  <Ellipse cx="28" cy="52" rx="16" ry="20" fill="#4A9A4A" />
  <Ellipse cx="50" cy="54" rx="12" ry="16" fill="#5AAA5A" />
  <Polygon points="50,14 84,40 16,40" fill="#FF8B6A" />
  <Rect x="18" y="40" width="64" height="20" rx="2" fill="#F0D0B0" />
  <Rect x="40" y="40" width="20" height="20" rx="3" fill="#8B5E3C" />
</>);

const hungry: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="38" r="22" fill="#FFD5A8" />
  <Circle cx="42" cy="34" r="4" fill="#2D1B0E" />
  <Circle cx="58" cy="34" r="4" fill="#2D1B0E" />
  <Path d="M38,46 Q50,56 62,46" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <Ellipse cx="50" cy="72" rx="16" ry="10" fill="#FF8C00" opacity={0.3} />
  <Path d="M44,62 Q44,70 50,74 Q56,70 56,62" stroke="#FF8C00" strokeWidth="3" fill="none" strokeLinecap="round" />
</>);

const thirsty: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="36" r="20" fill="#FFD5A8" />
  <Circle cx="43" cy="32" r="3.5" fill="#2D1B0E" />
  <Circle cx="57" cy="32" r="3.5" fill="#2D1B0E" />
  <Path d="M44,44 Q50,42 56,44" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Path d="M46,56 Q50,80 54,56" stroke="#88CCFF" strokeWidth="4" fill="none" strokeLinecap="round" />
  <Circle cx="50" cy="82" r="7" fill="#88CCFF" opacity={0.7} />
</>);

const hurt: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="38" r="20" fill="#FFD5A8" />
  <Circle cx="43" cy="34" r="3.5" fill="#2D1B0E" />
  <Circle cx="57" cy="34" r="3.5" fill="#2D1B0E" />
  <Path d="M42,44 Q50,40 58,44" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Circle cx="50" cy="72" r="16" fill="#FF6B6B" opacity={0.3} />
  <Path d="M44,68 L56,68 M50,62 L50,74" stroke="#FF4444" strokeWidth="3" strokeLinecap="round" />
</>);

// ── FUNCTION / CORE WORDS ─────────────────────────────────────────────────────
const need: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="28" r="14" fill="#FFD5A8" />
  <Ellipse cx="50" cy="56" rx="18" ry="14" fill={c} opacity={0.8} />
  <Path d="M50,42 L50,80" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,54 L32,42" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,54 L68,42" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="32" cy="40" r="6" fill="#FFD5A8" />
  <Circle cx="68" cy="40" r="6" fill="#FFD5A8" />
</>);

const is_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="22" y="38" width="56" height="10" rx="5" fill={c} opacity={0.9} />
  <Rect x="22" y="52" width="56" height="10" rx="5" fill={c} opacity={0.9} />
</>);

const can_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="40" r="22" fill="#FFD5A8" />
  <Circle cx="42" cy="36" r="4" fill="#2D1B0E" />
  <Circle cx="58" cy="36" r="4" fill="#2D1B0E" />
  <Path d="M38,46 Q50,56 62,46" stroke="#2D1B0E" strokeWidth="3" fill="none" strokeLinecap="round" />
  <Path d="M50,62 L50,84" stroke={c} strokeWidth="6" strokeLinecap="round" />
  <Path d="M36,76 L64,76" stroke={c} strokeWidth="6" strokeLinecap="round" />
</>);

const do_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="28" r="12" fill="#FFD5A8" />
  <Ellipse cx="50" cy="54" rx="16" ry="14" fill={c} opacity={0.8} />
  <Path d="M50,40 L50,78" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,50 L32,60" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,50 L68,40" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="76" cy="38" r="8" fill="#FFD700" />
  <Path d="M72,38 L76,42 L82,34" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const have: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M22,70 Q22,52 34,46 L50,56 L66,46 Q78,52 78,70" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="34" cy="46" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="66" cy="46" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="50" cy="68" r="16" fill={c} opacity={0.8} />
  <Circle cx="50" cy="68" r="11" fill={c} />
  <Circle cx="46" cy="64" r="3" fill="#fff" opacity={0.6} />
</>);

const what: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="28" r="12" fill="#FFD5A8" />
  <Ellipse cx="50" cy="56" rx="16" ry="12" fill="#6EC6A1" opacity={0.8} />
  <Path d="M50,40 L50,76" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,52 L32,44" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,52 L68,44" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="76" cy="28" r="16" fill="#fff" stroke={c} strokeWidth="2.5" />
  <Path d="M70,24 Q76,18 82,24 Q82,30 76,32 L76,36" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
  <Circle cx="76" cy="40" r="2.5" fill={c} />
</>);

const where: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M50,18 Q66,18 66,34 Q66,50 50,70 Q34,50 34,34 Q34,18 50,18 Z" fill={c} opacity={0.9} />
  <Circle cx="50" cy="34" r="8" fill="#fff" />
  <Circle cx="76" cy="24" r="16" fill="#fff" stroke={c} strokeWidth="2.5" />
  <Path d="M70,20 Q76,14 82,20 Q82,26 76,28 L76,32" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
  <Circle cx="76" cy="36" r="2.5" fill={c} />
</>);

const who: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="38" cy="46" r="18" fill="#FFD5A8" />
  <Circle cx="32" cy="42" r="3.5" fill="#2D1B0E" />
  <Circle cx="42" cy="42" r="3.5" fill="#2D1B0E" />
  <Path d="M32,52 Q38,57 44,52" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Circle cx="72" cy="30" r="16" fill="#fff" stroke={c} strokeWidth="2.5" />
  <Path d="M66,26 Q72,20 78,26 Q78,32 72,34 L72,38" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
  <Circle cx="72" cy="42" r="2.5" fill={c} />
</>);

const not_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill="#EF5350" opacity={0.15} />
  <Circle cx="50" cy="50" r="34" fill="none" stroke="#EF5350" strokeWidth="5" />
  <Line x1="26" y1="26" x2="74" y2="74" stroke="#EF5350" strokeWidth="8" strokeLinecap="round" />
</>);

const this_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="28" r="12" fill="#FFD5A8" />
  <Ellipse cx="50" cy="54" rx="16" ry="12" fill={c} opacity={0.8} />
  <Path d="M50,40 L50,78" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,54 L34,62" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,60 L70,76" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="74" cy="80" r="7" fill="#FFD5A8" />
  <Path d="M65,72 L80,82" stroke="#FFD5A8" strokeWidth="3" strokeLinecap="round" />
</>);

const that_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="36" cy="34" r="12" fill="#FFD5A8" />
  <Ellipse cx="36" cy="58" rx="14" ry="12" fill={c} opacity={0.8} />
  <Path d="M36,46 L36,76" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M36,56 L18,64" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,56 Q65,48 78,38" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
  <Polygon points="78,28 88,40 72,42" fill={c} />
</>);

const get: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M78,60 Q78,44 66,40 L54,52 L50,44" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" strokeLinecap="round" />
  <Circle cx="66" cy="38" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="34" cy="62" r="18" fill={c} opacity={0.3} />
  <Path d="M60,68 L34,68 M46,56 L34,68 L46,80" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const put: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M22,44 Q22,28 34,26 L46,38 L50,30" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" strokeLinecap="round" />
  <Circle cx="34" cy="24" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Path d="M50,50 L50,66 M38,66 L62,66" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
  <Circle cx="62" cy="70" r="10" fill={c} opacity={0.6} />
</>);

const take: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M78,44 Q78,28 66,26 L54,38 L50,30" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" strokeLinecap="round" />
  <Circle cx="66" cy="24" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Circle cx="34" cy="68" r="14" fill={c} opacity={0.4} />
  <Path d="M34,56 L34,82 M34,56 Q50,46 64,56" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
</>);

const for_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="28" cy="44" r="14" fill="#FFD5A8" />
  <Ellipse cx="28" cy="66" rx="12" ry="10" fill={c} opacity={0.7} />
  <Path d="M28,58 L28,78" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M42,56 L72,56 M60,46 L72,56 L60,66" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  <Circle cx="78" cy="38" r="14" fill="#FFD5A8" />
  <Ellipse cx="78" cy="60" rx="12" ry="10" fill="#6EC6A1" opacity={0.7} />
  <Path d="M78,52 L78,72" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
</>);

const here: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="26" r="12" fill="#FFD5A8" />
  <Ellipse cx="50" cy="52" rx="16" ry="12" fill={c} opacity={0.8} />
  <Path d="M50,38 L50,76" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,52 L32,60" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M38,80 L62,80" stroke={c} strokeWidth="5" strokeLinecap="round" />
  <Path d="M44,70 L50,82 L56,70" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const of_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="34" cy="50" r="20" fill="none" stroke={c} strokeWidth="6" />
  <Circle cx="34" cy="50" r="8" fill={c} opacity={0.5} />
  <Line x1="54" y1="42" x2="70" y2="42" stroke={c} strokeWidth="4" strokeLinecap="round" />
  <Circle cx="78" cy="50" r="14" fill="none" stroke={c} strokeWidth="6" />
</>);

const up: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M50,82 L50,22 M34,38 L50,22 L66,38" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  <Rect x="38" y="70" width="24" height="8" rx="4" fill={c} opacity={0.5} />
</>);

const some: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.12} />
  <Circle cx="50" cy="50" r="34" fill="none" stroke={c} strokeWidth="5" />
  <Path d="M50,16 Q84,16 84,50 Q84,84 50,84" fill={c} opacity={0.7} />
</>);

const all_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="50" r="34" fill={c} opacity={0.7} />
  <Circle cx="50" cy="50" r="22" fill={c} opacity={0.5} />
  <Circle cx="50" cy="50" r="10" fill={c} />
  <Circle cx="42" cy="42" r="5" fill="#fff" opacity={0.5} />
</>);

const see: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Ellipse cx="50" cy="50" rx="36" ry="24" fill="#fff" stroke={c} strokeWidth="3" />
  <Circle cx="50" cy="50" r="14" fill={c} opacity={0.8} />
  <Circle cx="50" cy="50" r="8" fill="#1A1A2E" />
  <Circle cx="46" cy="46" r="3" fill="#fff" opacity={0.8} />
  <Path d="M14,50 Q50,14 86,50" stroke={c} strokeWidth="2" fill="none" opacity={0.3} />
</>);

const come: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="72" cy="30" r="12" fill="#FFD5A8" />
  <Ellipse cx="72" cy="54" rx="14" ry="12" fill={c} opacity={0.8} />
  <Path d="M72,42 L72,74" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M72,52 L58,44" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M28,56 L58,56 M40,44 L28,56 L40,68" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const make: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M22,60 Q22,44 32,40 L44,52 L48,44" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" strokeLinecap="round" />
  <Circle cx="32" cy="38" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Path d="M78,60 Q78,44 68,40 L56,52 L52,44" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" strokeLinecap="round" />
  <Circle cx="68" cy="38" r="10" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" />
  <Rect x="38" y="64" width="24" height="18" rx="4" fill={c} opacity={0.8} />
  <Circle cx="50" cy="56" r="6" fill="#FFD700" />
</>);

const different: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="30" cy="42" r="18" fill="#5B8DEF" opacity={0.7} />
  <Rect x="52" y="30" width="30" height="30" rx="6" fill="#FF8B94" opacity={0.7} />
  <Line x1="46" y1="68" x2="54" y2="68" stroke={c} strokeWidth="3" strokeLinecap="round" strokeDasharray="3,3" />
</>);

const on_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="18" y="66" width="64" height="8" rx="4" fill={c} opacity={0.6} />
  <Circle cx="50" cy="48" r="18" fill={c} opacity={0.8} />
  <Path d="M50,30 L50,66" stroke={c} strokeWidth="4" strokeDasharray="3,3" opacity={0.4} />
</>);

const in_word: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="20" y="40" width="60" height="40" rx="8" fill="none" stroke={c} strokeWidth="5" />
  <Circle cx="50" cy="60" r="12" fill={c} opacity={0.8} />
  <Path d="M50,34 L50,46 M42,40 L50,48 L58,40" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const out: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Rect x="20" y="40" width="60" height="40" rx="8" fill="none" stroke={c} strokeWidth="5" />
  <Circle cx="50" cy="60" r="12" fill={c} opacity={0.4} />
  <Path d="M50,22 L50,38 M42,28 L50,20 L58,28" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>);

const there: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="66" cy="28" r="12" fill="#FFD5A8" />
  <Ellipse cx="66" cy="52" rx="14" ry="12" fill={c} opacity={0.8} />
  <Path d="M66,40 L66,72" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M66,50 L80,42" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M28,56 Q38,44 54,44" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
  <Polygon points="54,38 66,48 52,52" fill={c} />
</>);

const of_space: I = of_word;
const toilet: I = c => bathroom(c);
const finish: I = c => done(c);
const open: I = c => door(c);
const thanks: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="32" r="16" fill="#FFD5A8" />
  <Ellipse cx="50" cy="60" rx="18" ry="14" fill="#5B8DEF" />
  <Path d="M50,46 L50,84" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,56 L32,48" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="28" cy="50" r="6" fill="#FFD5A8" />
  <Path d="M40,22 L46,16 M50,20 L50,12 M60,22 L54,16" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
</>);

const sorry: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="36" r="20" fill="#FFD5A8" />
  <Ellipse cx="38" cy="44" rx="5" ry="3.5" fill="#2D1B0E" opacity={0.7} />
  <Ellipse cx="62" cy="44" rx="5" ry="3.5" fill="#2D1B0E" opacity={0.7} />
  <Path d="M38,50 Q50,44 62,50" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
  <Ellipse cx="50" cy="60" rx="18" ry="14" fill="#C3AED6" />
  <Path d="M40,64 Q50,74 60,64" stroke="#9B8AC4" strokeWidth="2" fill="none" strokeLinecap="round" />
</>);

const hello: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Path d="M44,72 Q38,56 46,42 Q50,34 56,32 Q62,30 66,36 L74,28 Q80,22 84,28 Q88,34 80,44 L84,46 Q90,50 86,58 Q84,64 76,62 Q72,70 66,68 Z" fill="#FFD5A8" stroke="#C8A070" strokeWidth="1.5" strokeLinejoin="round" />
</>);

const goodbye: I = hello;
const please: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="30" r="14" fill="#FFD5A8" />
  <Ellipse cx="50" cy="58" rx="18" ry="14" fill="#FF88CC" />
  <Path d="M50,44 L50,82" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Path d="M50,56 Q38,58 36,64" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="32" cy="66" r="6" fill="#FFD5A8" />
  <Path d="M50,60 Q62,56 64,50" stroke="#FFD5A8" strokeWidth="5" strokeLinecap="round" />
  <Circle cx="36" cy="64" r="3" fill={c} opacity={0.8} />
</>);

// ── LOOKUP TABLE ──────────────────────────────────────────────────────────────
const ILLUST: Record<string, I> = {
  // emotions
  happy, sad, angry, scared, calm, excited, tired, surprised, proud, worried,
  // animals
  dog, cat, bird, fish, rabbit, bear, lion, elephant, duck, frog, butterfly, cow, horse, monkey, turtle,
  // food
  apple, banana, bread, milk, egg, rice, pizza, cookie, cake, orange, carrot, strawberry, grape, watermelon, chicken,
  // actions
  eat, drink, sleep, play, run, walk, jump, sit, stop, help, share, listen, wait, wash, read,
  // people
  mom, dad, baby, teacher, doctor, friend, boy, girl, grandma, grandpa,
  // colors (using colorOrange to avoid collision with orange fruit)
  red, blue, green, yellow, purple, pink, white, black, brown,
  // places
  home, school, park, hospital, store,
  // objects
  ball, book, bag, chair, bed, door, car, bus, bicycle, phone,
  // numbers
  one, two, three, four, five,
  // routines
  'wake up': wakeup, wake: wakeup,
  'brush teeth': brushteeth, brush: brushteeth,
  'get dressed': getdressed,
  'eat breakfast': eatbreakfast,
  'pack bag': packbag,
  // AAC core
  yes, no, more, done, finish, want, like, good, bad,
  go, big, little, small: little, hot, cold,
  me, you, i: i_word, we,
  hungry, thirsty, hurt, pain: hurt,
  bathroom, toilet,
  outside, open,
  hello, goodbye, hi: hello, bye: goodbye,
  please, thanks, 'thank you': thanks, sorry,
  // AAC function words (Proloquo2Go core vocabulary)
  need, have, get, put, take, see, come, make, up, some, out, there, here, different,
  is: is_word, can: can_word, do: do_word,
  not: not_word, this: this_word, that: that_word,
  what: what, where: where, who: who,
  for: for_word, of: of_word, on: on_word, in: in_word,
  all: all_word, 'all done': done,
  it: this_word, to: go, 'go to': go,
  // AAC food aliases
  water: drink, juice: drink, snack: cookie, lunch: eat,
  breakfast: eatbreakfast, dinner: eat, fruit: apple,
  vegetable: carrot, sandwich: bread, pasta: rice,
  cereal: rice, soup: rice,
  // AAC action aliases
  rest: sleep, stand: walk,
  // AAC place aliases
  kitchen: home, bedroom: bed, playground: park,
  // misc
  toy: ball, tablet: phone, shoes: walk, shirt: getdressed,
};

const DEFAULT: I = c => (<>
  <Circle cx="50" cy="50" r="46" fill={c} opacity={0.15} />
  <Circle cx="50" cy="50" r="32" fill={c} opacity={0.6} />
  <Path d="M50,30 L50,50 M50,60 L50,62" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
  <Circle cx="50" cy="66" r="3" fill="#fff" />
</>);

// ── COMPONENT ─────────────────────────────────────────────────────────────────
interface Props { word: string; color?: string; size?: number; }

export const FlashcardIllustration: React.FC<Props> = ({ word, color = '#5B8DEF', size = 160 }) => {
  const key = word.toLowerCase().trim();
  const render = ILLUST[key] ?? DEFAULT;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {render(color)}
    </Svg>
  );
};
