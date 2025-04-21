/**
 * token 操作封装
 */
import { tokenKey } from '@/configs'

/**
 * 获取缓存的 token
 */
export function getToken() {
  const token = localStorage.getItem(tokenKey);
  if (!token) {
    return sessionStorage.getItem(tokenKey);
  }
  return token;
}

/**
 * 缓存 token
 * @param token token
 * @param remember 是否永久存储
 */
export function setToken(token, remember = true) {
  removeToken();
  if (token) {
    const tokenValue = `${token}`;
    if (remember) {
      localStorage.setItem(tokenKey, tokenValue);
    } else {
      sessionStorage.setItem(tokenKey, tokenValue);
    }
  }
}

/**
 * 移除 token
 */
export function removeToken() {
  localStorage.removeItem(tokenKey);
  sessionStorage.removeItem(tokenKey);
}
