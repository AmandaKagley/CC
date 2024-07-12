// validation.js

// Validation functions
export const validateSignup = (username, email, password, confirmPassword) => {
  const errors = {};

  // Check email domain
  const emailDomain = "@my.stchas.edu";
  if (!email.endsWith(emailDomain)) {
    errors.email = `Email must end with ${emailDomain}`;
  }

  // Other validations
  if (!username) errors.username = 'Username is required';
  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords must match';

  return errors;
};

export const validateLogin = (username, password) => {
  const errors = {};
  if (!username) errors.username = 'Username is required';
  if (!password) errors.password = 'Password is required';
  return errors;
};

// Auth utilities
export const setUserAuth = (userId) => {
  localStorage.setItem('userId', userId);
};

export const getUserAuth = () => {
  return localStorage.getItem('userId');
};

export const removeUserAuth = () => {
  localStorage.removeItem('userId');
};

export const isAuthenticated = () => {
  return !!getUserAuth();
};