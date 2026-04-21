import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TokenService {
  private readonly key = 'auth_token';
  private readonly userID = 'user_id'


  set(token: string, customKey?: string) {
    if (!customKey) return localStorage.setItem(this.key, token);

    localStorage.setItem(customKey, token);
  }

  get(customKey?: string): string | null {
    if (!customKey) return localStorage.getItem(this.key);

    return localStorage.getItem(customKey);
  }

  remove() {
    localStorage.removeItem(this.key);
    localStorage.removeItem(this.userID);
  }

  isLogged(): boolean {
    return !!this.get();
  }
}
