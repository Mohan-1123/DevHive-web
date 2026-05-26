import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../utils/userSlice';
import axios from 'axios';
import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const GoogleAuthButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        const response = await axios.post(
          BASE_URL + '/api/auth/google',
          { code: tokenResponse.code },
          { withCredentials: true }
        );
        const userPayload = response.data?.user ?? response.data?.data ?? response.data;
        dispatch(addUser(userPayload));
        navigate('/discover');
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
    },
  });

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="alert alert-error py-2 text-sm rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => login()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-base-content/20 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-medium text-sm transition-all duration-150 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-gray-600">Signing in...</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleAuthButton;
