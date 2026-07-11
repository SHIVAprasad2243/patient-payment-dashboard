import React from 'react';
import StatsCards from './StatsCards';
import PatientTable from './PatientTable';
import PatientModal from './PatientModal';
import PrintPreview from './PrintPreview';

const Dashboard = ({
  searchQuery,
  setSearchQuery,
  resetPatientForm,
  setShowPatientModal,
  totalPatients,
  monthlyPatients,
  patientsLoading,
  filteredPatients,
  userRole,
  handlePrintClick,
  handleEditPatient,
  handleDeletePatient,
  showPatientModal,
  editingPatientId,
  patientForm,
  handlePatientChange,
  handleImageChange,
  handlePatientSubmit,
  patientMessage,
  masterDiagnoses,
  masterStaff,
  showPrintModal,
  selectedPatient,
  handlePrint,
  setShowPrintModal
}) => {
  return (
    <section className="dashboard-page">
      <header className="dashboard-header-simple">
        <div className="header-top">
          <div className="header-title">
            <h1>Registered Patients</h1>
          </div>
          <div className="header-controls">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search by name, diagnosis or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              className="add-patient-btn"
              onClick={() => {
                resetPatientForm();
                setShowPatientModal(true);
              }}
            >
              Add Patient Details
            </button>
          </div>
        </div>
      </header>

      <StatsCards 
        totalPatients={totalPatients}
        monthlyPatients={monthlyPatients}
      />

      <PatientTable 
        patientsLoading={patientsLoading}
        filteredPatients={filteredPatients}
        userRole={userRole}
        handlePrintClick={handlePrintClick}
        handleEditPatient={handleEditPatient}
        handleDeletePatient={handleDeletePatient}
      />

      {showPatientModal && (
        <PatientModal 
          editingPatientId={editingPatientId}
          setShowPatientModal={setShowPatientModal}
          patientForm={patientForm}
          handlePatientChange={handlePatientChange}
          handleImageChange={handleImageChange}
          handlePatientSubmit={handlePatientSubmit}
          patientsLoading={patientsLoading}
          patientMessage={patientMessage}
          masterDiagnoses={masterDiagnoses}
          masterStaff={masterStaff}
          userRole={userRole}
        />
      )}

      {showPrintModal && selectedPatient && (
        <PrintPreview 
          selectedPatient={selectedPatient}
          handlePrint={handlePrint}
          setShowPrintModal={setShowPrintModal}
          userRole={userRole}
        />
      )}
    </section>
  );
};

export default Dashboard;
