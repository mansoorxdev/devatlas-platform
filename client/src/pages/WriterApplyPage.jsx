import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import userService from '../services/userService';
import { DEVATLAS_AVATARS, resolveAvatarUrl } from '../constants/avatars';
import { APP_PATHS } from '../constants';
import {
  UserCheck,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Smile,
  Award,
  Plus,
  X,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export function WriterApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    avatar: 'avatar-01',
    expertise: [],
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submittedUser, setSubmittedUser] = useState(null);

  const handleAddExpertise = (e) => {
    if (e) e.preventDefault();
    const tag = expertiseInput.trim();
    if (!tag) return;
    if (formData.expertise.includes(tag)) {
      setExpertiseInput('');
      return;
    }
    if (formData.expertise.length >= 10) {
      alert('You can add up to 10 areas of expertise.');
      return;
    }
    setFormData({
      ...formData,
      expertise: [...formData.expertise, tag],
    });
    setExpertiseInput('');
  };

  const handleRemoveExpertise = (tagToRemove) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await userService.applyWriter(formData);
      if (res.success) {
        setSubmittedUser(res.data.user || { name: formData.name, email: formData.email });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit writer application. Please check your entries.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedUser) {
    return (
      <>
        <Helmet>
        <title>Apply to Become a DevAtlas Writer — Contributor Onboarding</title>
        <meta name="description" content="Apply to become an authorized DevAtlas technical writer. Submit your profile, bio, and expertise for editorial review." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16">
          <Container className="max-w-2xl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Application Submitted!</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Thank you for applying to become a technical contributor on DevAtlas,{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submittedUser.name}</span>.
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Clock size={14} />
                  <span>Pending Administrator Editorial Review</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Your writer account has been created with status <strong className="uppercase font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900">PENDING</strong>. An administrator will review your application details shortly. Once approved, your account will be activated and you will be able to log in to the Writer Portal.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={APP_PATHS.WRITER_LOGIN}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center justify-center gap-2"
                >
                  <span>Go to Writer Login</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to={APP_PATHS.HOME}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center"
                >
                  Return to Home Page
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Apply as Writer & Technical Contributor | DevAtlas</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-4xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold">
              <UserCheck size={14} />
              <span>DevAtlas Contributor Onboarding</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Apply to Become a Writer</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Share your technical expertise with thousands of developers worldwide. Submit your contributor application for admin review.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl mb-8 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2 max-w-2xl mx-auto">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Credentials */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileText size={16} className="text-brand-500" />
                <span>1. Applicant Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Account Password (Min 8 Characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Smile size={16} className="text-brand-500" />
                  <span>2. Choose Your Official DevAtlas Avatar</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Pre-Approved Vectors</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an avatar that represents your primary engineering specialization.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {DEVATLAS_AVATARS.map((item) => {
                  const isSelected = formData.avatar === item.id;
                  return (
                    <div
                      key={item.id}
                      tabIndex={0}
                      role="button"
                      onClick={() => setFormData({ ...formData, avatar: item.id })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setFormData({ ...formData, avatar: item.id });
                        }
                      }}
                      className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
                        isSelected
                          ? 'bg-brand-50/50 dark:bg-brand-950/40 border-brand-500 shadow-md shadow-brand-500/10'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white rounded-full flex items-center justify-center">
                          <CheckCircle2 size={11} />
                        </div>
                      )}
                      <img src={item.path} alt={item.label} className="w-12 h-12 mx-auto rounded-full object-cover mb-2" />
                      <div className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1">{item.label}</div>
                      <div className="text-[9px] text-slate-400 font-medium line-clamp-1">{item.role}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bio & Technical Expertise */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Award size={16} className="text-brand-500" />
                <span>3. Bio & Technical Experience</span>
              </h3>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Author Bio / Technical Background
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">{formData.bio.length}/500</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="Describe your engineering background, open source contributions, and the topics you plan to write about..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Technical Expertise Tags
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems, Kubernetes, Go"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddExpertise(e)}
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(tag)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Editorial Review Notice */}
            <div className="p-4 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
              <ShieldAlert size={18} className="text-brand-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Editorial Policy Notice:</strong> All contributor applications undergo manual administrator review to ensure editorial quality. Your account will remain in <code className="text-brand-500 font-bold">pending</code> status until reviewed.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-500/25 transition-all cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{isSubmitting ? 'Submitting Application...' : 'Submit Writer Application for Review'}</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Already an approved DevAtlas Writer? </span>
              <Link to={APP_PATHS.WRITER_PORTAL_LOGIN} className="text-xs font-bold text-brand-600 hover:underline">
                Sign in to Writer Portal
              </Link>
            </div>
          </form>
        </Container>
      </div>
    </>
  );
}

export default WriterApplyPage;
