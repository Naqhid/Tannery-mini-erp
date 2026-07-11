export function validateGSTIN(gstin: string): string | null {
  if (!gstin) return null;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(gstin.toUpperCase())) {
    return 'Invalid GSTIN format. Expected: 2 digits + 5 letters + 4 digits + 2 alphanumeric + Z + 1 alphanumeric';
  }
  return null;
};

export function validatePAN(pan: string): string | null {
  if (!pan) return null;
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!regex.test(pan.toUpperCase())) {
    return 'Invalid PAN format. Expected: 5 letters + 4 digits + 1 letter';
  }
  return null;
};

export function validateEmail(email: string): string | null {
  if (!email) return null;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export function validatePhone(phone: string): string | null {
  if (!phone) return null;
  const regex = /^[+]?[\d\s\-()]{7,15}$/;
  if (!regex.test(phone)) {
    return 'Invalid phone number format';
  }
  return null;
};

export function validateRequired(value: any, label: string): string | null {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return `${label} is required`;
  }
  return null;
};

export function validateField(field: { key: string; label: string; required?: boolean; validate?: 'gstin' | 'pan' | 'email' | 'phone' }, value: any): string | null {
  if (field.required) {
    const err = validateRequired(value, field.label);
    if (err) return err;
  }
  if (field.validate && value) {
    switch (field.validate) {
      case 'gstin': return validateGSTIN(value);
      case 'pan': return validatePAN(value);
      case 'email': return validateEmail(value);
      case 'phone': return validatePhone(value);
    }
  }
  return null;
};
