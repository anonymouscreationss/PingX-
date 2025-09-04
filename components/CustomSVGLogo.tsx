import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CustomSVGLogoProps {
  size?: number;
}

export default function CustomSVGLogo({ size = 60 }: CustomSVGLogoProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 60 60">
        <Defs>
          <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#007AFF" />
            <Stop offset="100%" stopColor="#5AC8FA" />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx="30"
          cy="30"
          r="28"
          fill="url(#logoGradient)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        
        {/* Signal waves */}
        <Path
          d="M20 30 Q25 25 30 30 Q35 35 40 30"
          stroke="#FFFFFF"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        
        <Path
          d="M15 30 Q22.5 20 30 30 Q37.5 40 45 30"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        
        <Path
          d="M12 30 Q21 15 30 30 Q39 45 48 30"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        
        {/* Center dot */}
        <Circle
          cx="30"
          cy="30"
          r="3"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
}