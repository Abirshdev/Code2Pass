import Certificate from '../models/Certificate.js';

export async function nextCertificateSerial(deptCode) {
  const year = new Date().getFullYear();
  const prefix = `BDU-${deptCode}-${year}-`;
  const latest = await Certificate.findOne({
    certificateId: new RegExp(`^${prefix}`),
  })
    .sort({ certificateId: -1 })
    .select('certificateId')
    .lean();

  let n = 1;
  if (latest?.certificateId) {
    const part = latest.certificateId.split('-').pop();
    const parsed = parseInt(part, 10);
    if (!Number.isNaN(parsed)) n = parsed + 1;
  }
  return `${prefix}${String(n).padStart(4, '0')}`;
}
