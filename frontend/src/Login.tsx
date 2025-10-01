import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from './useAuth';
import { loginSchema, registerSchema } from './schemas';
import type { LoginFormData, RegisterFormData } from './schemas';
import { sanitizeInput } from './validation';
import { PageTitle } from './PageTitle';

interface LoginProps {
  onToggleMode: () => void;
  isRegister: boolean;
}

type FormData = LoginFormData & Partial<Pick<RegisterFormData, 'confirmPassword'>>;

export const Login = ({ onToggleMode, isRegister }: LoginProps) => {
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    if (loading) return;
    
    setApiError('');
    setLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(data.email);
      const sanitizedPassword = data.password;

      if (isRegister) {
        await registerUser(sanitizedEmail, sanitizedPassword);
      } else {
        await login(sanitizedEmail, sanitizedPassword, rememberMe);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Authentication failed';
      setApiError(typeof message === 'string' ? sanitizeInput(message) : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    reset();
    setApiError('');
    onToggleMode();
  };

  return (
    <div className="container">
      <PageTitle 
        title={isRegister ? 'Create Account' : 'Sign In'} 
        description={isRegister ? 'Create your QuickNotes account to start organizing your thoughts' : 'Sign in to your QuickNotes account'}
      />
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className="form-title">
          {isRegister ? 'Create Account' : 'Sign In'}
        </h1>
        
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'error-input' : ''}`}
            {...register('email')}
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <div id="email-error" className="field-error" role="alert">
              {errors.email.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className={`form-input ${errors.password ? 'error-input' : ''}`}
            {...register('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <div id="password-error" className="field-error" role="alert">
              {errors.password.message}
            </div>
          )}
        </div>

        {isRegister && (
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error-input' : ''}`}
              {...register('confirmPassword')}
              autoComplete="new-password"
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            />
            {errors.confirmPassword && (
              <div id="confirm-password-error" className="field-error" role="alert">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
        )}

        {!isRegister && (
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-input"
              />
              Remember me
            </label>
          </div>
        )}

        {apiError && (
          <div className="error" role="alert">
            {apiError}
          </div>
        )}

        <button
          type="submit"
          className="form-button"
          disabled={loading || !isValid}
          aria-describedby={loading ? 'loading-text' : undefined}
        >
          {loading ? (
            <span id="loading-text">Please wait...</span>
          ) : (
            isRegister ? 'Create Account' : 'Sign In'
          )}
        </button>

        <div className="form-link">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={handleToggleMode}
                disabled={loading}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={handleToggleMode}
                disabled={loading}
              >
                Create one
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};