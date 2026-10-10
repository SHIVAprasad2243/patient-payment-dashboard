import { fireEvent, render, screen } from '@testing-library/react';
import App, { sortPatientsByAdmissionDate } from './App';
import PatientModal from './components/PatientModal';
import PatientTable from './components/PatientTable';
import Sidebar from './components/Sidebar';
import PaymentHistoryPage from './components/PaymentHistoryPage';
import PatientTransactionModal from './components/PatientTransactionModal';
import { parseLocalDate, toLocalDateInputValue, toLocalDateTimeInputValue } from './utils/dateFormat';

test('renders Supabase setup message when env vars are missing', () => {
  render(<App />);
  expect(screen.getByText(/supabase is not configured/i)).toBeInTheDocument();
});

test('hides professional charges for staff users', () => {
  const baseProps = {
    editingPatientId: null,
    setShowPatientModal: jest.fn(),
    patientForm: {
      patient_image: '',
      first_name: 'John',
      last_name: 'Doe',
      age: '30',
      gender: 'Male',
      cell_no: '+91 9876543210',
      husband_name: '',
      alternative_number: '',
      address: '',
      date_of_admission: '',
      diagnosis: '',
      surgeon_name: '',
      anaesthetist_name: '',
      assistant_name: '',
      package_amount: '1000',
      advance_payment: '200',
      balance: '150',
      discount: '50',
      cash_method: 'Cash',
      surgeon_charge: '300',
      anaesthetist_charge: '200',
      assistant_charge: '100',
      bp: '',
      pr: '',
      rr: '',
      spo2: '',
      temperature: '',
      heart: '',
      lungs: '',
    },
    handlePatientChange: jest.fn(),
    handleImageChange: jest.fn(),
    handlePatientSubmit: jest.fn(),
    patientsLoading: false,
    patientMessage: '',
    masterDiagnoses: [],
    masterStaff: {
      surgeons: [],
      anaesthetists: [],
      assistants: [],
    },
    userRole: 'staff',
  };

  render(<PatientModal {...baseProps} />);

  expect(screen.queryByText(/professional charges/i)).not.toBeInTheDocument();

  render(<PatientModal {...baseProps} userRole="admin" />);
  expect(screen.getByText(/professional charges/i)).toBeInTheDocument();
});

test('shows charge column and total in admin patient table', () => {
  render(
    <PatientTable
      patientsLoading={false}
      filteredPatients={[
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          age: 30,
          gender: 'Male',
          husband_name: 'Jane',
          phone: '+91 9876543210',
          date_of_admission: '2026-08-31',
          diagnosis: 'Appendix',
          surgeon_name: 'Dr. X',
          anaesthetist_name: 'Dr. Y',
          assistant_name: 'Helper',
          remaining_amount: 500,
          total_amount: 1500,
          cash_method: 'Cash',
          payment_status: 'Due',
          surgeon_charge: 300,
          anaesthetist_charge: 200,
          assistant_charge: 100,
          charge: 600,
        }
      ]}
      userRole="admin"
      handlePrintClick={jest.fn()}
      handleEditPatient={jest.fn()}
      handleDeletePatient={jest.fn()}
      selectedPatientIds={[]}
      handlePatientSelectionToggle={jest.fn()}
      handleSelectAllPatients={jest.fn()}
    />
  );

  expect(screen.getByRole('columnheader', { name: /^charge$/i })).toBeInTheDocument();
  expect(screen.getByText('₹600')).toBeInTheDocument();
});

test('shows payment history in the sidebar navigation for admin only', () => {
  const { rerender } = render(
    <Sidebar
      activeTab="payment-history"
      setActiveTab={jest.fn()}
      collapsed={false}
      setCollapsed={jest.fn()}
      userRole="staff"
    />
  );

  expect(screen.queryByRole('button', { name: /payment history/i })).not.toBeInTheDocument();

  rerender(
    <Sidebar
      activeTab="payment-history"
      setActiveTab={jest.fn()}
      collapsed={false}
      setCollapsed={jest.fn()}
      userRole="admin"
    />
  );

  expect(screen.getByRole('button', { name: /payment history/i })).toBeInTheDocument();
});

