import { UserSession } from '@/types/saas';

export const SESSION_COOKIE_NAME = 'vice_session';

/**
 * Safely encodes session object to base64 JSON string
 */
export function encodeSession(session: UserSession): string {
  try {
    const jsonStr = JSON.stringify(session);
    return Buffer.from(jsonStr, 'utf-8').toString('base64');
  } catch (error) {
    console.error('Failed to encode session:', error);
    return '';
  }
}

/**
 * Safely decodes session from base64 JSON string
 */
export function decodeSession(cookieValue?: string | null): UserSession | null {
  if (!cookieValue) return null;
  try {
    const jsonStr = Buffer.from(cookieValue, 'base64').toString('utf-8');
    const session = JSON.parse(jsonStr) as UserSession;

    // Validate structure
    if (!session?.user?.id) return null;

    // Dynamically check if subscription has expired
    if (session.subscription) {
      const expiresAt = new Date(session.subscription.current_period_end).getTime();
      const isActiveStatus =
        session.subscription.status === 'active' || session.subscription.status === 'trialing';
      session.hasAccess = isActiveStatus && expiresAt > Date.now();
    } else {
      session.hasAccess = false;
    }

    return session;
  } catch (error) {
    return null;
  }
}
