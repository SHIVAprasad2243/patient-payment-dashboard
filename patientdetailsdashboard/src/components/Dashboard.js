import React from 'react';
import StatsCards from './StatsCards';
import PatientTable from './PatientTable';
import PatientModal from './PatientModal';
import PrintPreview from './PrintPreview';
import PatientExportSheet from './PatientExportSheet';

const Dashboard = ({
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
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
  setShowPrintModal,
  selectedPatientIds,
  handlePatientSelectionToggle,
  handleSelectAllPatients,
  selectedPatients,
}) => {

  return (
    <section className="dashboard-page">
      <header className="dashboard-header-simple">
        <div className="header-top">
          <div className="header-title">
            <h2>Registered Patients</h2>
            <p>Manage and review all admitted patient records</p>
          </div>

          <button
            className="add-patient-btn"
            onClick={() => {
              resetPatientForm();
              setShowPatientModal(true);
            }}
          >
            <span className="add-patient-icon">+</span>
            Add Patient
          </button>
        </div>

        <div className="filter-toolbar-row">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by name, diagnosis or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="date-filter-group">
            <label>
              <span>Start</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </label>
            <label>
              <span>End</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </label>
          </div>
        </div>
      </header>

      <StatsCards 
        totalPatients={totalPatients}
        monthlyPatients={monthlyPatients}
      />

      <div className="table-toolbar">
        <PatientExportSheet
          selectedPatients={selectedPatients}
          allPatients={filteredPatients}
          userRole={userRole}
          disabled={selectedPatients.length === 0}
        />
      </div>

      <PatientTable 
        patientsLoading={patientsLoading}
        filteredPatients={filteredPatients}
        userRole={userRole}
        handlePrintClick={handlePrintClick}
        handleEditPatient={handleEditPatient}
        handleDeletePatient={handleDeletePatient}
        selectedPatientIds={selectedPatientIds}
        handlePatientSelectionToggle={handlePatientSelectionToggle}
        handleSelectAllPatients={handleSelectAllPatients}
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
