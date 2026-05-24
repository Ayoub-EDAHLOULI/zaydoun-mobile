export type Locale = "en" | "ar" | "fr" | "es" | "zh";

export interface Translations {
  // ── Welcome / Index ──────────────────────────────────────
  pocket_companion: string;
  speak_to_your_library: string;
  library_accent: string;
  connect_to_dashboard: string;
  sign_in_with_zaydoun_account: string;

  // ── Auth shared ───────────────────────────────────────────
  back: string;
  email_address: string;
  password: string;
  cancel: string;
  loading: string;

  // ── Login ─────────────────────────────────────────────────
  welcome_back: string;
  sign_in_subtitle: string;
  signing_in: string;
  sign_in: string;
  dont_have_account: string;
  create_one: string;
  forgot_your_password: string;

  // ── Register ──────────────────────────────────────────────
  create_account: string;
  start_journey: string;
  full_name: string;
  confirm_password: string;
  creating_account: string;
  already_have_account: string;
  sign_in_link: string;

  // ── Forgot password ───────────────────────────────────────
  forgot_password_title: string;
  forgot_password_subtitle: string;
  send_reset_link: string;
  sending: string;
  check_your_inbox: string;
  reset_link_sent: string;
  back_to_sign_in: string;

  // ── Reset password ────────────────────────────────────────
  reset_password_title: string;
  reset_password_subtitle: string;
  new_password: string;
  confirm_new_password: string;
  resetting: string;
  reset_password_btn: string;
  invalid_link: string;
  invalid_link_desc: string;
  request_new_link: string;
  password_reset_success: string;
  password_updated: string;

  // ── Validation ────────────────────────────────────────────
  email_required: string;
  email_invalid: string;
  password_required: string;
  password_min: string;
  password_max: string;
  password_weak: string;
  name_required: string;
  name_min: string;
  confirm_required: string;
  confirm_mismatch: string;

  // ── Library ───────────────────────────────────────────────
  library: string;
  no_books_yet: string;
  upload_pdf_hint: string;
  upload_book: string;
  select_pdf: string;
  book_title: string;
  author: string;
  author_placeholder: string;
  optional: string;
  language: string;
  uploading: string;
  process_book: string;
  delete_book: string;
  delete: string;
  process: string;
  ready: string;
  processing_status: string;
  pending_status: string;
  failed_status: string;

  // ── Chat ─────────────────────────────────────────────────
  no_conversations_yet: string;
  no_conversations_hint: string;
  discuss: string;

  // ── Profile ───────────────────────────────────────────────
  profile: string;
  reader_badge: string;
  account: string;
  full_name_label: string;
  email_label: string;
  member_since: string;
  zaydoun_replies_in: string;
  reply_language: string;
  voice_assistant: string;
  zaydoun_mode: string;
  voice_active: string;
  voice_disabled: string;
  sign_out: string;
  sign_out_confirm: string;
  ui_language: string;
  app_language: string;

  // ── Conversation ─────────────────────────────────────────
  voice_assistant_sub: string;
  empty_chat_hint: string;
  type_message: string;
  hold_to_talk: string;
  with_zaydoun: string;
  zaydoun_thinking: string;
  tap_to_send: string;
  zaydoun_speaking: string;
  copied: string;

  // ── Errors / toasts ───────────────────────────────────────
  mic_permission_denied: string;
  could_not_record: string;
  failed: string;
  could_not_process_voice: string;
  could_not_send_message: string;
  failed_to_load: string;
}

