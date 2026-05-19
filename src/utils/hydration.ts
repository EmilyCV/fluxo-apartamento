'use client';

// Variável global para persistir o estado de hidratação entre navegações SPA
let isHydrated = false;

export function getIsHydrated() {
  return isHydrated;
}

export function setIsHydrated() {
  isHydrated = true;
}
