import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ConfirmModal from "@/components/ConfirmModal";
import { booksService } from "@/lib/api/services/books.service";
import { BookSummary, BookStatus } from "@/types/books.types";
import { uploadBookSchema } from "@/validations/books.validations";

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
  success: "#4caf7d",
  warning: "#e0a84c",
  border: "rgba(201,168,76,0.12)",
};

const STATUS_CONFIG: Record<
  BookStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  READY: {
    color: COLORS.success,
    icon: <CheckCircle size={13} color={COLORS.success} strokeWidth={2} />,
    label: "Ready",
  },
  PROCESSING: {
    color: COLORS.warning,
    icon: <RefreshCw size={13} color={COLORS.warning} strokeWidth={2} />,
    label: "Processing",
  },
  PENDING: {
    color: COLORS.textDisabled,
    icon: <Clock size={13} color={COLORS.textDisabled} strokeWidth={2} />,
    label: "Pending",
  },
  FAILED: {
    color: COLORS.error,
    icon: <AlertCircle size={13} color={COLORS.error} strokeWidth={2} />,
    label: "Failed",
  },
};

const LANGUAGES: { code: string; label: string; flag: string }[] = [
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
];

function BookCard({
  book,
  onDelete,
  onProcess,
}: {
  book: BookSummary;
  onDelete: (id: string, title: string) => void;
  onProcess: (id: string) => void;
}) {
  const status = STATUS_CONFIG[book.status];
  const isReady = book.status === "READY";
  const isFailed = book.status === "FAILED";

  return (
    <View style={bc.card}>
      <View style={bc.iconWrap}>
        <BookOpen
          color={isReady ? COLORS.primary : COLORS.textDisabled}
          size={22}
          strokeWidth={1.5}
        />
      </View>

      <View style={bc.info}>
        <Text style={bc.title} numberOfLines={1}>
          {book.title}
        </Text>
        {book.author && (
          <Text style={bc.author} numberOfLines={1}>
            {book.author}
          </Text>
        )}
        <View style={bc.meta}>
          <View
            style={[bc.statusBadge, { backgroundColor: `${status.color}14` }]}
          >
            {status.icon}
            <Text style={[bc.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text style={bc.pages}>
            {book.totalPages}p · {book.language.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={bc.actions}>
        {isFailed && (
          <TouchableOpacity
            style={bc.actionBtn}
            onPress={() => onProcess(book.id)}
            hitSlop={8}
          >
            <RefreshCw size={15} color={COLORS.warning} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={bc.actionBtn}
          onPress={() => onDelete(book.id, book.title)}
          hitSlop={8}
        >
          <Trash2 size={15} color={COLORS.textDisabled} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const bc = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  info: { flex: 1, gap: 4 },
  title: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  author: { color: COLORS.textDisabled, fontSize: 12, fontWeight: "500" },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  pages: { color: COLORS.textDisabled, fontSize: 11, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 4 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function LibraryScreen() {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Upload form state
  const [pickedFile, setPickedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [language, setLanguage] = useState("ar");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const slideAnim = useRef(new Animated.Value(400)).current;

  const loadBooks = useCallback(async () => {
    try {
      const data = await booksService.list();
      setBooks(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 20,
      tension: 180,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setPickedFile(null);
      setTitle("");
      setAuthor("");
      setLanguage("ar");
      setFormErrors({});
    });
  };

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_FILE_SIZE) {
      setFormErrors((p) => ({ ...p, file: "File exceeds the 50 MB limit" }));
      return;
    }
    setFormErrors((p) => ({ ...p, file: "" }));
    setPickedFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/pdf",
    });
    if (!title) setTitle(asset.name.replace(/\.pdf$/i, ""));
  };

  const handleUpload = async () => {
    if (!pickedFile) {
      setFormErrors((p) => ({ ...p, file: "Please select a PDF file" }));
      return;
    }
    const parsed = uploadBookSchema.safeParse({
      title,
      author: author || undefined,
      language,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((e) => {
        if (e.path[0]) errs[String(e.path[0])] = e.message;
      });
      setFormErrors(errs);
      return;
    }
    setUploading(true);
    try {
      const book = await booksService.upload(pickedFile, parsed.data);
      setBooks((prev) => [book, ...prev]);
      closeModal();
      Toast.show({
        type: "success",
        text1: "Book uploaded",
        text2: `"${book.title}" added to your library`,
      });
    } catch (err) {
      setFormErrors({
        file: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string, bookTitle: string) => {
    setDeleteTarget({ id, title: bookTitle });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, title: bookTitle } = deleteTarget;
    setDeleteTarget(null);
    try {
      await booksService.delete(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      Toast.show({
        type: "success",
        text1: "Book removed",
        text2: `"${bookTitle}" deleted from your library`,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: "Could not remove the book.",
      });
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await booksService.process(id);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: "PROCESSING" as const } : b,
        ),
      );
      Toast.show({
        type: "success",
        text1: "Processing started",
        text2: "Book is being re-processed",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Could not restart processing.",
      });
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Book"
        message={`Remove "${deleteTarget?.title}" from your library? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.pageTitle}>Library</Text>
          <Text style={s.pageSubtitle}>
            {books.length} {books.length === 1 ? "book" : "books"}
          </Text>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={openModal}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.addBtnGradient}
          >
            <Plus color="#0d0d0d" size={20} strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Book list */}
      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {loading ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>Loading…</Text>
          </View>
        ) : books.length === 0 ? (
          <View style={s.empty}>
            <BookOpen color={COLORS.textDisabled} size={48} strokeWidth={1.2} />
            <Text style={s.emptyTitle}>No books yet</Text>
            <Text style={s.emptyText}>Upload a PDF to get started</Text>
          </View>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onDelete={handleDelete}
              onProcess={handleProcess}
            />
          ))
        )}
      </ScrollView>

      {/* Upload modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={s.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View
            style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}
          >
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Upload Book</Text>
              <TouchableOpacity onPress={closeModal} hitSlop={8}>
                <X color={COLORS.textDisabled} size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* File picker */}
            <TouchableOpacity
              style={[s.filePicker, pickedFile && s.filePickerFilled]}
              onPress={pickFile}
              activeOpacity={0.8}
            >
              {pickedFile ? (
                <>
                  <FileText
                    color={COLORS.primary}
                    size={20}
                    strokeWidth={1.8}
                  />
                  <Text style={s.filePickerName} numberOfLines={1}>
                    {pickedFile.name}
                  </Text>
                </>
              ) : (
                <>
                  <Upload
                    color={COLORS.textDisabled}
                    size={20}
                    strokeWidth={1.8}
                  />
                  <Text style={s.filePickerText}>Select PDF file</Text>
                </>
              )}
            </TouchableOpacity>
            {formErrors.file && (
              <Text style={s.fieldError}>{formErrors.file}</Text>
            )}

            {/* Title */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Title</Text>
              <TextInput
                style={[s.input, formErrors.title && s.inputError]}
                placeholder="Book title"
                placeholderTextColor={COLORS.textDisabled}
                value={title}
                onChangeText={(v) => {
                  setTitle(v);
                  setFormErrors((p) => ({ ...p, title: "" }));
                }}
                selectionColor={COLORS.primary}
              />
              {formErrors.title && (
                <Text style={s.fieldError}>{formErrors.title}</Text>
              )}
            </View>

            {/* Author */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>
                Author <Text style={s.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder="Author name"
                placeholderTextColor={COLORS.textDisabled}
                value={author}
                onChangeText={setAuthor}
                selectionColor={COLORS.primary}
              />
            </View>

            {/* Language */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Language</Text>
              <View style={s.langRow}>
                {LANGUAGES.map((l) => (
                  <TouchableOpacity
                    key={l.code}
                    style={[s.langBtn, language === l.code && s.langBtnActive]}
                    onPress={() => setLanguage(l.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.langFlag}>{l.flag}</Text>
                    <Text
                      style={[
                        s.langLabel,
                        language === l.code && s.langLabelActive,
                      ]}
                    >
                      {l.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleUpload}
              disabled={uploading}
              activeOpacity={0.8}
              style={{ marginTop: 4 }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.submitBtn}
              >
                {uploading && <View style={s.submitDim} />}
                <Text style={s.submitText}>
                  {uploading ? "Uploading…" : "Upload Book"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    color: COLORS.textDisabled,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  addBtn: { borderRadius: 14 },
  addBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { color: COLORS.textMuted, fontSize: 17, fontWeight: "700" },
  emptyText: { color: COLORS.textDisabled, fontSize: 14, fontWeight: "500" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sheetTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  filePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    padding: 16,
  },
  filePickerFilled: {
    borderStyle: "solid",
    borderColor: "rgba(201,168,76,0.35)",
  },
  filePickerText: {
    color: COLORS.textDisabled,
    fontSize: 14,
    fontWeight: "500",
  },
  filePickerName: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  optional: { color: COLORS.textDisabled, fontWeight: "400" },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
  },
  inputError: { borderColor: "rgba(224,92,92,0.45)" },
  fieldError: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 2,
  },
  langRow: { flexDirection: "row", gap: 8 },
  langBtn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    gap: 4,
  },
  langBtnActive: {
    borderColor: "rgba(201,168,76,0.5)",
    backgroundColor: "rgba(201,168,76,0.08)",
  },
  langFlag: { fontSize: 18 },
  langLabel: { color: COLORS.textDisabled, fontSize: 10, fontWeight: "600" },
  langLabelActive: { color: COLORS.primary },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  submitDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 14,
  },
  submitText: {
    color: "#0d0d0d",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