const en: Translations = {
  pocket_companion: "POCKET COMPANION",
  speak_to_your_library: "Speak to your",
  library_accent: "Library.",
  connect_to_dashboard: "Connect to Dashboard",
  sign_in_with_zaydoun_account: "Sign in with your Zaydoun account",
  back: "← Back",
  email_address: "Email address",
  password: "Password",
  cancel: "Cancel",
  loading: "Loading…",
  welcome_back: "Welcome back",
  sign_in_subtitle: "Sign in to your reading companion",
  signing_in: "Signing in…",
  sign_in: "Sign In",
  dont_have_account: "Don't have an account?",
  create_one: "Create one",
  forgot_your_password: "Forgot your password?",
  create_account: "Create account",
  start_journey: "Start your reading journey",
  full_name: "Full name",
  confirm_password: "Confirm password",
  creating_account: "Creating account…",
  already_have_account: "Already have an account?",
  sign_in_link: "Sign in",
  forgot_password_title: "Forgot password?",
  forgot_password_subtitle: "We'll send a reset link to your inbox",
  send_reset_link: "Send Reset Link",
  sending: "Sending…",
  check_your_inbox: "Check your inbox",
  reset_link_sent: "A reset link is on its way. Check your spam folder too.",
  back_to_sign_in: "Back to Sign In",
  reset_password_title: "New password",
  reset_password_subtitle: "Choose a strong password for your account",
  new_password: "New password",
  confirm_new_password: "Confirm new password",
  resetting: "Resetting…",
  reset_password_btn: "Reset Password",
  invalid_link: "Invalid link",
  invalid_link_desc:
    "This reset link is missing or invalid. Request a new one.",
  request_new_link: "Request new link",
  password_reset_success: "Password reset!",
  password_updated:
    "Your password has been updated. Sign in with your new password.",
  email_required: "Email is required",
  email_invalid: "Enter a valid email address",
  password_required: "Password is required",
  password_min: "Password must be at least 8 characters",
  password_max: "Password is too long",
  password_weak: "Must contain uppercase, lowercase and a number",
  name_required: "Name is required",
  name_min: "Name must be at least 2 characters",
  confirm_required: "Please confirm your password",
  confirm_mismatch: "Passwords do not match",
  library: "Library",
  no_books_yet: "No books yet",
  upload_pdf_hint: "Upload a PDF to get started",
  upload_book: "Upload Book",
  select_pdf: "Select PDF file",
  book_title: "Book title",
  author: "Author",
  author_placeholder: "Author name",
  optional: "(optional)",
  language: "Language",
  uploading: "Uploading…",
  process_book: "Process Book",
  delete_book: "Delete Book",
  delete: "Delete",
  process: "Process",
  ready: "Ready",
  processing_status: "Processing",
  pending_status: "Pending",
  failed_status: "Failed",
  no_conversations_yet: "No conversations yet",
  no_conversations_hint:
    "Tap Discuss on a ready book in your library to start talking with Zaydoun.",
  discuss: "Discuss",
  profile: "Profile",
  reader_badge: "Reader",
  account: "Account",
  full_name_label: "Full Name",
  email_label: "Email",
  member_since: "Member Since",
  zaydoun_replies_in: "Zaydoun Replies In",
  reply_language: "Reply Language",
  voice_assistant: "Voice Assistant",
  zaydoun_mode: "Zaydoun Mode",
  voice_active: "Active — say «Zaydoun»",
  voice_disabled: "Disabled",
  sign_out: "Sign Out",
  sign_out_confirm: "Are you sure you want to sign out of your account?",
  ui_language: "App Language",
  app_language: "Interface Language",
  voice_assistant_sub: "Zaydoun · Voice assistant",
  empty_chat_hint: "Hold the mic and ask anything about the book",
  type_message: "Type a message…",
  hold_to_talk: "Hold to talk",
  with_zaydoun: "with Zaydoun",
  zaydoun_thinking: "Zaydoun is thinking…",
  tap_to_send: "Tap to send · sends on silence",
  zaydoun_speaking: "Zaydoun is speaking…",
  copied: "Copied",
  mic_permission_denied: "Microphone permission denied",
  could_not_record: "Could not start recording",
  failed: "Failed",
  could_not_process_voice: "Could not process voice",
  could_not_send_message: "Could not send message",
  failed_to_load: "Failed to load conversation",
};

