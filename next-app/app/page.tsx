'use client';

import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useRouter } from 'next/navigation';
import { apiFetch, errorHandling } from '@/lib/apiFetch';
import { getApiUrl } from '@/lib/apiFetch';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');
        if (errorParam) {
          return errorDescription || errorParam;
        }
      }
    }
    return '';
  });
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('user_session')) {
        router.push('/memos');
        return;
      }
      const sessionData = Object.fromEntries(
        new URLSearchParams(window.location.hash.substring(1))
      );
      const accessToken = sessionData?.access_token;
      if (!accessToken) return;
      const userData = await apiFetch('/api/auth/user', {}, accessToken);
      if (userData.email) sessionData.user = userData;
      localStorage.setItem('user_session', JSON.stringify(sessionData));
      router.push('/memos');
    })();
  }, [router]);

  const login = async () => {
    await errorHandling(async () => {
      const json = await apiFetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!json.access_token || !json.refresh_token) {
        throw new Error('トークンが取得できませんでした.');
      }
      localStorage.setItem('user_session', JSON.stringify(json));
      router.push('/memos');
    }, setError);
  };

  const register = async () => {
    await errorHandling(async () => {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSuccessMessage(
        '登録リクエストを送信しました。Supabaseから確認メールをご確認ください。'
      );
    }, setError);
  };

  const loginGithub = () => {
    window.location.href = getApiUrl('/api/auth/oauth2/github');
  };

  return (
    <div className="w-full flex items-center justify-center mt-24 px-4">
      <Card
        className="w-full max-w-md"
        variant="outlined"
        sx={{
          borderRadius: 4,
          p: 1,
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          transition: '0.2s',
          '&:hover': { boxShadow: '0 12px 35px rgba(0,0,0,0.12)' },
        }}
      >
        <CardContent sx={{ px: 4, py: 5 }}>
          <Typography
            variant="h5"
            sx={{ mb: 3 }}
            className="text-center font-semibold"
          >
            ログイン / 新規登録
          </Typography>

          <TextField
            label="メールアドレス"
            fullWidth
            type="email"
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="パスワード"
            fullWidth
            type="password"
            sx={{ mb: 3 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              mb: 2,
              bgcolor: '#1976d2',
              py: 1.4,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#135ba1' },
            }}
            onClick={login}
          >
            ログイン
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{
              mb: 3,
              py: 1.4,
              borderRadius: 2,
              textTransform: 'none',
            }}
            onClick={register}
          >
            新規登録
          </Button>

          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#000',
              color: 'white',
              py: 1.4,
              borderRadius: 2,
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: 'center',
              '&:hover': { bgcolor: '#222' },
            }}
            onClick={loginGithub}
          >
            <GitHubIcon />
            GitHub ログイン
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
