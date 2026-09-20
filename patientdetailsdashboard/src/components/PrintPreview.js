import React from 'react';

const PrintPreview = ({ selectedPatient, setShowPrintModal }) => {
  const remainingBalance =
    selectedPatient.remaining_amount !== undefined && selectedPatient.remaining_amount !== null
      ? selectedPatient.remaining_amount
      : (selectedPatient.remaining_balance || 0);
  const totalAmount = Math.max(
    (Number(selectedPatient.total_amount) || 0) - (Number(selectedPatient.discount) || 0),
    0
  );
const handlePrint = () => {
  const printContent = document.getElementById("printable-area");

  if (!printContent) {
    console.error("Printable content not found");
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    alert("Please allow popups for this website to print.");
    return;
  }

  printWindow.document.open();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Siddhartha Nursing Home</title>

        <style>
          @page {
            size: A4;
            margin: 15mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            background: white;
            color: black;
            font-family: Arial, sans-serif;
          }

          .printable-content {
            width: 100%;
            background: white;
            padding: 10px;
          }

          .print-hospital-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 25px;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 15px;
          }

          .print-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
          }

          .print-hospital-info {
            text-align: center;
          }

          .print-hospital-info h1 {
            margin: 0 0 8px 0;
            color: #0f766e;
            font-size: 24px;
          }

          .print-hospital-info p {
            margin: 4px 0;
            font-size: 13px;
          }

          .print-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .print-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 30px;
          }

          .print-item {
            font-size: 14px;
            line-height: 1.5;
            word-break: break-word;
          }

          .print-item strong {
            font-weight: 700;
          }

          .print-divider {
            border: none;
            border-top: 1px solid #999;
            margin: 15px 0;
          }

          .print-billing-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }

          .billing-left {
            display: flex;
            align-items: flex-start;
          }

          .billing-right {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .print-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
            page-break-inside: avoid;
          }

          .print-signature {
            text-align: center;
          }

          .signature-line {
            width: 180px;
            border-top: 1px solid black;
            margin-bottom: 5px;
          }

          .print-signature p {
            margin: 0;
            font-size: 12px;
          }

          .print-date {
            font-size: 12px;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body>

        ${printContent.outerHTML}

      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();

      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 500);
  };
};

  return (
    <div className="modal-overlay print-modal-overlay">
      <div className="modal-content modal-large print-preview-modal">
        <div className="modal-header no-print">
          <h2>Patient Details Preview</h2>
          <div className="modal-header-actions">
            <button className="print-action-btn" onClick={handlePrint}>
              Print Details
            </button>
            <button
              className="close-modal"
              onClick={() => setShowPrintModal(false)}
            >
              &times;
            </button>
          </div>
        </div>

        <div className="modal-scroll-area">
          <div id="printable-area" className="printable-content">
            <div className="print-hospital-header">
              <img
                src="/images.jpg"
                alt="Logo"
                className="print-logo"
              />
              <div className="print-hospital-info">
                <h1 style={{ color: '#0f766e' }}>SIDDHARTHA NURSING HOME</h1>
                <p>near Gandhi park, Chinna kondur road, Choutuppal</p>
                <p>Phone: +91 9912033193</p>
              </div>
            </div>

            <div className="print-body">
              <div className="print-section">
                <div className="print-grid">
                  <div className="print-item"><strong>Full Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</div>
                  <div className="print-item"><strong>Age/Gender:</strong> {selectedPatient.age || '-'} / {selectedPatient.gender || '-'}</div>

                  <div className="print-item"><strong>Relative Name:</strong> {selectedPatient.husband_name || '-'}</div>
                  <div className="print-item"><strong>Bill Date:</strong> {selectedPatient.date_of_admission || '-'}</div>

                  <div className="print-item"><strong>Phone No:</strong> {selectedPatient.phone || '-'}</div>
                  <div className="print-item"><strong>Reg No:</strong> {selectedPatient.reg_no || '-'}</div>

                  <div className="print-item"><strong>Address:</strong> {selectedPatient.address || '-'}</div>
                  <div className="print-item"><strong>Bill No:</strong> {selectedPatient.bill_no || '-'}</div>
                </div>
              </div>

              <div className="print-section">
                <div className="print-grid">
                  <div className="print-item"><strong>Doctor Name:</strong> {selectedPatient.surgeon_name || '-'}</div>

                  <div className="print-item"><strong>Diagnosis:</strong> {selectedPatient.diagnosis || '-'}</div>
                </div>
              </div>

              <div className="print-section">
                <hr className="print-divider" />
                <div className="print-billing-grid">
                  <div className="billing-left">
                    <div className="print-item"><strong>Package:</strong> ₹{selectedPatient.package_amount || 0}</div>
                  </div>
                  <div className="billing-right">
                    <div className="print-item"><strong>Advance Payment:</strong> ₹{selectedPatient.advance_payment || 0}</div>
                    <div className="print-item"><strong>Remaining Balance:</strong> ₹{remainingBalance}</div>
                    <div className="print-item"><strong>Discount:</strong> ₹{selectedPatient.discount || 0}</div>
                    <div className="print-item"><strong>Total Amount:</strong> ₹{totalAmount}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="print-footer">
              <div className="print-signature">
                <div className="signature-line"></div>
                <p>Authorized Signature</p>
              </div>
              <div className="print-date">
                Printed on: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
