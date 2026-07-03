export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  PROFILE: (username) => `/profile/${username}`,
  SETTINGS: '/settings',
  EDIT_PROFILE: '/settings/edit-profile',
  CHANGE_PASSWORD: '/settings/change-password',
  ACCOUNT: '/settings/account',
  PRIVACY: '/settings/privacy',
  POST_DETAILS: (postId) => `/posts/${postId}`
};
