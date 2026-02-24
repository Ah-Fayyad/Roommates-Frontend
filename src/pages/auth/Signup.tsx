import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Home,
  Phone,
  Shield,
  Upload,
  ChevronLeft,
  GraduationCap,
  Briefcase,
  FileCheck
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/constants";

const finalSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FinalForm = z.infer<typeof finalSchema>;

const Signup = () => {
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"USER" | "LANDLORD" | "ADVERTISER">("USER");
  const [error, setError] = useState("");
  const [university, setUniversity] = useState("");
  const [bio, setBio] = useState("");
  const [preferences, setPreferences] = useState({
    cleanliness: 5,
    studyHabits: 5,
    quietHours: 5,
    socializing: 5,
    cooking: 5,
    pets: false,
    smoking: false,
    guests: true,
    sleepSchedule: "FLEXIBLE",
    workSchedule: "STUDENT",
    budget: 5000,
  });

  // ID Verification state
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const fileInputFront = useRef<HTMLInputElement>(null);
  const fileInputBack = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FinalForm>({
    resolver: zodResolver(finalSchema),
  });

  const onFinalSubmit = async (data: FinalForm) => {
    try {
      setError("");

      // 1. Register User
      await registerUser(
        data.email,
        data.password,
        data.fullName,
        role,
        data.phoneNumber,
        university,
        bio,
        preferences
      );

      // 2. Handle ID Verification if required (Landlord/Advertiser)
      if ((role === 'LANDLORD' || role === 'ADVERTISER') && idFront && idBack) {
        addToast(t('uploading_ids'), "info");

        const uploadFile = async (file: File) => {
          const formData = new FormData();
          formData.append('image', file);
          const res = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return res.data.url;
        };

        try {
          const [frontUrl, backUrl] = await Promise.all([
            uploadFile(idFront),
            uploadFile(idBack)
          ]);

          await axios.post(`${API_BASE_URL}/users/verify`, {
            documentUrls: [frontUrl, backUrl]
          }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });

          addToast(t('verification_submitted'), "success");
        } catch (uploadErr) {
          console.error("Verification upload failed", uploadErr);
          addToast(t('verification_failed_but_account_created'), "warning");
        }
      }

      addToast(t('welcome_profile_ready'), "success");

      if (role === 'LANDLORD' || role === 'ADVERTISER') {
        navigate("/listings/create");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("🔴 Signup error details:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.response?.data?.error,
        debug: err.response?.data?.debug,
        fullError: err.message,
      });
      
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || t('failed_create_account');
      setError(errMsg);
      addToast(errMsg, "error");
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      if (side === 'front') setIdFront(e.target.files[0]);
      else setIdBack(e.target.files[0]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fadeInRight">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white text-center">{t('how_will_you_use')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => { setRole("USER"); nextStep(); }}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all group ${role === "USER" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10" : "border-gray-100 dark:border-gray-800 hover:border-indigo-300"}`}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 group-hover:scale-110 transition-transform">
                  <User className="h-8 w-8" />
                </div>
                <span className="text-lg font-bold">{t('i_need_room')}</span>
                <p className="text-[10px] text-center mt-2 text-gray-500">{t('find_compatible_roommates')}</p>
              </button>
              <button
                onClick={() => { setRole("LANDLORD"); nextStep(); }}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all group ${role === "LANDLORD" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10" : "border-gray-100 dark:border-gray-800 hover:border-indigo-300"}`}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 group-hover:scale-110 transition-transform">
                  <Home className="h-8 w-8" />
                </div>
                <span className="text-lg font-bold">{t('i_have_room')}</span>
                <p className="text-[10px] text-center mt-2 text-gray-500">{t('rent_out_space')}</p>
              </button>
              <button
                onClick={() => { setRole("ADVERTISER"); nextStep(); }}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all group ${role === "ADVERTISER" ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/10" : "border-gray-100 dark:border-gray-800 hover:border-blue-300"}`}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-8 w-8" />
                </div>
                <span className="text-lg font-bold">{t('i_am_advertiser')}</span>
                <p className="text-[10px] text-center mt-2 text-gray-500">{t('post_on_behalf')}</p>
              </button>
            </div>
            <div className="mt-8 text-center text-sm text-gray-500">
              {t('already_have_account')} <Link to="/login" className="text-indigo-600 font-bold">{t('sign_in')}</Link>
            </div>
          </div>
        );

      case 2:
        if (role === 'LANDLORD' || role === 'ADVERTISER') {
          return (
            <div className="animate-fadeInRight space-y-6">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-purple-600 mb-2" />
                <h2 className="text-2xl font-bold uppercase tracking-tight">{t('identity_shield')}</h2>
                <p className="text-sm text-gray-500">{t('landlords_must_verify')}</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => fileInputFront.current?.click()}
                    className={`relative p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group ${idFront ? 'border-green-500 bg-green-50/30' : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 hover:border-purple-500'}`}
                  >
                    <input type="file" hidden ref={fileInputFront} onChange={(e) => handleFileChange(e, 'front')} accept="image/*" />
                    {idFront ? (
                      <>
                        <FileCheck className="h-8 w-8 text-green-500" />
                        <span className="text-[10px] font-bold text-green-600 truncate max-w-full px-2">{idFront.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 group-hover:text-purple-500" />
                        <span className="text-[10px] font-bold uppercase text-gray-500 text-center">{t('national_id_front')}</span>
                      </>
                    )}
                  </div>

                  <div
                    onClick={() => fileInputBack.current?.click()}
                    className={`relative p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group ${idBack ? 'border-green-500 bg-green-50/30' : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 hover:border-purple-500'}`}
                  >
                    <input type="file" hidden ref={fileInputBack} onChange={(e) => handleFileChange(e, 'back')} accept="image/*" />
                    {idBack ? (
                      <>
                        <FileCheck className="h-8 w-8 text-green-500" />
                        <span className="text-[10px] font-bold text-green-600 truncate max-w-full px-2">{idBack.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 group-hover:text-purple-500" />
                        <span className="text-[10px] font-bold uppercase text-gray-500 text-center">{t('national_id_back')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                  <p className="text-[10px] text-purple-800 dark:text-purple-300 font-medium text-center">
                    💡 <strong>{t('trust_is_key')}</strong> {t('verified_landlords_benefit')}
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <Button onClick={prevStep} variant="outline" className="flex-1">
                  <ChevronLeft className="mr-2 h-4 w-4" /> {t('back')}
                </Button>
                <Button onClick={nextStep} variant="gradient" className="flex-1" disabled={!idFront || !idBack}>{t('verify_and_continue')}</Button>
              </div>
            </div>
          );
        }
        return (
          <div className="animate-fadeInRight space-y-6">
            <div className="text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-indigo-600 mb-2" />
              <h2 className="text-2xl font-bold">{t('tell_us_about_studies')}</h2>
              <p className="text-gray-500">{t('helps_match_campus')}</p>
            </div>

            <div>
              <label className="block mb-3 font-semibold text-gray-700 dark:text-gray-300">{t('university_institution')}</label>
              <div className="grid grid-cols-2 gap-2">
                {["جامعة القاهرة", "جامعة عين شمس", "الجامعة الأمريكية", "الجامعة الألمانية", "BUE", "MUST", "MSA"].map(uni => (
                  <button
                    key={uni}
                    onClick={() => setUniversity(uni)}
                    className={`px-3 py-2 text-sm rounded-xl border-2 transition-all ${university === uni ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30" : "border-gray-100 dark:border-gray-800"}`}
                  >
                    {uni}
                  </button>
                ))}
                <button
                  onClick={() => setUniversity("Other")}
                  className={`px-3 py-2 text-sm rounded-xl border-2 transition-all ${university === "Other" || (!["جامعة القاهرة", "جامعة عين شمس", "الجامعة الأمريكية", "الجامعة الألمانية", "BUE", "MUST", "MSA"].includes(university) && university !== "") ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30" : "border-gray-100 dark:border-gray-800"}`}
                >
                  {t('other')}
                </button>
              </div>
              {(university === "Other" || (!["جامعة القاهرة", "جامعة عين شمس", "الجامعة الأمريكية", "الجامعة الألمانية", "BUE", "MUST", "MSA"].includes(university) && university !== "")) && (
                <input
                  type="text"
                  placeholder={t('type_university_name')}
                  value={university === "Other" ? "" : university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-4 py-3 mt-3 bg-gray-50 border-2 border-indigo-500 rounded-xl dark:bg-gray-800 focus:outline-none"
                  autoFocus
                />
              )}
            </div>

            <div className="flex justify-between gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('back')}
              </Button>
              <Button onClick={nextStep} variant="gradient" className="flex-1" disabled={!university}>{t('continue')}</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-fadeInRight space-y-6">
            <h2 className="text-2xl font-bold text-center">{t('detailed_profile')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">{t('short_bio')}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[t('final_year'), t('quiet_clean'), t('from_gov'), t('military_need')].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setBio(prev => prev ? `${prev} ${tag}` : tag)}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('describe_yourself')}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:outline-none min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="font-bold">{t('smoking_question')}</span>
                  <button
                    onClick={() => setPreferences({ ...preferences, smoking: !preferences.smoking })}
                    className={`h-6 w-11 rounded-full relative transition-colors ${preferences.smoking ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${preferences.smoking ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="font-bold">{t('pets_question')}</span>
                  <button
                    onClick={() => setPreferences({ ...preferences, pets: !preferences.pets })}
                    className={`h-6 w-11 rounded-full relative transition-colors ${preferences.pets ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${preferences.pets ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">{t('back')}</Button>
              <Button
                onClick={() => (role === 'LANDLORD' || role === 'ADVERTISER') ? setStep(5) : nextStep()}
                variant="gradient"
                className="flex-1"
              >
                {(role === 'LANDLORD' || role === 'ADVERTISER') ? t('next_account_security') : t('next_habits')}
              </Button>
            </div>
          </div>
        );

      case 4:
        const getBudgetCategory = (val: number) => {
          if (val < 4000) return { label: t('economy_student_friendly'), color: "text-emerald-600", bg: "bg-emerald-50" };
          if (val < 8000) return { label: t('standard_most_popular'), color: "text-blue-600", bg: "bg-blue-50" };
          if (val < 15000) return { label: t('premium_high_quality'), color: "text-purple-600", bg: "bg-purple-50" };
          return { label: t('luxury_exclusive'), color: "text-amber-600", bg: "bg-amber-50" };
        };

        const budgetInfo = getBudgetCategory(preferences.budget);

        return (
          <div className="animate-fadeInRight space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{t('lifestyle_budget')}</h2>
              <p className="text-sm text-gray-500">{t('helping_match_roommates')}</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  key: "cleanliness",
                  label: t('daily_tidiness'),
                  desc: t('how_often_clean'),
                  options: [{ v: 2, l: t('relaxed_chill') }, { v: 5, l: t('responsible') }, { v: 9, l: t('obsessive') }]
                },
                {
                  key: "quietHours",
                  label: t('noise_tolerance'),
                  desc: t('preferred_atmosphere'),
                  options: [{ v: 2, l: t('social_active') }, { v: 5, l: t('moderate') }, { v: 9, l: t('zen_silence') }]
                },
                {
                  key: "socializing",
                  label: t('interaction_level'),
                  desc: t('how_much_hangout'),
                  options: [{ v: 2, l: t('independent') }, { v: 5, l: t('friendly') }, { v: 9, l: t('shared_life') }]
                }
              ].map(h => (
                <div key={h.key} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="font-bold text-sm uppercase text-gray-900 dark:text-gray-300">{h.label}</label>
                    <span className="text-[10px] text-gray-400 italic font-medium">{h.desc}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {h.options.map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => setPreferences({ ...preferences, [h.key]: opt.v })}
                        className={`py-3 text-[10px] sm:text-xs rounded-2xl border-2 font-bold transition-all ${preferences[h.key as keyof typeof preferences] === opt.v ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' : 'border-gray-50 dark:border-gray-800 text-gray-400 hover:border-gray-200'}`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <label className="font-bold text-gray-900 dark:text-gray-300">{t('target_monthly_budget')}</label>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${budgetInfo.bg} ${budgetInfo.color}`}>
                    {budgetInfo.label}
                  </div>
                </div>

                <div className="relative mb-2">
                  <input
                    type="range" min="100" max="30000" step="100"
                    value={preferences.budget}
                    onChange={(e) => setPreferences({ ...preferences, budget: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                    <span>100 {t('egp')}</span>
                    <span>15,000 {t('egp')}</span>
                    <span>30,000 {t('egp')}</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                    {preferences.budget.toLocaleString()} <span className="text-sm font-bold opacity-70">{t('egp')}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{t('approx_max_pay')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('back')}
              </Button>
              <Button onClick={nextStep} variant="gradient" className="flex-1">الخطوة النهائية</Button>
            </div>
          </div>
        );

      case 5:
        return (
          <form onSubmit={handleSubmit(onFinalSubmit)} className="animate-fadeInRight space-y-5">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">{t('setup_security')}</h2>
              <p className="text-sm text-gray-500">{t('last_step_dream')}</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <Input
              label={t('full_name')} icon={<User className="h-5 w-5" />}
              placeholder={t('your_full_name')}
              {...register("fullName")}
              error={errors.fullName?.message}
            />

            <Input
              label={t('email')} icon={<Mail className="h-5 w-5" />}
              placeholder="your@email.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label={t('phone_number')} icon={<Phone className="h-5 w-5" />}
              placeholder="+20 1xxx xxxx xxx"
              {...register("phoneNumber")}
              error={errors.phoneNumber?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('password')} type="password" icon={<Lock className="h-5 w-5" />}
                placeholder="••••••"
                {...register("password")}
                error={errors.password?.message}
              />
              <Input
                label={t('confirm')} type="password" icon={<Lock className="h-5 w-5" />}
                placeholder="••••••"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <Button onClick={prevStep} variant="outline" type="button" className="flex-1">{t('edit_profile_btn')}</Button>
              <Button type="submit" variant="gradient" className="flex-1" isLoading={isSubmitting}>
                {t('final_step_btn')}
              </Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gray-50 dark:bg-gray-950">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between px-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`flex-1 h-2 mx-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
          ))}
        </div>

        <div className="glass p-8 md:p-12 rounded-[2rem] shadow-2xl relative">
          <div className="absolute -top-4 left-12 bg-white dark:bg-gray-800 border-2 border-indigo-500 rounded-full px-4 py-1 text-xs font-bold text-indigo-600 shadow-md">
            {t('magic_registration')}
          </div>

          {renderStep()}
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          {t('terms_agreement')} <Link to="/terms" className="underline font-medium">{t('terms')}</Link> {t('and')} <Link to="/privacy" className="underline font-medium">{t('privacy')}</Link>.
        </div>
      </div>
    </div>
  );
};

export default Signup;
