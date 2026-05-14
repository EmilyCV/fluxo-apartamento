/**
 * Dispara feedback háptico em dispositivos que suportam.
 * Silencioso em browsers que não suportam (desktop, etc).
 */
export function hapticFeedback(type: 'success' | 'light' | 'medium' = 'success') {
  if (typeof window === 'undefined') return;
  
  // API de Vibration (Android Chrome, Firefox)
  if ('vibrate' in navigator) {
    const patterns = {
      light: [30],
      medium: [50],
      success: [40, 30, 40],
    };
    navigator.vibrate(patterns[type]);
  }
}