test('filters payment history by patient name or bill number', () => {
  render(
    <PaymentHistoryPage
      initialTransactions={[
        { id: 1, patient_name: 'Ananya Rao', bill_no: '1001', payment_date: '2026-09-20', amount: 2500, payment_mode: 'UPI', sent_by: 'Ravi', mobile_number: '9876543210', collected_by: 'Staff A', remark: 'Advance' },
        { id: 2, patient_name: 'Mahesh Kumar', bill_no: '2002', payment_date: '2026-09-21', amount: 3500, payment_mode: 'Cash', sent_by: 'Kiran', mobile_number: '9123456780', collected_by: 'Staff B', remark: 'Balance' },
      ]}
    />
  );

  const searchInput = screen.getByPlaceholderText(/search by name or bill no/i);
  expect(screen.getAllByText(/ananya rao/i).length).toBeGreaterThan(0);

  fireEvent.change(searchInput, { target: { value: '2002' } });

  expect(screen.queryByText(/ananya rao/i)).not.toBeInTheDocument();
  expect(screen.getAllByText(/mahesh kumar/i).length).toBeGreaterThan(0);
});

test('shows selected payment row count on the bulk download button', () => {
  render(
    <PaymentHistoryPage
      initialTransactions={[
        { id: 1, patient_name: 'Ananya Rao', bill_no: '1001', payment_date: '2026-09-20', amount: 2500, payment_mode: 'UPI', sent_by: 'Ravi', mobile_number: '9876543210', collected_by: 'Staff A', remark: 'Advance' },
        { id: 2, patient_name: 'Mahesh Kumar', bill_no: '2002', payment_date: '2026-09-21', amount: 3500, payment_mode: 'Cash', sent_by: 'Kiran', mobile_number: '9123456780', collected_by: 'Staff B', remark: 'Balance' },
      ]}
    />
  );

  const buttons = screen.getAllByRole('checkbox');
  fireEvent.click(buttons[1]);
  fireEvent.click(buttons[2]);

  const downloadButton = screen.getByRole('button', { name: /download selected \(2\)/i });
  expect(downloadButton).toBeInTheDocument();
  expect(downloadButton).toBeEnabled();
});

test('shows discharge date field in the patient form', () => {
  render(
    <PatientModal
      editingPatientId={null}
      setShowPatientModal={jest.fn()}
      patientForm={{
        patient_image: '',
        first_name: 'John',
        last_name: 'Doe',
        age: '30',
        gender: 'Male',
        cell_no: '+91 9876543210',
        husband_name: '',
        alternative_number: '',
        address: '',
        date_of_admission: '2026-10-01',
        date_of_discharge: '',
        diagnosis: '',
        baby_date_of_birth: '',
        baby_gender: '',
        baby_weight: '',
        surgeon_name: '',
        anaesthetist_name: '',
        assistant_name: '',
        package_amount: '1000',
        advance_payment: '200',
        balance: '150',
        discount: '50',
        cash_method: 'Cash',
        surgeon_charge: '300',
        anaesthetist_charge: '200',
        assistant_charge: '100',
        operation_type: 'A',
        reg_no: '123',
        bill_no: '456',
      }}
      handlePatientChange={jest.fn()}
      handleImageChange={jest.fn()}
      handlePatientSubmit={jest.fn()}
      patientsLoading={false}
      patientMessage=""
      masterDiagnoses={[]}
      masterStaff={{ surgeons: [], anaesthetists: [], assistants: [] }}
      userRole="admin"
    />
  );

  expect(screen.getByText(/discharge date/i)).toBeInTheDocument();
});

test('shows baby details section for delivery diagnoses', () => {
  render(
    <PatientModal
      editingPatientId={null}
      setShowPatientModal={jest.fn()}
      patientForm={{
        patient_image: '',
        first_name: 'John',
        last_name: 'Doe',
        age: '30',
        gender: 'Male',
        cell_no: '+91 9876543210',
        husband_name: '',
        alternative_number: '',
        address: '',
        date_of_admission: '2026-10-01',
        date_of_discharge: '',
        diagnosis: 'Normal Vaginal Delivery',
        baby_date_of_birth: '',
        baby_gender: '',
        baby_weight: '',
        surgeon_name: '',
        anaesthetist_name: '',
        assistant_name: '',
        package_amount: '1000',
        advance_payment: '200',
        balance: '150',
        discount: '50',
        cash_method: 'Cash',
        surgeon_charge: '300',
        anaesthetist_charge: '200',
        assistant_charge: '100',
        operation_type: 'A',
        reg_no: '123',
        bill_no: '456',
      }}
      handlePatientChange={jest.fn()}
      handleImageChange={jest.fn()}
      handlePatientSubmit={jest.fn()}
      patientsLoading={false}
      patientMessage=""
      masterDiagnoses={['Normal Vaginal Delivery']}
      masterStaff={{ surgeons: [], anaesthetists: [], assistants: [] }}
      userRole="admin"
    />
  );

  expect(screen.getByText(/baby details/i)).toBeInTheDocument();
  expect(screen.getByText(/Date of birth/i)).toBeInTheDocument();
  expect(screen.getByText(/Gender/i)).toBeInTheDocument();
  expect(screen.getByText(/weight/i)).toBeInTheDocument();
});

