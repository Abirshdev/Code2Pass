import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

export default function Verify() {
  const { certificateId } = useParams();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api(`/api/certificates/verify/${encodeURIComponent(certificateId)}`)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [certificateId]);

  if (err) return <p className="text-red-600">{err}</p>;
  if (!data) return <p className="text-slate-500">Loading…</p>;

  const valid = data.valid;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link to="/verify" className="text-sm text-brand-600">
        ← {t('verify.title')}
      </Link>
      <div
        className={`rounded-2xl border-2 p-6 ${
          valid
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
            : 'border-red-400 bg-red-50 dark:bg-red-950/30'
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-wide">
          {valid ? t('verify.valid') : t('verify.invalid')}
        </p>
        {valid ? (
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <strong>{t('verify.student')}:</strong> {data.studentName}
            </li>
            <li>
              <strong>{t('verify.course')}:</strong> {data.course}
            </li>
            <li>
              <strong>{t('verify.dept')}:</strong> {data.department}
            </li>
            <li>
              <strong>{t('verify.score')}:</strong> {data.score}%
            </li>
            <li>
              <strong>{t('certs.id')}:</strong> {data.certificateId}
            </li>
            <li>
              <strong>{t('verify.date')}:</strong>{' '}
              {data.issueDate ? new Date(data.issueDate).toLocaleDateString() : '—'}
            </li>
          </ul>
        ) : (
          <p className="mt-2 text-sm">{data.message}</p>
        )}
      </div>
    </div>
  );
}
