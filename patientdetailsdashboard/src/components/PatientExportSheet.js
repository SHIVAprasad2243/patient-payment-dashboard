import React from 'react';

const PatientExportSheet = ({ selectedPatients, allPatients = [], disabled = true, userRole }) => {
  const exportToExcel = () => {
    // Check if patients are selected
    if (!selectedPatients || selectedPatients.length === 0) {
      return;
    }

    // Prepare Excel/CSV rows with requested columns:
    // S No | Date | Name | Diagnosis | Amount | Charges | Total Amount
    const rows = [
      ['S No', 'Date', 'Name', 'Diagnosis', 'Amount (₹)', 'Charges (₹)', 'Total Amount (₹)'],

      ...selectedPatients.map((patient, idx) => {
        const amount = Number(patient.total_amount) || 0; // how much paid (total amount field)

        const surgeon = Number(patient.surgeon_charge) || 0;
        const ana = Number(patient.anaesthetist_charge) || 0;
        const assist = Number(patient.assistant_charge) || 0;
        const staff = Number(patient.staff_charges) || 0;
        const ayyas = Number(patient.ayyas_charges) || 0;
        const miscCharge = Number(patient.charge) || 0;

        const chargesSum = surgeon + ana + assist + staff + ayyas + miscCharge;

        const totalAfterCharges = amount - chargesSum;

        const format = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

        return [
          idx + 1,
          patient.date_of_admission || '-',
          `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || '-',
          patient.diagnosis || '-',
          format(amount),
          format(chargesSum),
          format(totalAfterCharges),
        ];
      }),
    ];

    // Convert rows into CSV format
    const csvContent = rows
      .map((row) =>
        row
          .map((value) => {
            // Escape double quotes
            const escapedValue = String(value).replace(/"/g, '""');

            return `"${escapedValue}"`;
          })
          .join(',')
      )
      .join('\n');

    // UTF-8 BOM
    // This ensures Excel correctly displays the ₹ symbol
    const BOM = '\uFEFF';

    // Create CSV Blob
    const blob = new Blob(
      [BOM + csvContent],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    // Create download URL
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement('a');

    link.href = url;
    link.download = 'selected_patients.csv';

    // Add link to DOM
    document.body.appendChild(link);

    // Start download
    link.click();

    // Remove link
    document.body.removeChild(link);

    // Release URL
    URL.revokeObjectURL(url);
  };

  const count = selectedPatients ? selectedPatients.length : 0;

  const selectedLabel = count > 0 ? `Export Selected to Excel (${count})` : 'Export Selected to Excel';

  return (
    <div className="export-sheet-actions">
      <button
        className="export-selected-btn"
        onClick={exportToExcel}
        disabled={count === 0}
      >
        {selectedLabel}
      </button>

      {userRole !== 'staff' && (
        <button
          className="export-selected-patient-details-btn"
          onClick={() => exportAllWithoutCharges(selectedPatients || [])}
          disabled={count === 0}
        >
          Export Patient Details to Excel
        </button>
      )}
    </div>
  );
};

const exportAllWithoutCharges = (patients) => {
  if (!patients || patients.length === 0) return;

  // Exclude professional charge fields and misc `charge`
  const excludedFields = new Set([
    'surgeon_charge',
    'anaesthetist_charge',
    'assistant_charge',
    'staff_charges',
    'ayyas_charges',
    'charge',
    'id',
    'created_at',
    'photo_url',
    'image_url',
    'photo',
  ]);

  // Build header keys from first patient, filtering excluded fields
  const first = patients[0] || {};
  const keys = Object.keys(first).filter((k) => !excludedFields.has(k));

  // If remaining_amount is present but all patients have zero remaining, remove it
  if (keys.includes('remaining_amount')) {
    const anyRemaining = patients.some((p) => Number(p.remaining_amount) > 0);
    if (!anyRemaining) {
      // remove remaining_amount from keys
      const idx = keys.indexOf('remaining_amount');
      if (idx !== -1) keys.splice(idx, 1);
    }
  }

  // If first_name/last_name exist, replace them with a single `Name` column
  const hasFirst = keys.includes('first_name');
  const hasLast = keys.includes('last_name');
  let headerKeys = keys.slice();
  if (hasFirst || hasLast) {
    headerKeys = headerKeys.filter((k) => k !== 'first_name' && k !== 'last_name');
    headerKeys.unshift('name');
  }

  const header = headerKeys.map((k) => {
    if (k === 'name') return 'Name';
    return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  });

  const rows = [header];

  patients.forEach((p) => {
    const row = [];
    headerKeys.forEach((k) => {
      if (k === 'name') {
        row.push(`${p.first_name || ''} ${p.last_name || ''}`.trim());
        return;
      }
      let val = p[k];
      if (val === null || typeof val === 'undefined') val = '';
      row.push(val);
    });
    rows.push(row);
  });

  const csvContent = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'all_patients_no_charges.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default PatientExportSheet;