const ar: Translations = {
  pocket_companion: "مساعد جيبك",
  speak_to_your_library: "تحدث إلى",
  library_accent: "مكتبتك.",
  connect_to_dashboard: "الاتصال بلوحة التحكم",
  sign_in_with_zaydoun_account: "سجّل دخولك بحساب زيدون",
  back: "→ رجوع",
  email_address: "البريد الإلكتروني",
  password: "كلمة المرور",
  cancel: "إلغاء",
  loading: "جارٍ التحميل…",
  welcome_back: "مرحباً بعودتك",
  sign_in_subtitle: "سجّل دخولك إلى رفيق القراءة",
  signing_in: "جارٍ تسجيل الدخول…",
  sign_in: "تسجيل الدخول",
  dont_have_account: "ليس لديك حساب؟",
  create_one: "أنشئ حساباً",
  forgot_your_password: "نسيت كلمة المرور؟",
  create_account: "إنشاء حساب",
  start_journey: "ابدأ رحلة قراءتك",
  full_name: "الاسم الكامل",
  confirm_password: "تأكيد كلمة المرور",
  creating_account: "جارٍ إنشاء الحساب…",
  already_have_account: "هل لديك حساب بالفعل؟",
  sign_in_link: "تسجيل الدخول",
  forgot_password_title: "نسيت كلمة المرور؟",
  forgot_password_subtitle: "سنرسل رابط إعادة التعيين إلى بريدك",
  send_reset_link: "إرسال رابط الاستعادة",
  sending: "جارٍ الإرسال…",
  check_your_inbox: "تحقق من بريدك",
  reset_link_sent:
    "الرابط في طريقه إليك. تحقق من مجلد الرسائل غير المرغوب فيها.",
  back_to_sign_in: "العودة إلى تسجيل الدخول",
  reset_password_title: "كلمة مرور جديدة",
  reset_password_subtitle: "اختر كلمة مرور قوية لحسابك",
  new_password: "كلمة المرور الجديدة",
  confirm_new_password: "تأكيد كلمة المرور الجديدة",
  resetting: "جارٍ الإعادة…",
  reset_password_btn: "إعادة تعيين كلمة المرور",
  invalid_link: "رابط غير صالح",
  invalid_link_desc: "هذا الرابط مفقود أو غير صالح. اطلب رابطاً جديداً.",
  request_new_link: "طلب رابط جديد",
  password_reset_success: "تمّت إعادة التعيين!",
  password_updated: "تم تحديث كلمة مرورك. سجّل الدخول بكلمة مرورك الجديدة.",
  email_required: "البريد الإلكتروني مطلوب",
  email_invalid: "أدخل بريداً إلكترونياً صحيحاً",
  password_required: "كلمة المرور مطلوبة",
  password_min: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
  password_max: "كلمة المرور طويلة جداً",
  password_weak: "يجب أن تحتوي على أحرف كبيرة وصغيرة ورقم",
  name_required: "الاسم مطلوب",
  name_min: "يجب أن يتكون الاسم من حرفين على الأقل",
  confirm_required: "يرجى تأكيد كلمة المرور",
  confirm_mismatch: "كلمتا المرور غير متطابقتين",
  library: "المكتبة",
  no_books_yet: "لا كتب بعد",
  upload_pdf_hint: "ارفع ملف PDF للبدء",
  upload_book: "رفع كتاب",
  select_pdf: "اختر ملف PDF",
  book_title: "عنوان الكتاب",
  author: "المؤلف",
  author_placeholder: "اسم المؤلف",
  optional: "(اختياري)",
  language: "اللغة",
  uploading: "جارٍ الرفع…",
  process_book: "معالجة الكتاب",
  delete_book: "حذف الكتاب",
  delete: "حذف",
  process: "معالجة",
  ready: "جاهز",
  processing_status: "قيد المعالجة",
  pending_status: "قيد الانتظار",
  failed_status: "فشل",
  no_conversations_yet: "لا محادثات بعد",
  no_conversations_hint:
    "اضغط على «ناقش» على كتاب جاهز في مكتبتك لبدء الحديث مع زيدون.",
  discuss: "ناقش",
  profile: "الملف الشخصي",
  reader_badge: "قارئ",
  account: "الحساب",
  full_name_label: "الاسم الكامل",
  email_label: "البريد الإلكتروني",
  member_since: "عضو منذ",
  zaydoun_replies_in: "زيدون يردّ بـ",
  reply_language: "لغة الردود",
  voice_assistant: "المساعد الصوتي",
  zaydoun_mode: "وضع زيدون",
  voice_active: "نشط — قل «زيدون»",
  voice_disabled: "معطّل",
  sign_out: "تسجيل الخروج",
  sign_out_confirm: "هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟",
  ui_language: "لغة التطبيق",
  app_language: "لغة الواجهة",
  voice_assistant_sub: "زيدون · المساعد الصوتي",
  empty_chat_hint: "اضغط مطولاً على الميكروفون واسأل أي شيء عن الكتاب",
  type_message: "اكتب رسالة…",
  hold_to_talk: "اضغط للتحدث",
  with_zaydoun: "مع زيدون",
  zaydoun_thinking: "زيدون يفكّر…",
  tap_to_send: "اضغط للإرسال · يُرسل عند الصمت",
  zaydoun_speaking: "زيدون يتحدث…",
  copied: "تم النسخ",
  mic_permission_denied: "تم رفض إذن الميكروفون",
  could_not_record: "تعذّر بدء التسجيل",
  failed: "فشل",
  could_not_process_voice: "تعذّرت معالجة الصوت",
  could_not_send_message: "تعذّر إرسال الرسالة",
  failed_to_load: "فشل تحميل المحادثة",
};

