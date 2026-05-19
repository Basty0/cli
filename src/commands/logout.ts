import { clearConfig } from '../config/store.js';

export function logoutCommand(): void {
  clearConfig();
}
