import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Calendar,
  Languages,
  LogOut,
  Mail,
  Mic,
  User,
} from "lucide-react-native";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { LANGUAGES, useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";

const COLORS = {
  background: "#0d0d0d",
  surface: "#1a1a1a",
  surfaceAlt: "#141414",
  primary: "#c9a84c",
  primaryLight: "#e0c272",
  secondary: "#a07c30",
  text: "#f5f0e8",
  textMuted: "#c4bdb0",
  textDisabled: "#6b6560",
  error: "#e05c5c",
  border: "rgba(201,168,76,0.12)",
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIcon}>{icon}</View>
      <View style={s.infoText}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { replyLanguage, setReplyLanguage } = useLanguage();
  const { voiceModeEnabled, setVoiceModeEnabled } = useVoice();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.pageTitle}>Profile</Text>
        </View>

        {/* Avatar card */}
        <View style={s.avatarCard}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.avatar}
          >
            <Text style={s.avatarText}>{initials}</Text>
          </LinearGradient>

          <Text style={s.name}>{user?.name ?? "—"}</Text>
          <View style={s.badge}>
            <LinearGradient
              colors={["rgba(201,168,76,0.2)", "rgba(201,168,76,0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.badgeGradient}
            >
              <BookOpen color={COLORS.primary} size={11} strokeWidth={2} />
              <Text style={s.badgeText}>Reader</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Info section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Account</Text>
          <View style={s.card}>
            <InfoRow
              icon={
                <User color={COLORS.textDisabled} size={16} strokeWidth={1.8} />
              }
              label="Full Name"
              value={user?.name ?? "—"}
            />
            <View style={s.divider} />
            <InfoRow
              icon={
                <Mail color={COLORS.textDisabled} size={16} strokeWidth={1.8} />
              }
              label="Email"
              value={user?.email ?? "—"}
            />
            <View style={s.divider} />
            <InfoRow
              icon={
                <Calendar
                  color={COLORS.textDisabled}
                  size={16}
                  strokeWidth={1.8}
                />
              }
              label="Member Since"
              value={memberSince}
            />
          </View>
        </View>

        {/* Reply Language */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Zaydoun Replies In</Text>
          <View style={s.card}>
            <View style={s.langHeader}>
              <View style={s.infoIcon}>
                <Languages
                  color={COLORS.textDisabled}
                  size={16}
                  strokeWidth={1.8}
                />
              </View>
              <View style={s.infoText}>
                <Text style={s.infoLabel}>Reply Language</Text>
                <Text style={s.infoValue}>
                  {replyLanguage.flag} {replyLanguage.label}
                </Text>
              </View>
            </View>
            <View style={s.divider} />
            <View style={s.langGrid}>
              {LANGUAGES.map((lang) => {
                const active = lang.code === replyLanguage.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[s.langChip, active && s.langChipActive]}
                    onPress={() => setReplyLanguage(lang)}
                    activeOpacity={0.75}
                  >
                    <Text style={s.langFlag}>{lang.flag}</Text>
                    <Text style={[s.langLabel, active && s.langLabelActive]}>
                      {lang.label}
                    </Text>
                    <Text style={[s.langNative, active && s.langNativeActive]}>
                      {lang.nativeLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Voice Assistant */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Voice Assistant</Text>
          <View style={s.card}>
            <View style={s.infoRow}>
              <View style={s.infoIcon}>
                <Mic color={COLORS.textDisabled} size={16} strokeWidth={1.8} />
              </View>
              <View style={[s.infoText, { flex: 1 }]}>
                <Text style={s.infoLabel}>Zaydoun Mode</Text>
                <Text style={s.infoValue}>
                  {voiceModeEnabled ? "Active — say «Zaydoun»" : "Disabled"}
                </Text>
              </View>
              <Switch
                value={voiceModeEnabled}
                onValueChange={setVoiceModeEnabled}
                trackColor={{ false: "#2a2a2a", true: "rgba(201,168,76,0.4)" }}
                thumbColor={voiceModeEnabled ? COLORS.primary : "#4a4540"}
              />
            </View>
          </View>
        </View>

        {/* Sign out */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <LogOut color={COLORS.error} size={18} strokeWidth={1.8} />
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  avatarCard: {
    alignItems: "center",
    paddingVertical: 28,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    color: "#0d0d0d",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  badge: { borderRadius: 20 },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    color: COLORS.textDisabled,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { flex: 1 },
  infoLabel: {
    color: COLORS.textDisabled,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 60,
  },
  langHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 14,
  },
  langChip: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    gap: 3,
    minWidth: 68,
  },
  langChipActive: {
    borderColor: "rgba(201,168,76,0.45)",
    backgroundColor: "rgba(201,168,76,0.08)",
  },
  langFlag: { fontSize: 20 },
  langLabel: {
    color: COLORS.textDisabled,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  langLabelActive: { color: COLORS.primary },
  langNative: {
    color: COLORS.textDisabled,
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.7,
  },
  langNativeActive: { color: COLORS.primary, opacity: 0.8 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(224,92,92,0.07)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.15)",
    paddingVertical: 16,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