const fr: Translations = {
  pocket_companion: "COMPAGNON DE POCHE",
  speak_to_your_library: "Parlez à votre",
  library_accent: "Bibliothèque.",
  connect_to_dashboard: "Connexion au tableau de bord",
  sign_in_with_zaydoun_account: "Connectez-vous avec votre compte Zaydoun",
  back: "← Retour",
  email_address: "Adresse e-mail",
  password: "Mot de passe",
  cancel: "Annuler",
  loading: "Chargement…",
  welcome_back: "Bon retour",
  sign_in_subtitle: "Connectez-vous à votre compagnon de lecture",
  signing_in: "Connexion en cours…",
  sign_in: "Se connecter",
  dont_have_account: "Pas encore de compte ?",
  create_one: "Créer un compte",
  forgot_your_password: "Mot de passe oublié ?",
  create_account: "Créer un compte",
  start_journey: "Commencez votre parcours de lecture",
  full_name: "Nom complet",
  confirm_password: "Confirmer le mot de passe",
  creating_account: "Création du compte…",
  already_have_account: "Vous avez déjà un compte ?",
  sign_in_link: "Se connecter",
  forgot_password_title: "Mot de passe oublié ?",
  forgot_password_subtitle:
    "Nous enverrons un lien de réinitialisation à votre boîte mail",
  send_reset_link: "Envoyer le lien",
  sending: "Envoi en cours…",
  check_your_inbox: "Vérifiez votre boîte mail",
  reset_link_sent: "Un lien est en route. Vérifiez aussi vos spams.",
  back_to_sign_in: "Retour à la connexion",
  reset_password_title: "Nouveau mot de passe",
  reset_password_subtitle: "Choisissez un mot de passe fort pour votre compte",
  new_password: "Nouveau mot de passe",
  confirm_new_password: "Confirmer le nouveau mot de passe",
  resetting: "Réinitialisation…",
  reset_password_btn: "Réinitialiser",
  invalid_link: "Lien invalide",
  invalid_link_desc:
    "Ce lien est manquant ou invalide. Demandez-en un nouveau.",
  request_new_link: "Demander un nouveau lien",
  password_reset_success: "Mot de passe réinitialisé !",
  password_updated:
    "Votre mot de passe a été mis à jour. Connectez-vous avec votre nouveau mot de passe.",
  email_required: "L'e-mail est requis",
  email_invalid: "Entrez une adresse e-mail valide",
  password_required: "Le mot de passe est requis",
  password_min: "Le mot de passe doit contenir au moins 8 caractères",
  password_max: "Le mot de passe est trop long",
  password_weak: "Doit contenir majuscule, minuscule et un chiffre",
  name_required: "Le nom est requis",
  name_min: "Le nom doit contenir au moins 2 caractères",
  confirm_required: "Veuillez confirmer votre mot de passe",
  confirm_mismatch: "Les mots de passe ne correspondent pas",
  library: "Bibliothèque",
  no_books_yet: "Aucun livre",
  upload_pdf_hint: "Importez un PDF pour commencer",
  upload_book: "Importer un livre",
  select_pdf: "Sélectionner un fichier PDF",
  book_title: "Titre du livre",
  author: "Auteur",
  author_placeholder: "Nom de l'auteur",
  optional: "(optionnel)",
  language: "Langue",
  uploading: "Importation…",
  process_book: "Traiter le livre",
  delete_book: "Supprimer le livre",
  delete: "Supprimer",
  process: "Traiter",
  ready: "Prêt",
  processing_status: "En traitement",
  pending_status: "En attente",
  failed_status: "Échec",
  no_conversations_yet: "Aucune conversation",
  no_conversations_hint:
    "Appuyez sur Discuter sur un livre prêt dans votre bibliothèque pour parler avec Zaydoun.",
  discuss: "Discuter",
  profile: "Profil",
  reader_badge: "Lecteur",
  account: "Compte",
  full_name_label: "Nom complet",
  email_label: "E-mail",
  member_since: "Membre depuis",
  zaydoun_replies_in: "Zaydoun répond en",
  reply_language: "Langue de réponse",
  voice_assistant: "Assistant vocal",
  zaydoun_mode: "Mode Zaydoun",
  voice_active: "Actif — dites «Zaydoun»",
  voice_disabled: "Désactivé",
  sign_out: "Se déconnecter",
  sign_out_confirm: "Êtes-vous sûr de vouloir vous déconnecter ?",
  ui_language: "Langue de l'app",
  app_language: "Langue de l'interface",
  voice_assistant_sub: "Zaydoun · Assistant vocal",
  empty_chat_hint:
    "Maintenez le micro et posez n'importe quelle question sur le livre",
  type_message: "Tapez un message…",
  hold_to_talk: "Maintenez pour parler",
  with_zaydoun: "avec Zaydoun",
  zaydoun_thinking: "Zaydoun réfléchit…",
  tap_to_send: "Appuyez pour envoyer · envoi au silence",
  zaydoun_speaking: "Zaydoun parle…",
  copied: "Copié",
  mic_permission_denied: "Permission micro refusée",
  could_not_record: "Impossible de démarrer l'enregistrement",
  failed: "Échec",
  could_not_process_voice: "Impossible de traiter la voix",
  could_not_send_message: "Impossible d'envoyer le message",
  failed_to_load: "Échec du chargement de la conversation",
};

