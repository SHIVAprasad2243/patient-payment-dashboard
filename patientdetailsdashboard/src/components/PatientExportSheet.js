import React from 'react';

const PatientExportSheet = ({ selectedPatients, disabled = true }) => {
  const exportToExcel = () => {
    // Check if patients are selected
    if (!selectedPatients || selectedPatients.length === 0) {
      return;
    }

    // Prepare Excel/CSV rows
    const rows = [
      [
        'Name',
        'Age',
            'Gender',
           'date',
        'Relative Name',
        'Reg No',
        'Bill No',
        'Diagnosis',
        'Total Amount',
      ],

      ...selectedPatients.map((patient) => {
        // Calculate total amount
        const totalAmount = Math.max(
          (Number(patient.total_amount) || 0) -
            (Number(patient.discount) || 0),
          0
        );

        // Format amount in Indian currency
        // Example: 15000 -> ₹15,000
        // Example: 125000 -> ₹1,25,000
        const formattedTotalAmount = `₹${totalAmount.toLocaleString(
          'en-IN'
        )}`;

        return [
          `${patient.first_name || ''} ${
            patient.last_name || ''
          }`.trim() || '-',

          patient.age || '-',
          
            patient.gender || '-',
            patient.date_of_admission|| '-',

          patient.husband_name || '-',

          patient.reg_no || '-',

          patient.bill_no || '-',

          patient.diagnosis || '-',

          formattedTotalAmount,
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

  return (
    <div className="export-sheet-actions">
      <button
        className="export-selected-btn"
        onClick={exportToExcel}
        disabled={
          disabled ||
          !selectedPatients ||
          selectedPatients.length === 0
        }
      >
        Export Selected to Excel
      </button>
    </div>
  );
};

export default PatientExportSheet;