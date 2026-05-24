import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { BookOpen } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useT } from "@/contexts/LanguageContext";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const COLORS = {
  background: "#0d0d0d", // Deepest dark
  surface: "#1a1a1a",
  primary: "#c9a84c", // Main Gold
  primaryLight: "#e0c272",
  secondary: "#a07c30", // Dark Gold
  text: "#f5f0e8",
  textMuted: "#c4bdb0",
  textDisabled: "#6b6560",
};

const ORB_SIZE = 200;
const PARTICLE_COUNT = 28;

function Particle({ index, total }: { index: number; total: number }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const baseRadius = 115 + (index % 3) * 18;
  const size = 1.5 + (index % 3) * 0.8;
  const initialAngle = (index / total) * 360;
  const duration = 14000 + (index % 5) * 2400;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [duration, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${initialAngle}deg`, `${initialAngle + 360}deg`],
  });

  const isBright = index % 3 === 0;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          alignItems: "center",
          justifyContent: "center",
          transform: [{ rotate: spin }],
        },
      ]}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isBright ? COLORS.primaryLight : COLORS.secondary,
          transform: [{ translateY: -baseRadius }],
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: size * 2,
        }}
      />
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const t = useT();

  const handleConnect = () => {
    if (isLoading) return;
    router.push(
      isAuthenticated ? ("/(tabs)/library" as "/") : ("/(auth)/login" as "/"),
    );
  };
  const coreSpin = useRef(new Animated.Value(0)).current;
  const layer1Spin = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(coreSpin, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.timing(layer1Spin, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [coreSpin, layer1Spin, pulseAnim, fadeIn]);

  const coreRotate = coreSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const layer1Rotate = layer1Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={[COLORS.background, "#050505"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[s.container, { opacity: fadeIn }]}>
        {/* Header pill */}
        <View style={s.header}>
          <View style={s.pill}>
            <LinearGradient
              colors={["rgba(201,168,76,0.3)", "rgba(201,168,76,0.1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.pillBorder}
            >
              <View style={s.pillInner}>
                <Text style={s.pillText}>Zaydoun</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Center orb */}
        <View style={s.main}>
          <Text style={s.statusText}>{t.pocket_companion}</Text>

          <View style={s.orbWrap}>
            {/* Glow halo */}
            <Animated.View
              style={[s.orbGlow, { transform: [{ scale: pulseAnim }] }]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={[
                  "rgba(201,168,76,0.15)",
                  "rgba(224,194,114,0.05)",
                  "transparent",
                ]}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Particles */}
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
              <Particle key={i} index={i} total={PARTICLE_COUNT} />
            ))}

            {/* Orb core */}
            <Animated.View
              style={[s.orbMask, { transform: [{ scale: pulseAnim }] }]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { transform: [{ rotate: coreRotate }] },
                ]}
              >
                <LinearGradient
                  colors={[
                    COLORS.secondary,
                    COLORS.primary,
                    "#1a140a",
                    COLORS.primaryLight,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.orbOversize}
                />
              </Animated.View>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { transform: [{ rotate: layer1Rotate }] },
                ]}
              >
                <LinearGradient
                  colors={[
                    "rgba(255,255,255,0.15)",
                    "transparent",
                    "rgba(201,168,76,0.4)",
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={s.orbOversize}
                />
              </Animated.View>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.15)",
                  "transparent",
                  "rgba(13,13,13,0.95)",
                ]}
                start={{ x: 0.2, y: 0.1 }}
                end={{ x: 0.8, y: 0.9 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Book icon in center */}
              <View style={s.orbIcon}>
                <BookOpen
                  color="rgba(245,240,232,0.9)"
                  size={42}
                  strokeWidth={1.2}
                />
              </View>
            </Animated.View>
          </View>

          <Text style={s.tagline}>
            {t.speak_to_your_library}
            {"\n"}
            <Text style={s.taglineAccent}>{t.library_accent}</Text>
          </Text>
        </View>

        {/* Bottom CTA */}
        <View style={s.bottom}>
          <Pressable
            onPress={handleConnect}
            style={({ pressed }) => [
              { transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>{t.connect_to_dashboard}</Text>
            </LinearGradient>
          </Pressable>

          <Text style={s.signinText}>{t.sign_in_with_zaydoun_account}</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 20 : 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 32,
  },
  header: { alignItems: "center", paddingTop: 12 },
  pill: { borderRadius: 100 },
  pillBorder: { padding: 1, borderRadius: 100 },
  pillInner: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 100,
  },
  pillText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    color: COLORS.textDisabled,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 3,
    marginBottom: 52,
  },
  orbWrap: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 52,
  },
  orbGlow: {
    position: "absolute",
    width: ORB_SIZE * 2.6,
    height: ORB_SIZE * 2.6,
    borderRadius: ORB_SIZE * 1.5,
  },
  orbMask: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: "hidden",
    elevation: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  orbOversize: {
    width: ORB_SIZE * 2,
    height: ORB_SIZE * 2,
    position: "absolute",
    top: -ORB_SIZE / 2,
    left: -ORB_SIZE / 2,
  },
  orbIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  tagline: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 42,
  },
  taglineAccent: { color: COLORS.primary, fontWeight: "900" },
  bottom: { alignItems: "center", paddingHorizontal: 24, gap: 16 },
  ctaBtn: {
    width: width - 48,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: "#050505",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  signinText: {
    color: COLORS.textDisabled,
    fontSize: 13,
    fontWeight: "500",
  },
});
