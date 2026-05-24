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
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { LANGUAGES, useLanguage, useT } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useState } from "react";

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
  const { replyLanguage, setReplyLanguage, uiLanguage, setUiLanguage } =
    useLanguage();
  const { voiceModeEnabled, setVoiceModeEnabled } = useVoice();
  const t = useT();

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

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.pageTitle}>{t.profile}</Text>
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
              <Text style={s.badgeText}>{t.reader_badge}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Info section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.account}</Text>
          <View style={s.card}>
            <InfoRow
              icon={
                <User color={COLORS.textDisabled} size={16} strokeWidth={1.8} />
              }
              label={t.full_name_label}
              value={user?.name ?? "—"}
            />
            <View style={s.divider} />
            <InfoRow
              icon={
                <Mail color={COLORS.textDisabled} size={16} strokeWidth={1.8} />
              }
              label={t.email_label}
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
              label={t.member_since}
              value={memberSince}
            />
          </View>
        </View>

        {/* Reply Language */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.zaydoun_replies_in}</Text>
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
                <Text style={s.infoLabel}>{t.reply_language}</Text>
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

        {/* App Language */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.ui_language}</Text>
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
                <Text style={s.infoLabel}>{t.app_language}</Text>
                <Text style={s.infoValue}>
                  {uiLanguage.flag} {uiLanguage.label}
                </Text>
              </View>
            </View>
            <View style={s.divider} />
            <View style={s.langGrid}>
              {LANGUAGES.map((lang) => {
                const active = lang.code === uiLanguage.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[s.langChip, active && s.langChipActive]}
                    onPress={() => setUiLanguage(lang)}
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
          <Text style={s.sectionTitle}>{t.voice_assistant}</Text>
          <View style={s.card}>
            <View style={s.infoRow}>
              <View style={s.infoIcon}>
                <Mic color={COLORS.textDisabled} size={16} strokeWidth={1.8} />
              </View>
              <View style={[s.infoText, { flex: 1 }]}>
                <Text style={s.infoLabel}>{t.zaydoun_mode}</Text>
                <Text style={s.infoValue}>
                  {voiceModeEnabled ? t.voice_active : t.voice_disabled}
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
            <Text style={s.logoutText}>{t.sign_out}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom sign-out confirmation modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          style={s.modalBackdrop}
          onPress={() => setShowLogoutModal(false)}
        >
          <Pressable style={s.modalCard} onPress={() => {}}>
            {/* Icon */}
            <View style={s.modalIconWrap}>
              <LogOut color={COLORS.error} size={22} strokeWidth={1.8} />
            </View>

            <Text style={s.modalTitle}>{t.sign_out}</Text>
            <Text style={s.modalBody}>{t.sign_out_confirm}</Text>

            {/* Buttons */}
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.75}
              >
                <Text style={s.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.modalConfirmBtn}
                onPress={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                activeOpacity={0.75}
              >
                <LinearGradient
                  colors={["#e05c5c", "#b03e3e"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.modalConfirmGradient}
                >
                  <LogOut color="#fff" size={15} strokeWidth={2} />
                  <Text style={s.modalConfirmText}>{t.sign_out}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

  // ── Sign-out modal ──────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.18)",
    padding: 28,
    alignItems: "center",
  },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(224,92,92,0.1)",
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  modalBody: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  modalConfirmGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
  },
  modalConfirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
