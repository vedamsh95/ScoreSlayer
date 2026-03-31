import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  runOnJS,
  interpolateColor,
  useAnimatedProps
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { BRAND_PATHS, UP_ARROW_PATH, DOWN_ARROW_PATH, LOGO_VIEWBOX } from '@/constants/logo_config';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width, height } = Dimensions.get('window');

// SVG Path data now imported from constants/logo_config.ts

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationComplete }) => {
  const zoomProgress = useSharedValue(0);
  const bgColorProgress = useSharedValue(0);
  const arrowDivergence = useSharedValue(0);

  useEffect(() => {
    const duration = 1200;
    const easing = Easing.bezier(0.25, 0.1, 0.25, 1);
    const startDelay = 500;

    bgColorProgress.value = withDelay(startDelay, withTiming(1, { duration }));
    
    // Diverging arrows move faster
    arrowDivergence.value = withDelay(startDelay + 200, withTiming(1, { 
      duration: duration * 0.8,
      easing: Easing.out(Easing.quad)
    }));

    zoomProgress.value = withDelay(startDelay, withTiming(1, { 
      duration, 
      easing 
    }, (finished) => {
      if (finished) {
        runOnJS(onAnimationComplete)();
      }
    }));
  }, []);

  const logoContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + zoomProgress.value * 20 }
    ],
    opacity: 1 - zoomProgress.value * 0.8
  }));

  const upArrowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -arrowDivergence.value * 150 }
    ],
    opacity: 1 - arrowDivergence.value
  }));

  const downArrowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: arrowDivergence.value * 150 }
    ],
    opacity: 1 - arrowDivergence.value
  }));

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgColorProgress.value,
      [0, 1],
      ['#000000', '#0F172A']
    )
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
        <Svg width={320} height={120} viewBox={LOGO_VIEWBOX}>
          {/* Base Logo Paths */}
          {BRAND_PATHS.map((path, i) => (
            <Path key={`logo-${i}`} d={path.d} fill={path.color} />
          ))}
          
          {/* Diverging Arrows */}
          <AnimatedPath 
            d={UP_ARROW_PATH} 
            fill="#F0BE70" 
            animatedProps={useAnimatedProps(() => ({
              transform: [{ translateY: -arrowDivergence.value * 80 }],
              opacity: 1 - arrowDivergence.value
            }))}
          />
          <AnimatedPath 
            d={DOWN_ARROW_PATH} 
            fill="#F2887A"
            animatedProps={useAnimatedProps(() => ({
              transform: [{ translateY: arrowDivergence.value * 80 }],
              opacity: 1 - arrowDivergence.value
            }))}
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    position: 'absolute',
  },
  arrowContainer: {
    position: 'absolute',
  },
});
