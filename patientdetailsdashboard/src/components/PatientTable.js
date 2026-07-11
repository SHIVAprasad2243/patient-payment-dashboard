import React from 'react';

const PatientTable = ({ 
  patientsLoading, 
  filteredPatients, 
  userRole, 
  handlePrintClick, 
  handleEditPatient, 
  handleDeletePatient 
}) => {
  return (
    <div className="records-table-container">
      <table className="records-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Age/Sex</th>
            <th>Relative Name</th>
            <th>Cell No</th>
            <th>Admission Date</th>
            <th>Diagnosis</th>
            <th>Surgeon</th>
            <th>Anaesthetist</th>
            <th>Assistant</th>
            {userRole === 'admin' && (
              <>
                <th>Total Pay</th>
                <th>Remaining Balance</th>
              </>
            )}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patientsLoading && filteredPatients.length === 0 ? (
            <tr>
              <td colSpan={userRole === 'admin' ? "11" : "9"} className="table-empty-state">
                Loading patient details...
              </td>
            </tr>
          ) : filteredPatients.length === 0 ? (
            <tr>
              <td colSpan={userRole === 'admin' ? "11" : "9"} className="table-empty-state">
                No records found
              </td>
            </tr>
          ) : (
            filteredPatients.map((patient) => {
              const packageAmt = Number(patient.package_amount) || 0;
              const totalBill = Number(patient.total_amount) || 0;
              const advance = Number(patient.advance_payment) || 0;
              const discount = Number(patient.discount) || 0;
              const balance = packageAmt - totalBill - advance - discount;
              
              return (
                <tr key={patient.id}>
                  <td className="font-bold">
                    <div className="table-patient-info">
                      {patient.photo_url ? (
                        <img src={patient.photo_url} alt="Avatar" className="table-avatar" />
                      ) : (
                        <div className="table-avatar-placeholder">
                          {patient.first_name ? patient.first_name[0] : 'P'}
                        </div>
                      )}
                      <span>{patient.first_name} {patient.last_name}</span>
                    </div>
                  </td>
                  <td>
                    {patient.age || '-'}/{patient.gender ? patient.gender.charAt(0) : '-'}
                  </td>
                  <td>{patient.husband_name || '-'}</td>
                  <td>{patient.phone || '-'}</td>
                  <td>{patient.date_of_admission || '-'}</td>
                  <td>
                    <div className="diagnosis-cell" title={patient.diagnosis}>
                      {patient.diagnosis || '-'}
                    </div>
                  </td>
                  <td>{patient.surgeon_name || '-'}</td>
                  <td>{patient.anaesthetist_name || '-'}</td>
                  <td>{patient.assistant_name || '-'}</td>
                  {userRole === 'admin' && (
                    <>
                      <td>₹{totalBill}</td>
                      <td className={balance > 0 ? 'text-danger font-bold' : 'text-success font-bold'}>
                        ₹{balance}
                      </td>
                    </>
                  )}
                  <td>
                    <div className="table-actions">
                      <button
                        className="text-button print-btn"
                        onClick={() => handlePrintClick(patient)}
                        title="Print Preview"
                      >
                        🖨️
                      </button>
                      <button
                        className="text-button edit-btn"
                        onClick={() => handleEditPatient(patient)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      {userRole === 'admin' && (
                        <button
                          className="text-button delete-btn"
                          onClick={() => handleDeletePatient(patient.id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
