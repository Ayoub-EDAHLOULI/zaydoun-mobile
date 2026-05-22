import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  background: "#0d0d0d",
  surface: "#1a1a1a",
  surfaceAlt: "#141414",
  text: "#f5f0e8",
  textMuted: "#c4bdb0",
  textDisabled: "#6b6560",
  error: "#e05c5c",
  border: "rgba(255,255,255,0.06)",
};

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 18,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const isDanger = variant === "danger";
  const accentColor = isDanger ? COLORS.error : "#e0a84c";
  const gradientColors: [string, string] = isDanger
    ? ["#e05c5c", "#b03e3e"]
    : ["#e0a84c", "#b07c30"];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View style={[s.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          activeOpacity={1}
        />

        <Animated.View style={[s.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Icon */}
          <View style={[s.iconWrap, { backgroundColor: `${accentColor}14` }]}>
            <View style={[s.iconRing, { borderColor: `${accentColor}25` }]}>
              <AlertTriangle color={accentColor} size={26} strokeWidth={1.8} />
            </View>
          </View>

          {/* Text */}
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>

          {/* Actions */}
          <View style={s.actions}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.75}
            >
              <Text style={s.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.confirmBtnWrap}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.confirmBtn}
              >
                <Text style={s.confirmText}>{confirmLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  message: {
    color: COLORS.textDisabled,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmBtnWrap: { flex: 1 },
  confirmBtn: {
    height: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e05c5c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
