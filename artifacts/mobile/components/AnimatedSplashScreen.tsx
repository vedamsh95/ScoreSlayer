import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  runOnJS,
  useAnimatedProps
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { BRAND_PATHS, UP_ARROW_PATH, DOWN_ARROW_PATH, LOGO_VIEWBOX } from '@/constants/logo_config';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationComplete }) => {
  const slideProgress = useSharedValue(0);
  const logoOpacity = useSharedValue(1);

  useEffect(() => {
    const slideDuration = 800;
    const startDelay = 1200;
    const easing = Easing.bezier(0.4, 0, 0.2, 1);

    // Fade logo out slightly before/during slide
    logoOpacity.value = withDelay(startDelay, withTiming(0, { duration: 300 }));

    // Slide doors apart
    slideProgress.value = withDelay(startDelay, withTiming(1, { 
      duration: slideDuration, 
      easing 
    }, (finished) => {
      if (finished) {
        runOnJS(onAnimationComplete)();
      }
    }));
  }, []);

  const leftDoorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -slideProgress.value * (width / 2) }]
  }));

  const rightDoorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideProgress.value * (width / 2) }]
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: 1 - slideProgress.value * 0.1 }]
  }));

  return (
    <View style={styles.container}>
      {/* Left Door */}
      <Animated.View style={[styles.door, styles.leftDoor, leftDoorStyle]} />
      
      {/* Right Door */}
      <Animated.View style={[styles.door, styles.rightDoor, rightDoorStyle]} />

      {/* Centered Logo (stays centered until fade) */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Svg width={320} height={120} viewBox={LOGO_VIEWBOX}>
          {BRAND_PATHS.map((path, i) => (
            <Path key={`logo-${i}`} d={path.d} fill={path.color} />
          ))}
          <Path d={UP_ARROW_PATH} fill="#F0BE70" />
          <Path d={DOWN_ARROW_PATH} fill="#F2887A" />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    overflow: 'hidden',
  },
  door: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width / 2 + 1, // Add 1px overlap to prevent visible seam
    backgroundColor: '#0F172A',
  },
  leftDoor: {
    left: 0,
  },
  rightDoor: {
    right: 0,
  },
  logoContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
});