test('accepts payment mobile numbers in +91 9876543210 format', () => {
  const handleSave = jest.fn();
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(
    <PatientTransactionModal
      patient={{ first_name: 'John', last_name: 'Doe', bill_no: 'B-1001' }}
      onClose={jest.fn()}
      onSave={handleSave}
    />
  );

  fireEvent.change(screen.getByLabelText(/mobile number/i), {
    target: { value: '+91 9876543210' },
  });

  fireEvent.click(screen.getByRole('button', { name: /save payment/i }));

  expect(alertSpy).not.toHaveBeenCalled();
  expect(handleSave).toHaveBeenCalledWith(
    expect.objectContaining({
      mobileNumber: '+91 9876543210',
    })
  );

  alertSpy.mockRestore();
});

test('sorts patients by admission date in descending order', () => {
  const patients = [
    { id: 1, date_of_admission: '2026-08-10' },
    { id: 2, date_of_admission: '2026-09-09' },
    { id: 3, date_of_admission: '2026-08-31' },
    { id: 4, date_of_admission: '' },
  ];

  expect(sortPatientsByAdmissionDate(patients).map((patient) => patient.id)).toEqual([2, 3, 1, 4]);
});

test('shows a success toast after saving a payment record', async () => {
  const mockInsert = jest.fn().mockResolvedValue({ error: null });
  const supabaseClient = require('./lib/supabaseClient');
  const originalSupabase = supabaseClient.supabase;
  supabaseClient.supabase = {
    from: jest.fn(() => ({
      insert: mockInsert,
    })),
  };

  try {
    render(
      <PatientTable
        patientsLoading={false}
        filteredPatients={[
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            age: 30,
            gender: 'Male',
            husband_name: 'Jane',
            phone: '+91 9876543210',
            date_of_admission: '2026-08-31',
            diagnosis: 'Appendix',
            surgeon_name: 'Dr. X',
            anaesthetist_name: 'Dr. Y',
            assistant_name: 'Helper',
            remaining_amount: 500,
            total_amount: 1500,
            cash_method: 'Cash',
            payment_status: 'Due',
            bill_no: 'B-1001',
          }
        ]}
        userRole="admin"
        handlePrintClick={jest.fn()}
        handleEditPatient={jest.fn()}
        handleDeletePatient={jest.fn()}
        selectedPatientIds={[]}
        handlePatientSelectionToggle={jest.fn()}
        handleSelectAllPatients={jest.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText(/more actions/i));
    fireEvent.click(screen.getByRole('button', { name: /add payment/i }));

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/sent by/i), { target: { value: 'Ravi' } });
    fireEvent.click(screen.getByRole('button', { name: /save payment/i }));

    expect(await screen.findByText(/payment saved successfully/i)).toBeInTheDocument();
    expect(mockInsert).toHaveBeenCalled();
  } finally {
    supabaseClient.supabase = originalSupabase;
  }
});

test('keeps the selected local date without shifting to previous day', () => {
  const selected = new Date(2026, 8, 20);

  expect(toLocalDateInputValue(selected)).toBe('2026-09-20');
  expect(parseLocalDate('2026-09-20').getDate()).toBe(20);
});

test('keeps the selected local date and time for baby birth datetime values', () => {
  const selected = new Date(2026, 9, 16, 14, 30);

  expect(toLocalDateTimeInputValue(selected)).toBe('2026-10-16T14:30');
  expect(parseLocalDate('2026-10-16T14:30').getHours()).toBe(14);
  expect(parseLocalDate('2026-10-16T14:30').getMinutes()).toBe(30);
});
