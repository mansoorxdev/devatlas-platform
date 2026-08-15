import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import userService from '../services/userService';
import { DEVATLAS_AVATARS, resolveAvatarUrl } from '../constants/avatars';
import {
  User,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Globe,
  Sparkles,
  Award,
  Tag,
  X,
  Plus,
  ShieldCheck,
  Smile,
} from 'lucide-react';

export function WriterProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: 'avatar-01',
    expertise: [],
    socialLinks: {
      github: '',
      twitter: '',
      website: '',
    },
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getProfile();
      if (res.success && res.data.user) {
        const user = res.data.user;
        setFormData({
          name: user.name || '',
          bio: user.bio || '',
          avatar: user.avatar || 'avatar-01',
          expertise: user.expertise || [],
          socialLinks: {
            github: user.socialLinks?.github || '',
            twitter: user.socialLinks?.twitter || '',
            website: user.socialLinks?.website || '',
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load profile details.');
    } finally {
      setIsLoading(false);
    }
  };

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
    setIsSaving(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await userService.updateProfile(formData);
      if (res.success) {
        setSuccessNotice('Profile updated successfully!');
        setTimeout(() => setSuccessNotice(null), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-4xl text-center py-20">
          <RefreshCw size={32} className="mx-auto text-brand-500 animate-spin mb-4" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading writer profile...</p>
        </Container>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Writer Profile & DevAtlas Avatars | Writer Portal</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-5xl">
          {/* Header */}
          <div className="pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold mb-2">
              <User size={14} />
              <span>Public Author Identity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Writer Profile & Avatars</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Customize your developer profile, choose your official DevAtlas avatar, and manage your public author byline.
            </p>
          </div>

          {/* Success / Error Banners */}
          {successNotice && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl mb-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successNotice}</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl mb-6 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              {/* DevAtlas Predefined Avatar Grid Picker */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm uppercase tracking-wider">
                    <Smile size={16} className="text-brand-500" />
                    <span>Official DevAtlas Avatars</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">100% Free & Pre-Approved</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Select one of DevAtlas's official developer avatars for your public author profile and article bylines.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {DEVATLAS_AVATARS.map((avatarItem) => {
                    const isSelected = formData.avatar === avatarItem.id;
                    return (
                      <div
                        key={avatarItem.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => setFormData({ ...formData, avatar: avatarItem.id })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setFormData({ ...formData, avatar: avatarItem.id });
                          }
                        }}
                        className={`group relative p-2.5 rounded-2xl border-2 transition-all cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
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

                        <img
                          src={avatarItem.path}
                          alt={avatarItem.label}
                          className="w-12 h-12 mx-auto rounded-full object-cover mb-2 transition-transform group-hover:scale-105"
                        />
                        <div className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {avatarItem.label}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium line-clamp-1">{avatarItem.role}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Profile Info */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User size={16} className="text-brand-500" />
                  <span>General Information</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Author Bio (Max 500 Chars)
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formData.bio.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    placeholder="Share a concise technical summary of your background, experience, and topics you write about..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
                  />
                </div>
              </div>

              {/* Technical Expertise */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award size={16} className="text-brand-500" />
                  <span>Technical Expertise Tags</span>
                </h3>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Node.js, Distributed Systems, Redis"
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

              {/* Social Links */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Globe size={16} className="text-brand-500" />
                  <span>Public Social Profiles</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={formData.socialLinks.github}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, github: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Website / Portfolio URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourwebsite.dev"
                      value={formData.socialLinks.website}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, website: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isSaving ? 'Saving Profile...' : 'Save Profile & Avatar Selection'}</span>
              </button>
            </form>

            {/* Live Byline Preview Column */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Public Byline Live Preview</span>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveAvatarUrl(formData.avatar)}
                      alt={formData.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formData.name || 'Writer Name'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Technical Contributor</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {formData.bio || 'Author bio preview will appear here when added.'}
                  </p>

                  {formData.expertise?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      {formData.expertise.map((exp) => (
                        <span
                          key={exp}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default WriterProfilePage;
