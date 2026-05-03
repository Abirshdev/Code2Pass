import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const DISCLAIMER =
  'BDU ExitPrep is an independent learning platform and is not affiliated with Bahir Dar University.';

export async function buildCertificatePdfBuffer({
  studentName,
  courseName,
  departmentName,
  score,
  certificateId,
  issueDate,
  verifyUrl,
}) {
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(10).fillColor('#666').text(DISCLAIMER, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(28).fillColor('#1e3a5f').text('Certificate of Completion', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#444').text('This certifies that', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(22).fillColor('#0f172a').text(studentName, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(14).fillColor('#334155').text(`has successfully completed`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(16).fillColor('#1e40af').text(courseName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Department: ${departmentName}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.text(`Score: ${score}%`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#64748b').text(`Certificate ID: ${certificateId}`, { align: 'center' });
    doc.text(`Issued: ${new Date(issueDate).toLocaleDateString('en-GB')}`, { align: 'center' });

    doc.moveDown(2);
    const qrBuf = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    const qrW = 100;
    const x = (doc.page.width - qrW) / 2;
    doc.image(qrBuf, x, doc.y, { width: qrW });
    doc.moveDown(4);
    doc.fontSize(9).fillColor('#94a3b8').text('Scan to verify', { align: 'center' });

    doc.end();
  });
}
