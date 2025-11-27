export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  let score = 0;

  // Length requirement (minimum 8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 25;
  }

  // Uppercase letter requirement
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 25;
  }

  // Number requirement
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 25;
  }

  // Symbol requirement
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one symbol (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  } else {
    score += 25;
  }

  // Bonus points for longer passwords
  if (password.length >= 12) {
    score += 10;
  }
  if (password.length >= 16) {
    score += 10;
  }

  // Bonus for lowercase letters (already expected)
  if (/[a-z]/.test(password)) {
    score += 5;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 100)
  };
};

export const getPasswordStrengthLabel = (score: number): { label: string; color: string } => {
  if (score < 25) {
    return { label: 'Very Weak', color: 'text-red-500' };
  } else if (score < 50) {
    return { label: 'Weak', color: 'text-orange-500' };
  } else if (score < 75) {
    return { label: 'Good', color: 'text-yellow-500' };
  } else if (score < 90) {
    return { label: 'Strong', color: 'text-green-500' };
  } else {
    return { label: 'Very Strong', color: 'text-green-600' };
  }
};

export const getPasswordStrengthBarColor = (score: number): string => {
  if (score < 25) {
    return 'bg-red-500';
  } else if (score < 50) {
    return 'bg-orange-500';
  } else if (score < 75) {
    return 'bg-yellow-500';
  } else if (score < 90) {
    return 'bg-green-500';
  } else {
    return 'bg-green-600';
  }
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (basic)
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Should be between 7 and 15 digits (international standard)
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}; 