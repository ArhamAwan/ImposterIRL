import React from "react";
import Svg, { G, Path, Ellipse } from "react-native-svg";

/**
 * Red Crewmate - Imposter variant with cracked visor
 */
export function RedCrewmate({ size = 100, style }) {
  const scale = size / 100;
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
    >
      <G fill="none" stroke="black" strokeWidth={3 / scale}>
        {/* Body */}
        <Path
          d="M30 85 Q25 85 25 75 L25 25 Q25 15 35 15 L65 15 Q75 15 75 25 L75 75 Q75 85 70 85 Q65 85 65 75 L65 65 L35 65 L35 75 Q35 85 30 85 Z"
          fill="#D71E2D"
        />
        {/* Backpack */}
        <Path
          d="M25 30 L15 30 Q10 30 10 40 L10 60 Q10 70 15 70 L25 70"
          fill="#A91B26"
        />
        {/* Visor */}
        <Ellipse cx={55} cy={35} rx={15} ry={10} fill="#7FFFD4" />
        {/* Cracked visor effect */}
        <Path
          d="M45 30 L50 35 L45 40 L55 38 L60 32 L65 35"
          stroke="white"
          strokeWidth={2 / scale}
          fill="none"
        />
      </G>
    </Svg>
  );
}

/**
 * Blue Crewmate - Regular crewmate
 */
export function BlueCrewmate({ size = 100, style }) {
  const scale = size / 100;
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
    >
      <G fill="none" stroke="black" strokeWidth={3 / scale}>
        {/* Body */}
        <Path
          d="M30 85 Q25 85 25 75 L25 25 Q25 15 35 15 L65 15 Q75 15 75 25 L75 75 Q75 85 70 85 Q65 85 65 75 L65 65 L35 65 L35 75 Q35 85 30 85 Z"
          fill="#1E90FF"
        />
        {/* Backpack */}
        <Path
          d="M25 30 L15 30 Q10 30 10 40 L10 60 Q10 70 15 70 L25 70"
          fill="#104E8B"
        />
        {/* Visor */}
        <Ellipse cx={55} cy={35} rx={15} ry={10} fill="#7FFFD4" />
      </G>
    </Svg>
  );
}

/**
 * Orange Crewmate - Dead crewmate with bone
 */
export function OrangeCrewmate({ size = 100, style }) {
  const scale = size / 100;
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
    >
      <G fill="none" stroke="black" strokeWidth={3 / scale}>
        {/* Bone/neck sticking up */}
        <Path
          d="M45 55 L45 35 Q45 30 50 30 Q55 30 55 35 L55 55"
          fill="white"
          strokeWidth={3 / scale}
        />
        {/* Lower body (dead) */}
        <Path
          d="M30 85 Q25 85 25 75 L25 55 L75 55 L75 75 Q75 85 70 85 Q65 85 65 75 L65 65 L35 65 L35 75 Q35 85 30 85 Z"
          fill="#FF8C00"
        />
        {/* Backpack */}
        <Path
          d="M25 55 L15 55 L10 60 Q10 70 15 70 L25 70"
          fill="#8B4500"
        />
      </G>
    </Svg>
  );
}

/**
 * Ghost Crewmate - Transparent cyan ghost
 */
export function GhostCrewmate({ size = 100, style, opacity = 0.6 }) {
  const scale = size / 100;
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
    >
      <G fill="none" stroke="black" strokeWidth={3 / scale} opacity={opacity}>
        {/* Ghost body with wavy bottom */}
        <Path
          d="M30 80 Q 35 75, 40 80 Q 45 85, 50 80 Q 55 75, 60 80 Q 65 85, 70 80 L70 25 Q70 15 60 15 L40 15 Q30 15 30 25 L30 80 Z"
          fill="#00FFFF"
        />
        {/* Backpack */}
        <Path
          d="M30 30 L20 30 Q15 30 15 40 L15 60 Q15 70 20 70 L30 70"
          fill="#008B8B"
        />
        {/* Visor */}
        <Ellipse cx={50} cy={35} rx={15} ry={10} fill="#E0FFFF" />
      </G>
    </Svg>
  );
}

/**
 * Get a random crewmate component (excluding ghost)
 */
export function getRandomCrewmate() {
  const crewmates = [RedCrewmate, BlueCrewmate, OrangeCrewmate];
  return crewmates[Math.floor(Math.random() * crewmates.length)];
}

/**
 * Get a random crewmate component (including ghost)
 */
export function getRandomCrewmateWithGhost() {
  const crewmates = [RedCrewmate, BlueCrewmate, OrangeCrewmate, GhostCrewmate];
  return crewmates[Math.floor(Math.random() * crewmates.length)];
}

