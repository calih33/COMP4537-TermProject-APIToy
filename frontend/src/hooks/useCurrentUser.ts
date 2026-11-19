// This file was created with help from Claude code.

import { useOutletContext } from 'react-router';
import type { CurrentUser } from '../api/ApiClient';

export interface CurrentUserContext {
  user: CurrentUser;
  refreshUser: () => Promise<void>;
}

export function useCurrentUser() {
  return useOutletContext<CurrentUserContext>();
}
