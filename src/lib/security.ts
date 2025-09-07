// Security utilities for admin system
import { toast } from "sonner";

// Input sanitization
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, (match) => match === '<' ? '&lt;' : '&gt;'); // Escape HTML
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 1;
    feedback.push('Avoid common patterns');
  }

  return {
    isValid: score >= 4,
    score: Math.max(0, score),
    feedback
  };
}

// Session management
export class SessionManager {
  private static readonly SESSION_KEY = 'admin_session';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  static createSession(user: any): void {
    const session = {
      user,
      timestamp: Date.now(),
      expires: Date.now() + this.SESSION_TIMEOUT
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  static getSession(): any | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expires) {
        this.clearSession();
        toast.error('Session expired. Please log in again.');
        return null;
      }

      // Extend session if user is active
      if (Date.now() - session.timestamp < this.SESSION_TIMEOUT / 2) {
        session.expires = Date.now() + this.SESSION_TIMEOUT;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }

      return session.user;
    } catch (error) {
      console.error('Error reading session:', error);
      this.clearSession();
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static isSessionValid(): boolean {
    return this.getSession() !== null;
  }
}

// CSRF protection (simple token-based)
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';

  static generateToken(): string {
    const token = crypto.randomUUID();
    sessionStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }

  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken === token;
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}

// Content Security Policy helpers
export function validateImageUrl(url: string): boolean {
  if (!url) return true; // Empty URL is valid
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS URLs
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    // Check for common image domains (you can extend this list)
    const allowedDomains = [
      'images.unsplash.com',
      'cdn.pixabay.com',
      'images.pexels.com',
      'i.imgur.com',
      'github.com',
      'githubusercontent.com',
      'cloudinary.com',
      'amazonaws.com'
    ];
    
    const isAllowedDomain = allowedDomains.some(domain => 
      parsedUrl.hostname.includes(domain)
    );
    
    if (!isAllowedDomain) {
      console.warn('Image URL from untrusted domain:', parsedUrl.hostname);
    }
    
    return true; // Allow but warn
  } catch (error) {
    return false;
  }
}

// Rate limiting for API calls
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();
  
  static isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  static reset(key: string): void {
    this.requests.delete(key);
  }
}

// Audit logging
export class AuditLogger {
  private static readonly LOG_KEY = 'admin_audit_log';
  private static readonly MAX_LOGS = 100;

  static log(action: string, details?: any): void {
    try {
      const logs = this.getLogs();
      const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        details,
        userAgent: navigator.userAgent,
        ip: 'client-side' // In a real app, this would come from server
      };

      logs.unshift(logEntry);
      
      // Keep only the latest logs
      if (logs.length > this.MAX_LOGS) {
        logs.splice(this.MAX_LOGS);
      }

      localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  static getLogs(): any[] {
    try {
      const logs = localStorage.getItem(this.LOG_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to read audit logs:', error);
      return [];
    }
  }

  static clearLogs(): void {
    localStorage.removeItem(this.LOG_KEY);
  }
}

// Security headers check (for development)
export function checkSecurityHeaders(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Security Check:');
    console.log('- HTTPS:', window.location.protocol === 'https:');
    console.log('- Secure Context:', window.isSecureContext);
    
    // Check if running in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('⚠️ Running in development mode - some security features may be limited');
    }
  }
}