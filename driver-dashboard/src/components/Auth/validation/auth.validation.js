const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^.{8,}$/;

/**
 * Validates the sign-in form.
 * @param {{ email: string, password: string }} form
 * @returns {Record<string, string>} field-keyed error messages
 */
export const validateSignIn = (form) => {
  const errors = {};

  if (!form.email.trim())
    errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(form.email))
    errors.email = "Please enter a valid email address.";

  if (!form.password)
    errors.password = "Please enter your password.";

  return errors;
};

/**
 * Validates the sign-up form.
 * @param {typeof import('../constants/auth.constants').INITIAL_FORM} form
 * @returns {Record<string, string>} field-keyed error messages
 */
export const validateSignUp = (form) => {
  const errors = {};

  if (!form.firstName.trim())
    errors.firstName = "Please enter your first name.";

  if (!form.lastName.trim())
    errors.lastName = "Please enter your last name.";

  if (!form.email.trim())
    errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(form.email))
    errors.email = "Please enter a valid email address.";

  if (!form.phone || form.phone.replace(/\D/g, "").length < 7)
    errors.phone = "Please enter a valid phone number.";

  if (!form.password)
    errors.password = "Please enter a password.";
  else if (!PASSWORD_RE.test(form.password))
    errors.password = "Password must be at least 8 characters.";

  if (!form.confirmPassword)
    errors.confirmPassword = "Please confirm your password.";
  else if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  return errors;
};