const es: Translations = {
  pocket_companion: "COMPAÑERO DE BOLSILLO",
  speak_to_your_library: "Habla con tu",
  library_accent: "Biblioteca.",
  connect_to_dashboard: "Conectar al panel",
  sign_in_with_zaydoun_account: "Inicia sesión con tu cuenta de Zaydoun",
  back: "← Volver",
  email_address: "Correo electrónico",
  password: "Contraseña",
  cancel: "Cancelar",
  loading: "Cargando…",
  welcome_back: "Bienvenido de nuevo",
  sign_in_subtitle: "Inicia sesión en tu compañero de lectura",
  signing_in: "Iniciando sesión…",
  sign_in: "Iniciar sesión",
  dont_have_account: "¿No tienes cuenta?",
  create_one: "Crear una",
  forgot_your_password: "¿Olvidaste tu contraseña?",
  create_account: "Crear cuenta",
  start_journey: "Comienza tu viaje de lectura",
  full_name: "Nombre completo",
  confirm_password: "Confirmar contraseña",
  creating_account: "Creando cuenta…",
  already_have_account: "¿Ya tienes cuenta?",
  sign_in_link: "Inicia sesión",
  forgot_password_title: "¿Olvidaste tu contraseña?",
  forgot_password_subtitle: "Te enviaremos un enlace de restablecimiento",
  send_reset_link: "Enviar enlace",
  sending: "Enviando…",
  check_your_inbox: "Revisa tu bandeja de entrada",
  reset_link_sent:
    "El enlace está en camino. Revisa también tu carpeta de spam.",
  back_to_sign_in: "Volver al inicio de sesión",
  reset_password_title: "Nueva contraseña",
  reset_password_subtitle: "Elige una contraseña segura para tu cuenta",
  new_password: "Nueva contraseña",
  confirm_new_password: "Confirmar nueva contraseña",
  resetting: "Restableciendo…",
  reset_password_btn: "Restablecer contraseña",
  invalid_link: "Enlace inválido",
  invalid_link_desc: "Este enlace falta o no es válido. Solicita uno nuevo.",
  request_new_link: "Solicitar nuevo enlace",
  password_reset_success: "¡Contraseña restablecida!",
  password_updated:
    "Tu contraseña ha sido actualizada. Inicia sesión con tu nueva contraseña.",
  email_required: "El correo es obligatorio",
  email_invalid: "Introduce un correo válido",
  password_required: "La contraseña es obligatoria",
  password_min: "La contraseña debe tener al menos 8 caracteres",
  password_max: "La contraseña es demasiado larga",
  password_weak: "Debe contener mayúsculas, minúsculas y un número",
  name_required: "El nombre es obligatorio",
  name_min: "El nombre debe tener al menos 2 caracteres",
  confirm_required: "Por favor confirma tu contraseña",
  confirm_mismatch: "Las contraseñas no coinciden",
  library: "Biblioteca",
  no_books_yet: "Sin libros aún",
  upload_pdf_hint: "Sube un PDF para empezar",
  upload_book: "Subir libro",
  select_pdf: "Seleccionar archivo PDF",
  book_title: "Título del libro",
  author: "Autor",
  author_placeholder: "Nombre del autor",
  optional: "(opcional)",
  language: "Idioma",
  uploading: "Subiendo…",
  process_book: "Procesar libro",
  delete_book: "Eliminar libro",
  delete: "Eliminar",
  process: "Procesar",
  ready: "Listo",
  processing_status: "Procesando",
  pending_status: "Pendiente",
  failed_status: "Fallido",
  no_conversations_yet: "Sin conversaciones aún",
  no_conversations_hint:
    "Pulsa Discutir en un libro listo en tu biblioteca para hablar con Zaydoun.",
  discuss: "Discutir",
  profile: "Perfil",
  reader_badge: "Lector",
  account: "Cuenta",
  full_name_label: "Nombre completo",
  email_label: "Correo electrónico",
  member_since: "Miembro desde",
  zaydoun_replies_in: "Zaydoun responde en",
  reply_language: "Idioma de respuesta",
  voice_assistant: "Asistente de voz",
  zaydoun_mode: "Modo Zaydoun",
  voice_active: "Activo — di «Zaydoun»",
  voice_disabled: "Desactivado",
  sign_out: "Cerrar sesión",
  sign_out_confirm: "¿Estás seguro de que quieres cerrar sesión?",
  ui_language: "Idioma de la app",
  app_language: "Idioma de la interfaz",
  voice_assistant_sub: "Zaydoun · Asistente de voz",
  empty_chat_hint:
    "Mantén el micrófono y pregunta cualquier cosa sobre el libro",
  type_message: "Escribe un mensaje…",
  hold_to_talk: "Mantén para hablar",
  with_zaydoun: "con Zaydoun",
  zaydoun_thinking: "Zaydoun está pensando…",
  tap_to_send: "Toca para enviar · envía en silencio",
  zaydoun_speaking: "Zaydoun está hablando…",
  copied: "Copiado",
  mic_permission_denied: "Permiso de micrófono denegado",
  could_not_record: "No se pudo iniciar la grabación",
  failed: "Error",
  could_not_process_voice: "No se pudo procesar la voz",
  could_not_send_message: "No se pudo enviar el mensaje",
  failed_to_load: "Error al cargar la conversación",
};

