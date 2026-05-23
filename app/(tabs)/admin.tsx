import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  BookOpen,
  ChevronDown,
  DollarSign,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import {
  StatsPeriod,
  UserStats,
  userService,
} from "@/lib/api/services/user.service";
import { User } from "@/types/auth.types";

const { width } = Dimensions.get("window");

const COLORS = {
  background: "#0d0d0d",
  surface: "#1a1a1a",
  surfaceAlt: "#141414",
  surfaceHigh: "#222222",
  primary: "#c9a84c",
  primaryLight: "#e0c272",
  secondary: "#a07c30",
  text: "#f5f0e8",
  textMuted: "#c4bdb0",
  textDisabled: "#6b6560",
  error: "#e05c5c",
  success: "#4caf7d",
  border: "rgba(201,168,76,0.12)",
  borderSubtle: "rgba(255,255,255,0.05)",
};

const PERIODS: { label: string; value: StatsPeriod }[] = [
  { label: "24h", value: "day" },
  { label: "7d", value: "week" },
  { label: "30d", value: "month" },
  { label: "All", value: "all" },
];

function StatCard({
  icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  accent?: string;
}) {
  return (
    <View style={[s.statCard, { borderColor: accent ? `${accent}22` : COLORS.border }]}>
      <View style={[s.statIconWrap, { backgroundColor: accent ? `${accent}15` : "rgba(201,168,76,0.08)" }]}>
        {icon}
      </View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {delta !== undefined && (
        <Text style={[s.statDelta, { color: delta.startsWith("+") ? COLORS.success : COLORS.error }]}>
          {delta}
        </Text>
      )}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionLine} />
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionLine} />
    </View>
  );
}

function UserRow({ user }: { user: User }) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={s.userRow}>
      <View style={s.userAvatar}>
        <Text style={s.userAvatarText}>{initials}</Text>
      </View>
      <View style={s.userInfo}>
        <Text style={s.userName}>{user.name}</Text>
        <Text style={s.userEmail}>{user.email}</Text>
      </View>
      <View style={[s.roleBadge, user.role === "ADMIN" && s.roleBadgeAdmin]}>
        <Text style={[s.roleBadgeText, user.role === "ADMIN" && s.roleBadgeTextAdmin]}>
          {user.role}
        </Text>
      </View>
    </View>
  );
}

