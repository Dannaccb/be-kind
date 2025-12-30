/**
 * Validation utilities for forms
 */

export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const validators = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'Este campo es requerido';
    }
    return true;
  },

  email: (value: string) => {
    if (!value) return true; // Let required handle empty values
    if (!emailRegex.test(value)) {
      return 'Correo electrónico inválido';
    }
    return true;
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return true;
    if (value.length < min) {
      return `Debe tener al menos ${min} caracteres`;
    }
    return true;
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return true;
    if (value.length > max) {
      return `No puede exceder ${max} caracteres`;
    }
    return true;
  },

  hexColor: (value: string) => {
    if (!value) return true;
    if (!hexColorRegex.test(value)) {
      return 'Formato HEX inválido (ej: #FF5733)';
    }
    return true;
  },
};

