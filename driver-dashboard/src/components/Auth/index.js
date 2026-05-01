/**
 * Public API for the Auth module.
 *
 * Consumers import from here — never from internal subfolders directly.
 *
 * @example
 *   import DriveGuardAuth from './components/Auth';
 *   import { validateSignIn } from './components/Auth';
 */

export { default }            from "./DriveGuardAI_Auth";
export { validateSignIn, validateSignUp } from "./validation/auth.validation";
export { useAuthForm }        from "./hooks/useAuthForm";
export { PhoneInput }         from "./components/PhoneInput";
export { GoogleButton }       from "./components/GoogleButton";
export { PasswordField }      from "./components/PasswordField";
export { OverlayContent }     from "./components/OverlayContent";
export { SignInForm }         from "./forms/SignInForm";
export { SignUpForm }         from "./forms/SignUpForm";
