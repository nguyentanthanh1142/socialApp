/**
 * Utility functions for avatar handling with gender-based fallback
 */

// Default avatar URLs based on gender (using placeholder services)
// You can replace these with local images in public/logo/ directory
const DEFAULT_AVATARS = {
  MALE: 'https://i.pravatar.cc/150?img=11', // Male avatar
  FEMALE: 'https://i.pravatar.cc/150?img=44', // Female avatar
  DEFAULT: 'https://i.pravatar.cc/150?img=11', // Default to male if no gender specified
};

/**
 * Get the appropriate avatar URL based on avatarUrl and gender
 * @param {string} avatarUrl - The user's avatar URL
 * @param {string} gender - The user's gender ('MALE', 'FEMALE', 'male', 'female', etc.)
 * @returns {string} The avatar URL to display
 */
export const getAvatarUrl = (avatarUrl, gender) => {
  // If avatarUrl exists and is not empty, use it
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }

  // Determine gender-based fallback
  const normalizedGender = gender?.toLowerCase();

  if (normalizedGender === 'female' || normalizedGender === 'f') {
    return DEFAULT_AVATARS.FEMALE;
  }

  // Default to male for any other case (including male, no gender, or unknown)
  return DEFAULT_AVATARS.MALE;
};

/**
 * Get the appropriate avatar URL for a user object
 * @param {Object} user - User object containing avatarUrl/avatar and gender
 * @returns {string} The avatar URL to display
 */
export const getUserAvatarUrl = (user) => {
  const avatarUrl = user?.avatarUrl || user?.avatar || '';
  const gender = user?.gender || '';
  return getAvatarUrl(avatarUrl, gender);
};
