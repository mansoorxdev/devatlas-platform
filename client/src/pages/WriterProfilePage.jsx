import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import userService from '../services/userService';
import useAuthStore from '../features/auth/store/useAuthStore';
import {
  User,
  Image as ImageIcon,
  Globe,
  Tag,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

const GithubIcon = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export function WriterProfilePage() {
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    expertise: [],
    socialLinks: {
      github: '',
      twitter: '',
      website: '',
    },
  });

  const [newTagInput, setNewTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getProfile();
      const userData = response.data.user;
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        expertise: userData.expertise || [],
        socialLinks: {
          github: userData.socialLinks?.github || '',
          twitter: userData.socialLinks?.twitter || '',
          website: userData.socialLinks?.website || '',
        },
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpertise = (e) => {
    if (e) e.preventDefault();
    const tag = newTagInput.trim();
    if (!tag) return;
    if (formData.expertise.includes(tag)) {
      setNewTagInput('');
      return;
    }
    if (formData.expertise.length >= 10) {
      setError('Maximum 10 areas of expertise allowed.');
      return;
    }
    setFormData({
      ...formData,
      expertise: [...formData.expertise, tag],
    });
    setNewTagInput('');
  };

  const handleRemoveExpertise = (tagToRemove) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((t) => t !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setIsSaving(true);

    try {
      await userService.updateProfile(formData);
      setSuccessMessage('Profile updated successfully! Public bylines will now display your updated information.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 flex justify-center">
        <RefreshCw size={24} className="animate-spin text-brand-500 mt-20" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Writer Profile — DevAtlas</title>
        <meta name="description" content="Manage your DevAtlas technical writer bio, avatar, expertise, and public author byline information." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12">
        <Container className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Writer Profile & Author Byline</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customize how your author profile and technical credentials appear on your published articles.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2.5 shadow-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Basic Information
                </h2>

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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Areas of Expertise
                </h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems, React, Docker"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExpertise();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-medium"
                    >
                      <Tag size={12} />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(tag)}
                        className="hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {formData.expertise.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No expertise areas added yet.</span>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Social & Web Links
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    GitHub URL
                  </label>
                  <div className="relative">
                    <GithubIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Twitter / X URL
                  </label>
                  <div className="relative">
                    <TwitterIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://twitter.com/username"
                      value={formData.socialLinks.twitter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Personal Website / Portfolio URL
                  </label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://yourwebsite.io"
                      value={formData.socialLinks.website}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, website: e.target.value },
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
                <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
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
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt={formData.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 font-extrabold text-sm flex items-center justify-center border border-brand-500/20">
                        {formData.name.charAt(0).toUpperCase() || 'W'}
                      </div>
                    )}
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

                  {formData.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.expertise.map((exp) => (
                        <span
                          key={exp}
                          className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}

                  {(formData.socialLinks.github || formData.socialLinks.twitter || formData.socialLinks.website) && (
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400">
                      {formData.socialLinks.github && (
                        <a
                          href={formData.socialLinks.github}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                          <GithubIcon size={14} />
                        </a>
                      )}
                      {formData.socialLinks.twitter && (
                        <a
                          href={formData.socialLinks.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-sky-500 transition-colors"
                        >
                          <TwitterIcon size={14} />
                        </a>
                      )}
                      {formData.socialLinks.website && (
                        <a
                          href={formData.socialLinks.website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-brand-500 transition-colors"
                        >
                          <Globe size={14} />
                        </a>
                      )}
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
