import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

/**
 * Mirrors the web build's `prefers-reduced-motion` guard. When motion is
 * reduced every animated wrapper renders as a plain View, so elements keep the
 * static tilt their style already carries.
 */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

/**
 * @keyframes wobble — rocks between -2deg and 2deg forever. The animated
 * rotation replaces any static rotate in `style`, exactly as the CSS animation
 * overrides the element's own transform.
 */
export function Wobble({
  duration = 2200,
  style,
  children,
}: {
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) return;
    const half = duration / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: half,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: half,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, reduced, t]);

  if (reduced) return <View style={style}>{children}</View>;

  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: ["-2deg", "2deg"],
  });

  return <Animated.View style={[style, { transform: [{ rotate }] }]}>{children}</Animated.View>;
}

/** @keyframes popIn — scale 0.6 → 1.08 → 1 while fading in, once on mount. */
export function PopIn({
  duration = 350,
  style,
  children,
}: {
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) return;
    const anim = Animated.timing(t, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [duration, reduced, t]);

  if (reduced) return <View style={style}>{children}</View>;

  // The 0.7 stop is the CSS keyframe's overshoot.
  const scale = t.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.6, 1.08, 1],
  });
  const opacity = t.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>{children}</Animated.View>
  );
}
