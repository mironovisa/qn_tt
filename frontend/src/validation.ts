import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const validateEmail = (email: string): string | null => {
  const sanitized = sanitizeInput(email);
  
  if (!sanitized) {
    return 'Email is required';
  }
  
  if (sanitized.length > 254) {
    return 'Email is too long';
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  
  if (password.length > 128) {
    return 'Password is too long';
  }
  
  if (!/[A-Za-z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
};

export const validatePasswordConfirm = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};