const zh: Translations = {
  pocket_companion: "口袋伴侣",
  speak_to_your_library: "与您的",
  library_accent: "书库对话。",
  connect_to_dashboard: "连接到控制台",
  sign_in_with_zaydoun_account: "使用您的 Zaydoun 账户登录",
  back: "← 返回",
  email_address: "电子邮箱",
  password: "密码",
  cancel: "取消",
  loading: "加载中…",
  welcome_back: "欢迎回来",
  sign_in_subtitle: "登录您的阅读助手",
  signing_in: "登录中…",
  sign_in: "登录",
  dont_have_account: "还没有账户？",
  create_one: "创建账户",
  forgot_your_password: "忘记密码？",
  create_account: "创建账户",
  start_journey: "开启您的阅读之旅",
  full_name: "全名",
  confirm_password: "确认密码",
  creating_account: "创建账户中…",
  already_have_account: "已有账户？",
  sign_in_link: "登录",
  forgot_password_title: "忘记密码？",
  forgot_password_subtitle: "我们将向您的邮箱发送重置链接",
  send_reset_link: "发送重置链接",
  sending: "发送中…",
  check_your_inbox: "请查收您的邮件",
  reset_link_sent: "链接正在发送中，请同时检查垃圾邮件文件夹。",
  back_to_sign_in: "返回登录",
  reset_password_title: "新密码",
  reset_password_subtitle: "为您的账户选择一个强密码",
  new_password: "新密码",
  confirm_new_password: "确认新密码",
  resetting: "重置中…",
  reset_password_btn: "重置密码",
  invalid_link: "无效链接",
  invalid_link_desc: "此重置链接丢失或无效，请申请新链接。",
  request_new_link: "申请新链接",
  password_reset_success: "密码已重置！",
  password_updated: "您的密码已更新，请使用新密码登录。",
  email_required: "邮箱为必填项",
  email_invalid: "请输入有效的邮箱地址",
  password_required: "密码为必填项",
  password_min: "密码至少需要8个字符",
  password_max: "密码太长",
  password_weak: "必须包含大写字母、小写字母和数字",
  name_required: "姓名为必填项",
  name_min: "姓名至少需要2个字符",
  confirm_required: "请确认您的密码",
  confirm_mismatch: "两次密码不一致",
  library: "书库",
  no_books_yet: "暂无书籍",
  upload_pdf_hint: "上传 PDF 文件开始使用",
  upload_book: "上传书籍",
  select_pdf: "选择 PDF 文件",
  book_title: "书名",
  author: "作者",
  author_placeholder: "作者姓名",
  optional: "（可选）",
  language: "语言",
  uploading: "上传中…",
  process_book: "处理书籍",
  delete_book: "删除书籍",
  delete: "删除",
  process: "处理",
  ready: "就绪",
  processing_status: "处理中",
  pending_status: "等待中",
  failed_status: "失败",
  no_conversations_yet: "暂无对话",
  no_conversations_hint:
    "在书库中点击就绪书籍上的「讨论」，开始与 Zaydoun 对话。",
  discuss: "讨论",
  profile: "个人资料",
  reader_badge: "读者",
  account: "账户",
  full_name_label: "全名",
  email_label: "电子邮箱",
  member_since: "注册时间",
  zaydoun_replies_in: "Zaydoun 回复语言",
  reply_language: "回复语言",
  voice_assistant: "语音助手",
  zaydoun_mode: "Zaydoun 模式",
  voice_active: "已激活 — 说「Zaydoun」",
  voice_disabled: "已禁用",
  sign_out: "退出登录",
  sign_out_confirm: "您确定要退出账户吗？",
  ui_language: "应用语言",
  app_language: "界面语言",
  voice_assistant_sub: "Zaydoun · 语音助手",
  empty_chat_hint: "长按麦克风，询问任何关于这本书的问题",
  type_message: "输入消息…",
  hold_to_talk: "长按说话",
  with_zaydoun: "与 Zaydoun",
  zaydoun_thinking: "Zaydoun 正在思考…",
  tap_to_send: "点击发送 · 静音时自动发送",
  zaydoun_speaking: "Zaydoun 正在说话…",
  copied: "已复制",
  mic_permission_denied: "麦克风权限被拒绝",
  could_not_record: "无法开始录音",
  failed: "失败",
  could_not_process_voice: "无法处理语音",
  could_not_send_message: "无法发送消息",
  failed_to_load: "加载对话失败",
};

export const TRANSLATIONS: Record<Locale, Translations> = {
  en,
  ar,
  fr,
  es,
  zh,
};
