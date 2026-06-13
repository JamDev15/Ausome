import React from 'react';
import Svg, { Path, Ellipse, G } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/** Small single-color octopus icon for headers and compact usage. */
export const OctopusLogo: React.FC<Props> = ({ size = 28, color = '#5B8DEF' }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    {/* Tentacles */}
    <Path d="M14 38 Q4 48 2 58" stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />
    <Path d="M22 44 Q16 54 16 60" stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />
    <Path d="M30 46 Q30 56 30 60" stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />
    <Path d="M38 44 Q44 54 44 60" stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />
    <Path d="M46 38 Q56 48 58 58" stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />

    {/* Body */}
    <Ellipse cx="30" cy="24" rx="20" ry="22" fill={color} />

    {/* Happy face */}
    <G>
      {/* Eyes */}
      <Path d="M22 22 Q24 19 26 22" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M34 22 Q36 19 38 22" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* Smile */}
      <Path d="M24 30 Q30 36 36 30" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
    </G>
  </Svg>
);
