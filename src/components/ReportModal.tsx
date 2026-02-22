import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Check,
  Shield,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import { api } from "@/services/api";
import { API_ENDPOINTS } from "@/config/constants";
import { useTranslation } from "react-i18next";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "USER" | "LISTING";
}

// Report reasons - English
const REPORT_REASONS_EN = {
  SPAM: {
    label: "Spam or Scam",
    description: "Suspicious offers, false information, or spam messages",
    icon: "🚫",
  },
  INAPPROPRIATE: {
    label: "Inappropriate Content",
    description: "Contains offensive, adult, or hateful content",
    icon: "⚠️",
  },
  HARASSMENT: {
    label: "Harassment",
    description: "Abusive, threatening, or harassing behavior",
    icon: "😠",
  },
  MISLEADING: {
    label: "Misleading Information",
    description: "False or inaccurate listing details",
    icon: "❓",
  },
  FAKE_PROFILE: {
    label: "Fake Profile",
    description: "This appears to be a fake or impersonated account",
    icon: "🎭",
  },
  SCAM: {
    label: "Scam/Fraud",
    description: "Potential financial fraud or money scam",
    icon: "🔴",
  },
  OTHER: {
    label: "Other",
    description: "Something else not listed above",
    icon: "📋",
  },
};

// Report reasons - Arabic
const REPORT_REASONS_AR = {
  SPAM: {
    label: "رسائل غير مرغوبة أو احتيال",
    description: "عروض مريبة أو معلومات كاذبة أو رسائل غير مرغوبة",
    icon: "🚫",
  },
  INAPPROPRIATE: {
    label: "محتوى غير لائق",
    description: "يحتوي على محتوى مسيء أو بالغ أو كاره",
    icon: "⚠️",
  },
  HARASSMENT: {
    label: "مضايقة",
    description: "سلوك مسيء أو تهديدي أو مزعج",
    icon: "😠",
  },
  MISLEADING: {
    label: "معلومات مضللة",
    description: "تفاصيل الإعلان غير صحيحة أو غير دقيقة",
    icon: "❓",
  },
  FAKE_PROFILE: {
    label: "ملف شخصي وهمي",
    description: "يبدو أن هذا حساب وهمي أو محاكاة هوية",
    icon: "🎭",
  },
  SCAM: {
    label: "احتيال/غش",
    description: "احتيال مالي محتمل أو خدعة نقود",
    icon: "🔴",
  },
  OTHER: {
    label: "غير ذلك",
    description: "شيء آخر غير مذكور أعلاه",
    icon: "📋",
  },
};

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const REPORT_REASONS = isArabic ? REPORT_REASONS_AR : REPORT_REASONS_EN;

  const { token, isAuthenticated } = useAuth();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);

  if (!isOpen) return null;

  if (!isAuthenticated || !token) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md p-6 glass rounded-2xl animate-fadeInUp">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Shield className="w-6 h-6" />
              <h3 className="text-xl font-bold">{t("auth_required")}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {t("must_be_logged_in_report")}
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">
            {t("close")}
          </Button>
        </div>
      </div>
    );
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setDescription(value);
    setDescriptionLength(value.length);
    setErrorMessage("");
  };

  const isDescriptionValid =
    descriptionLength >= 20 && descriptionLength <= 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!reason.trim()) {
      setErrorMessage(
        isArabic ? "يرجى اختيار سبب الإبلاغ" : "Please select a reason"
      );
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        isArabic ? "يرجى تقديم تفاصيل الإبلاغ" : "Please provide report details"
      );
      return;
    }

    if (!isDescriptionValid) {
      const minMsg = isArabic
        ? "يجب أن يكون الوصف بين 20 و 1000 حرف على الأقل"
        : "Description must be between 20 and 1000 characters";
      setErrorMessage(minMsg);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      console.log("📤 Sending report...", {
        targetId,
        targetType,
        reason,
        descriptionLength: description.length,
      });

      const response = await api.post(API_ENDPOINTS.REPORTS.CREATE, {
        targetId,
        targetType,
        reason,
        description,
      });

      console.log("✅ Report submitted successfully:", response.data);

      setStatus("success");
      setTimeout(() => {
        onClose();
        // Reset form
        setStatus("idle");
        setReason("");
        setDescription("");
        setDescriptionLength(0);
        setErrorMessage("");
      }, 2000);
    } catch (error: any) {
      console.error("❌ Report submission error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
        fullError: error.message,
      });

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        (isArabic 
          ? "فشل في إرسال الإبلاغ. يرجى المحاولة مرة أخرى"
          : "Failed to submit report. Please try again");
      
      setErrorMessage(message);
      setStatus("error");
    }
  };

  const reasonKey = reason as keyof typeof REPORT_REASONS;
  const selectedReason = reasonKey ? REPORT_REASONS[reasonKey] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden border border-gray-200 shadow-2xl glass rounded-2xl dark:border-gray-700">
        {/* Header - Improved Styling */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 rounded-lg dark:bg-red-900/40">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("report")}
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  {targetType === "USER" ? t("user") : t("listing")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 transition-all rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 active:scale-95"
            >
              <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Success State */}
          {status === "success" ? (
            <div className="py-8 space-y-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <div>
                <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                  {isArabic ? "تم إرسال الإبلاغ" : "Report Submitted"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic
                    ? "شكراً لك على مساعدتك في الحفاظ على سلامة مجتمعنا. سيتم مراجعة إبلاغك قريباً."
                    : "Thank you for helping keep our community safe. Your report will be reviewed soon."}
                </p>
              </div>
            </div>
          ) : status === "error" ? (
            /* Error State */
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-600">
                <AlertCircle className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div className="text-center">
                <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {isArabic ? "فشل الإرسال" : "Submission Failed"}
                </h4>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {errorMessage ||
                    (isArabic
                      ? "يرجى التحقق من الاتصال والمحاولة مرة أخرى"
                      : "Please check your connection and try again")}
                </p>
                <Button
                  onClick={() => {
                    setStatus("idle");
                    setErrorMessage("");
                  }}
                  className="w-full"
                >
                  {isArabic ? "العودة للإبلاغ" : "Go Back"}
                </Button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {errorMessage && (
                <div className="flex gap-3 p-3.5 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-900/20 dark:border-red-800/30 backdrop-blur-sm">
                  <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Report Reason Select */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isArabic ? "سبب الإبلاغ" : "Reason for Report"}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full px-4 py-3 text-gray-900 transition-colors bg-white border-2 border-gray-200 rounded-lg appearance-none dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white font-medium"
                  >
                    <option value="">
                      {isArabic ? "اختر السبب..." : "Select a reason..."}
                    </option>
                    {Object.entries(REPORT_REASONS).map(([key, val]: any) => (
                      <option key={key} value={key}>
                        {val.icon} {val.label}
                      </option>
                    ))}
                  </select>
                  <Shield className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                </div>

                {/* Reason Description Tooltip */}
                {selectedReason && (
                  <div className="p-3.5 mt-3 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-semibold">💡 </span>
                      {selectedReason.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Description Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isArabic ? "تفاصيل الإبلاغ" : "Report Details"}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isDescriptionValid
                        ? "text-green-600 dark:text-green-400"
                        : descriptionLength > 1000
                          ? "text-red-600 dark:text-red-400"
                          : descriptionLength < 20 && descriptionLength > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {descriptionLength}/1000
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder={
                    isArabic
                      ? "قدم تفاصيل محددة وواضحة (20-1000 حرف على الأقل)..."
                      : "Provide specific and clear details (minimum 20 characters)..."
                  }
                  className={`w-full px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors bg-white border-2 rounded-lg resize-none dark:bg-gray-800 dark:text-white focus:outline-none ${
                    descriptionLength > 1000
                      ? "border-red-500 dark:border-red-500 focus:border-red-600"
                      : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
                  rows={5}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isArabic
                      ? "كلما كانت التفاصيل أدق، كان التعامل مع الإبلاغ أسرع"
                      : "The more detailed, the faster we can handle your report"}
                  </p>
                  {descriptionLength > 0 && !isDescriptionValid && (
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {descriptionLength < 20
                        ? isArabic
                          ? `أضف ${20 - descriptionLength} أحرف`
                          : `Add ${20 - descriptionLength} more character${
                              20 - descriptionLength !== 1 ? "s" : ""
                            }`
                        : isArabic
                          ? `احذف ${descriptionLength - 1000} أحرف`
                          : `Remove ${descriptionLength - 1000} character${
                              descriptionLength - 1000 !== 1 ? "s" : ""
                            }`}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="destructive"
                className="w-full py-3 font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={status === "loading" || !isDescriptionValid || !reason.trim()}
              >
                <div className="flex items-center justify-center gap-2">
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isArabic ? "جارٍ الإرسال..." : "Sending..."}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>{isArabic ? "إرسال الإبلاغ" : "Submit Report"}</span>
                    </>
                  )}
                </div>
              </Button>

              {/* Info Text */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
                {isArabic
                  ? "سيتم مراجعة إبلاغك بسرية من قبل فريق الإشراف"
                  : "Your report will be reviewed privately by our moderation team"}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
