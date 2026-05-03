import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, downloadPdfBlob } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Certificates() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loadingId, setLoadingId] = useState('');

  useEffect(() => {
    if (!user) return;
    api('/api/certificates/mine')
      .then(setItems)
      .catch((e) => setErr(e.message));
  }, [user]);

  async function download(id) {
    setLoadingId(id);
    setErr('');
    try {
      const blob = await downloadPdfBlob(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoadingId('');
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('certs.title')}</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {items.length === 0 ? (
        <p className="text-slate-500">{t('certs.none')}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li
              key={c._id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900"
            >
              <div>
                <p className="font-medium">{c.courseName}</p>
                <p className="text-sm text-slate-500">
                  {c.departmentName} · {t('certs.id')}: {c.certificateId}
                </p>
                <p className="text-sm">
                  {t('verify.score')}: {c.score}% · {new Date(c.issueDate).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                disabled={loadingId === c.certificateId}
                onClick={() => download(c.certificateId)}
                className="rounded-lg bg-brand-600 text-white text-sm px-4 py-2 disabled:opacity-50"
              >
                {loadingId === c.certificateId ? '…' : t('certs.download')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