export default function AdminScreen() {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!accessToken) return;
    setLoadingStats(true);
    try {
      const data = await userService.getStats(accessToken, period);
      setStats(data);
      setError(null);
    } catch {
      setError("Failed to load stats");
    } finally {
      setLoadingStats(false);
    }
  }, [accessToken, period]);

  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoadingUsers(true);
    try {
      const data = await userService.listUsers(accessToken);
      setUsers(data);
    } catch {
      // non-fatal
    } finally {
      setLoadingUsers(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatCost = (v: number | null | undefined) =>
    v == null ? "—" : `$${v.toFixed(3)}`;
  const formatDelta = (v: number | null | undefined) =>
    v == null ? undefined : v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`;

  const displayedUsers = showAllUsers ? users : users.slice(0, 5);

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={[COLORS.background, "#050505"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.shieldWrap}>
              <ShieldAlert color={COLORS.primary} size={22} strokeWidth={1.8} />
            </View>
            <View>
              <Text style={s.headerTitle}>Command Center</Text>
              <Text style={s.headerSub}>Welcome, {user?.name?.split(" ")[0]}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => { fetchStats(); fetchUsers(); }} style={s.refreshBtn}>
            <RefreshCw color={COLORS.textDisabled} size={16} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* Period selector */}
        <View style={s.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setPeriod(p.value)}
              style={[s.periodBtn, period === p.value && s.periodBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[s.periodText, period === p.value && s.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <View style={s.errorBanner}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* System overview */}
        <SectionHeader title="System Overview" />

        <View style={s.statsGrid}>
          <StatCard
            icon={<Users color={COLORS.primary} size={18} strokeWidth={1.8} />}
            label="Total Users"
            value={loadingUsers ? "—" : String(users.length)}
            accent={COLORS.primary}
          />
          <StatCard
            icon={<BookOpen color="#7eb8f7" size={18} strokeWidth={1.8} />}
            label="Total Messages"
            value={loadingStats || !stats ? "—" : String(stats.totalMessages)}
            delta={stats ? formatDelta(stats.messagesDelta) : undefined}
            accent="#7eb8f7"
          />
          <StatCard
            icon={<DollarSign color={COLORS.success} size={18} strokeWidth={1.8} />}
            label="AI Cost"
            value={loadingStats || !stats ? "—" : (stats.totalCost != null ? formatCost(stats.totalCost) : "—")}
            delta={stats ? formatDelta(stats.costDelta) : undefined}
            accent={COLORS.success}
          />
          <StatCard
            icon={<MessageSquare color="#c97dde" size={18} strokeWidth={1.8} />}
            label="Conversations"
            value={loadingStats || !stats ? "—" : String(stats.totalConversations)}
            accent="#c97dde"
          />
        </View>

        {/* Cost analytics */}
        <SectionHeader title="Cost Analytics" />

        {loadingStats ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : stats?.dailyBreakdown && stats.dailyBreakdown.length > 0 ? (
          <View style={s.card}>
            <View style={s.chartHeader}>
              <View style={s.chartLegendRow}>
                <View style={[s.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={s.legendLabel}>Cost (USD)</Text>
                <View style={[s.legendDot, { backgroundColor: "#7eb8f7", marginLeft: 12 }]} />
                <Text style={s.legendLabel}>Messages</Text>
              </View>
              {stats.costDelta != null && (
                <View style={[s.trendBadge, { backgroundColor: stats.costDelta >= 0 ? "rgba(224,92,92,0.12)" : "rgba(76,175,125,0.12)" }]}>
                  <TrendingUp color={stats.costDelta >= 0 ? COLORS.error : COLORS.success} size={12} strokeWidth={2} />
                  <Text style={[s.trendText, { color: stats.costDelta >= 0 ? COLORS.error : COLORS.success }]}>
                    {formatDelta(stats.costDelta)}
                  </Text>
                </View>
              )}
            </View>

            {stats.dailyBreakdown.slice(-7).map((day, i) => {
              const maxCost = Math.max(...stats.dailyBreakdown.map((d) => d.cost), 0.001);
              const barWidth = (day.cost / maxCost) * (width - 120);
              const date = new Date(day.date);
              const label = date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });

              return (
                <View key={i} style={s.barRow}>
                  <Text style={s.barLabel}>{label}</Text>
                  <View style={s.barTrack}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[s.barFill, { width: Math.max(barWidth, 4) }]}
                    />
                  </View>
                  <Text style={s.barValue}>{formatCost(day.cost)}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={s.emptyCard}>
            <Activity color={COLORS.textDisabled} size={28} strokeWidth={1.5} />
            <Text style={s.emptyText}>No activity in this period</Text>
          </View>
        )}

        {/* Top conversations */}
        {stats?.topConversations && stats.topConversations.length > 0 && (
          <>
            <SectionHeader title="Top Conversations by Cost" />
            <View style={s.card}>
              {stats.topConversations.slice(0, 5).map((conv, i) => (
                <View key={conv.id} style={[s.convRow, i < Math.min(4, stats.topConversations.length - 1) && s.convRowBorder]}>
                  <View style={s.convRank}>
                    <Text style={s.convRankText}>{i + 1}</Text>
                  </View>
                  <View style={s.convInfo}>
                    <Text style={s.convTitle} numberOfLines={1}>{conv.title || "Untitled conversation"}</Text>
                    <Text style={s.convMeta}>{conv.messages} messages</Text>
                  </View>
                  <Text style={s.convCost}>{formatCost(conv.cost)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* User list */}
        <SectionHeader title="All Users" />

        {loadingUsers ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : users.length === 0 ? (
          <View style={s.emptyCard}>
            <Users color={COLORS.textDisabled} size={28} strokeWidth={1.5} />
            <Text style={s.emptyText}>No users found</Text>
          </View>
        ) : (
          <View style={s.card}>
            {displayedUsers.map((u, i) => (
              <View key={u.id} style={i < displayedUsers.length - 1 ? s.userRowBorder : undefined}>
                <UserRow user={u} />
              </View>
            ))}
            {users.length > 5 && (
              <TouchableOpacity
                onPress={() => setShowAllUsers((v) => !v)}
                style={s.showMoreBtn}
                activeOpacity={0.7}
              >
                <Text style={s.showMoreText}>
                  {showAllUsers ? "Show less" : `Show ${users.length - 5} more`}
                </Text>
                <ChevronDown
                  color={COLORS.primary}
                  size={14}
                  strokeWidth={2}
                  style={{ transform: [{ rotate: showAllUsers ? "180deg" : "0deg" }] }}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  shieldWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(201,168,76,0.1)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: "800", letterSpacing: 0.3 },
  headerSub: { color: COLORS.textDisabled, fontSize: 12, fontWeight: "500", marginTop: 1 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },

  periodRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  periodBtnActive: { backgroundColor: COLORS.surface },
  periodText: { color: COLORS.textDisabled, fontSize: 13, fontWeight: "600" },
  periodTextActive: { color: COLORS.primary },

  errorBanner: {
    backgroundColor: "rgba(224,92,92,0.08)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.2)",
    marginBottom: 16,
  },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: "500", textAlign: "center" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  sectionTitle: {
    color: COLORS.textDisabled,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: "800", letterSpacing: 0.3 },
  statLabel: { color: COLORS.textDisabled, fontSize: 12, fontWeight: "500" },
  statDelta: { fontSize: 11, fontWeight: "600" },

  loadingWrap: {
    paddingVertical: 32,
    alignItems: "center",
    marginBottom: 24,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartLegendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: COLORS.textDisabled, fontSize: 11, fontWeight: "500" },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: { fontSize: 11, fontWeight: "700" },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  barLabel: { color: COLORS.textDisabled, fontSize: 10, fontWeight: "500", width: 72 },
  barTrack: { flex: 1, height: 6, backgroundColor: COLORS.surfaceAlt, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  barValue: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600", width: 46, textAlign: "right" },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  emptyText: { color: COLORS.textDisabled, fontSize: 13, fontWeight: "500" },

  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  convRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  convRank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(201,168,76,0.08)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  convRankText: { color: COLORS.primary, fontSize: 12, fontWeight: "700" },
  convInfo: { flex: 1 },
  convTitle: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  convMeta: { color: COLORS.textDisabled, fontSize: 11, fontWeight: "500", marginTop: 2 },
  convCost: { color: COLORS.primary, fontSize: 13, fontWeight: "700" },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  userRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(201,168,76,0.1)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: { color: COLORS.primary, fontSize: 13, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  userEmail: { color: COLORS.textDisabled, fontSize: 11, fontWeight: "400", marginTop: 1 },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  roleBadgeAdmin: {
    backgroundColor: "rgba(201,168,76,0.1)",
    borderColor: "rgba(201,168,76,0.25)",
  },
  roleBadgeText: { color: COLORS.textDisabled, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  roleBadgeTextAdmin: { color: COLORS.primary },

  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  showMoreText: { color: COLORS.primary, fontSize: 13, fontWeight: "600" },
});
