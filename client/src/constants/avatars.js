export const DEFAULT_AVATAR_ID = 'avatar-01';

export const DEVATLAS_AVATARS = [
  { id: 'avatar-01', label: 'Backend Specialist', role: 'Backend Engineer', path: '/avatars/avatar-01.svg' },
  { id: 'avatar-02', label: 'Frontend Architect', role: 'UI/UX & Frontend', path: '/avatars/avatar-02.svg' },
  { id: 'avatar-03', label: 'DevOps Lead', role: 'DevOps & SRE', path: '/avatars/avatar-03.svg' },
  { id: 'avatar-04', label: 'Database Architect', role: 'Database Engineer', path: '/avatars/avatar-04.svg' },
  { id: 'avatar-05', label: 'Fullstack Ninja', role: 'Fullstack Developer', path: '/avatars/avatar-05.svg' },
  { id: 'avatar-06', label: 'AI/ML Researcher', role: 'AI & Data Science', path: '/avatars/avatar-06.svg' },
  { id: 'avatar-07', label: 'Security Lead', role: 'AppSec & Security', path: '/avatars/avatar-07.svg' },
  { id: 'avatar-08', label: 'Cloud Architect', role: 'Cloud Infrastructure', path: '/avatars/avatar-08.svg' },
  { id: 'avatar-09', label: 'Systems Developer', role: 'Systems & Kernel', path: '/avatars/avatar-09.svg' },
  { id: 'avatar-10', label: 'UI/UX Engineer', role: 'Product Design', path: '/avatars/avatar-10.svg' },
];

export const ALLOWED_AVATAR_IDS = DEVATLAS_AVATARS.map((a) => a.id);

/**
 * Resolves an avatar ID or legacy string to a safe, valid DevAtlas SVG avatar URL.
 * Never renders an arbitrary user-supplied script or broken URL.
 */
export const resolveAvatarUrl = (avatarId) => {
  if (!avatarId) return DEVATLAS_AVATARS[0].path;

  if (ALLOWED_AVATAR_IDS.includes(avatarId)) {
    return `/avatars/${avatarId}.svg`;
  }

  if (typeof avatarId === 'string' && avatarId.startsWith('/avatars/')) {
    return avatarId;
  }

  if (typeof avatarId === 'string' && (avatarId.startsWith('http://') || avatarId.startsWith('https://'))) {
    return avatarId;
  }

  return DEVATLAS_AVATARS[0].path;
};
