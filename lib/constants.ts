export const MAX_TODO_LENGTH = 200;

export const FILTERS = ["all", "active", "completed"] as const;

export const OAUTH_PROVIDERS = ["google", "kakao"] as const;

export type OAuthProviderName = (typeof OAUTH_PROVIDERS)[number];
