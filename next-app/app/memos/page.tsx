'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  IconButton,
  Divider,
  Snackbar,
  Alert,  
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiAuthFetch, errorHandling  } from '@/lib/apiFetch';

type Memo = {
  id: number;
  user_id: string;
  title: string;
  content?: string;
  createdAt: string;
};

export default function MemosPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const router = useRouter();

  const loadMemos = async () => {
    await errorHandling(async () => {
      const json = await apiAuthFetch('/api/memos');
      setMemos(json);
    }, setError);
  };

  useEffect(() => {
    (async () => {
      await loadMemos();
    })();
  }, []);

  async function createMemo() {
    await errorHandling(async () => {
      await apiAuthFetch('/api/memos', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      await loadMemos();
    }, setError);
  }

  async function deleteMemo(id: number) {
    await errorHandling(async () => {
      await apiAuthFetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });
      await loadMemos();
    }, setError);
  }

  function startEdit(memo: Memo) {
    setEditingId(memo.id);
    setEditTitle(memo.title);
    setEditContent(memo.content || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  }

  async function updateMemo(id: number) {
  }

    async function logout() {
    setError('');
    try {
      await apiAuthFetch(`/api/auth/logout`, {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('user_session');
      router.push('/');
    }
  }

  return (
    <div className="max-w-2xl w-full px-4 py-10">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4" className="font-bold">
          メモ一覧
        </Typography>
        <Button variant="outlined" color="inherit" onClick={logout}>
          ログアウト
        </Button>
      </div>

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

      <Card className="mb-6 shadow-md" variant="outlined">
        <CardContent>
          <Typography variant="h6" className="font-semibold">
            メモ追加
          </Typography>

          <TextField
            label="タイトル"
            fullWidth
            sx={{ mb: 1 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            label="内容"
            fullWidth
            multiline
            minRows={3}
            sx={{ mb: 1 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Button variant="contained" className="w-full" onClick={createMemo}>
            追加
          </Button>
        </CardContent>
      </Card>

      <Divider className="mb-4" />

      <div className="space-y-4">
        {memos.map((memo) => (
          <Card key={memo.id} className="shadow-sm">
            <CardContent>
              {editingId === memo.id ? (
                <>
                  <TextField
                    label="タイトル"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <TextField
                    label="内容"
                    fullWidth
                    multiline
                    minRows={3}
                    sx={{ mb: 2 }}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <IconButton
                      color="primary"
                      onClick={() => updateMemo(memo.id)}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton color="default" onClick={cancelEdit}>
                      <CancelIcon />
                    </IconButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <Typography className="text-xs text-gray-500">
                      {new Date(memo.createdAt).toLocaleString()}
                    </Typography>
                    <div>
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => startEdit(memo)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="inherit"
                        size="small"
                        onClick={() => deleteMemo(memo.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>

                  <Typography variant="h6" className="mb-2">
                    {memo.title}
                  </Typography>

                  <Typography className="text-gray-700 whitespace-pre-line">
                    {memo.content}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
