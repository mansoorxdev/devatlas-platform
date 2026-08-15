export const DEFAULT_AVATAR_ID = 'avatar-01';

export const ALLOWED_AVATAR_IDS = [
  'avatar-01',
  'avatar-02',
  'avatar-03',
  'avatar-04',
  'avatar-05',
  'avatar-06',
  'avatar-07',
  'avatar-08',
  'avatar-09',
  'avatar-10',
];

/**
 * Server-side helper to resolve avatar ID to public URL path or fallback.
 */
export const resolveAvatarPath = (avatarId) => {
  if (!avatarId) return `/avatars/${DEFAULT_AVATAR_ID}.svg`;
  if (ALLOWED_AVATAR_IDS.includes(avatarId)) {
    return `/avatars/${avatarId}.svg`;
  }
  if (typeof avatarId === 'string' && (avatarId.startsWith('/avatars/') || avatarId.startsWith('http://') || avatarId.startsWith('https://'))) {
    return avatarId;
  }
  return `/avatars/${DEFAULT_AVATAR_ID}.svg`;
};
