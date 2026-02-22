import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Check,
  Shield,
  FileText,
  AlertCircle,
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

    if (!reason.trim()) {
      setErrorMessage(
        isArabic ? "يرجى اختيار سبب الإبلاغ" : "Please select a reason",
      );
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        isArabic ? "يرجى تقديم تفاصيل" : "Please provide details",
      );
      return;
    }

    if (!isDescriptionValid) {
      const minMsg = isArabic
        ? "يجب أن يكون الوصف بين 20 و 1000 حرف"
        : "Description must be between 20 and 1000 characters";
      setErrorMessage(minMsg);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await api.post(API_ENDPOINTS.REPORTS.CREATE, {
        targetId,
        targetType,
        reason,
        description,
      });

      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setReason("");
        setDescription("");
        setDescriptionLength(0);
        setErrorMessage("");
      }, 2000);
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        (isArabic ? "فشل في إرسال الإبلاغ" : "Failed to submit report");
      setErrorMessage(message);
      setStatus("error");
    }
  };

  const reasonKey = reason as keyof typeof REPORT_REASONS;
  const selectedReason = reasonKey ? REPORT_REASONS[reasonKey] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 shadow-2xl glass rounded-2xl animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/30">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("report")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {targetType === "USER" ? t("user") : t("listing")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Success State */}
        {status === "success" ? (
          <div className="py-12 space-y-4 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600">
              <Check className="w-10 h-10 text-white" />
            </div>
            <div>
              <h4 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                {isArabic ? "تم إرسال الإبلاغ" : "Report Submitted"}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic
                  ? "شكراً لك على مساعدتك في الحفاظ على سلامة مجتمعنا"
                  : "Thank you for helping keep our community safe"}
              </p>
            </div>
          </div>
        ) : status === "error" ? (
          /* Error State */
          <div className="py-12 space-y-4 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-600">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                {isArabic ? "فشل الإرسال" : "Submission Failed"}
              </h4>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {errorMessage ||
                  (isArabic
                    ? "يرجى التحقق من الاتصال والمحاولة مرة أخرى"
                    : "Please check your connection and try again")}
              </p>
            </div>
            <Button
              onClick={() => {
                setStatus("idle");
                setErrorMessage("");
              }}
              variant="outline"
              className="w-full"
            >
              {isArabic ? "محاولة مرة أخرى" : "Try Again"}
            </Button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {errorMessage && (
              <div className="flex gap-3 p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800/30">
                <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Report Reason */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {isArabic ? "سبب الإبلاغ *" : "Reason for Report *"}
              </label>
              <div className="relative">
                <select
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full px-4 py-3 text-gray-900 transition-colors bg-white border-2 border-gray-200 rounded-lg appearance-none dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white"
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

              {/* Reason Description */}
              {selectedReason && (
                <div className="p-3 mt-3 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedReason.description}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isArabic ? "تفاصيل الإبلاغ *" : "Report Details *"}
                </label>
                <span
                  className={`text-xs font-medium ${
                    isDescriptionValid
                      ? "text-green-600 dark:text-green-400"
                      : descriptionLength > 1000
                        ? "text-red-600 dark:text-red-400"
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
                    ? "قدم تفاصيل محددة عن سبب إبلاغك (20-1000 حرف)..."
                    : "Provide specific details about your report (20-1000 characters)..."
                }
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors bg-white border-2 border-gray-200 rounded-lg resize-none dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white"
                rows={5}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {isArabic
                  ? "يساعدنا الوصف التفصيلي في التعامل مع الإبلاغات بشكل أسرع"
                  : "Detailed descriptions help us handle reports more efficiently"}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="destructive"
              className="flex items-center justify-center w-full gap-2 py-3 font-semibold"
              disabled={status === "loading" || !isDescriptionValid}
            >
              {status === "loading" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  {isArabic ? "جارٍ الإرسال..." : "Sending..."}
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  {isArabic ? "إرسال الإبلاغ" : "Submit Report"}
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
