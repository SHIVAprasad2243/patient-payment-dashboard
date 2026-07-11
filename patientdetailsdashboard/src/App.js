import { useEffect, useState } from 'react';
import './App.css';
import { hasSupabaseConfig, supabase } from './lib/supabaseClient';

// Components
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

const emptyPatientForm = {
  first_name: '',
  last_name: '',
  reg_no: '',
  bill_no: '',
  husband_name: '',
  gender: '',
  age: '',
  cell_no: '',
  alternative_number: '',
  address: '',
  date_of_admission: '',
  diagnosis: '',
  surgeon_name: '',
  anaesthetist_name: '',
  assistant_name: '',
  package_amount: '',
  advance_payment: '',
  discount: '',
  patient_image: '',
  total_amount: '',
  cash_method: '',
  surgeon_charge: '',
  anaesthetist_charge: '',
  assistant_charge: '',
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientMessage, setPatientMessage] = useState('');
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [masterDiagnoses] = useState([
    'Appendix & Laparoscopy',
    'Breast Fibroid',
    'Breast Lipoma',
    'Cyst',
    'Hernia',
    'Hysterectomy',
    'Lipoma',
    'Laparoscopic Hysterectomy',
    'Laparoscopic Tubectomy',
    'LSCS Primi',
    'LSCS G2',
    'LSCS G2 BTC',
    'LSCS G3',
    'LSCS G3 BTC',
    'Tubectomy'
  ].sort());

  const [masterStaff] = useState({
    surgeons: ['Dr. Krishna'],
    anaesthetists: ['Dr. Anitha'],
    assistants: ['Paramesh', 'Swamy']
  });

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        fetchUserRole(data.session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchUserRole(currentSession.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('userRole')
        .select('role')
        .eq('uuid', userId)
        .maybeSingle();

      if (data && data.role) {
        setUserRole(data.role);
      } else {
        setUserRole('staff');
        if (error) console.error('Supabase Fetch Error:', error);
      }
    } catch (err) {
      console.error('Exception in fetchUserRole:', err);
      setUserRole('staff');
    }
  };

  useEffect(() => {
    if (!session) {
      setPatients([]);
      setPatientForm(emptyPatientForm);
      setEditingPatientId(null);
      return;
    }

    fetchPatients();
  }, [session]);

  const fetchPatients = async () => {
    setPatientsLoading(true);
    setPatientMessage('');

    const { data, error } = await supabase
      .from('patientDetailsTable')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      setPatientMessage(error.message);
    } else {
      setPatients(data || []);
    }

    setPatientsLoading(false);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  const handleSignUp = async () => {
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setMessage(
      error
        ? error.message
        : 'Account created. Check your email if confirmation is enabled.'
    );
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserRole(null);
    setPatientMessage('');
    setLoading(false);
  };

  const handlePatientChange = (event) => {
    const { name, value } = event.target;

    if (['cell_no', 'alternative_number', 'reg_no', 'bill_no'].includes(name)) {
      let cleanValue = value;

      if (['cell_no', 'alternative_number'].includes(name)) {
        if (value === '+' || value === '+9' || value === '+91' || value === '+91 ') {
          // Allow clearing/backspacing through country code
          cleanValue = '';
        } else {
          const digits = value.replace(/\D/g, '');
          if (digits.length === 0) {
            cleanValue = '';
          } else if (digits.startsWith('91')) {
            cleanValue = '+91 ' + digits.slice(2);
          } else {
            cleanValue = '+91 ' + digits;
          }
        }

        // Limit to '+91 9666614020' which is 14 characters
        if (cleanValue.length > 14) {
          return;
        }
      } else {
        // Reg No and Bill No allow only digits
        cleanValue = value.replace(/\D/g, '');
      }

      setPatientForm((currentForm) => ({
        ...currentForm,
        [name]: cleanValue,
      }));
      return;
    }

    setPatientForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const resetPatientForm = () => {
    setPatientForm(emptyPatientForm);
    setEditingPatientId(null);
    setPatientMessage('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPatientMessage('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPatientForm(prev => ({ ...prev, patient_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePatientSubmit = async (event) => {
    event.preventDefault();
    setPatientMessage('');
    setPatientsLoading(true);

    const balance = (Number(patientForm.package_amount) || 0) - (Number(patientForm.total_amount) || 0) - (Number(patientForm.advance_payment) || 0) - (Number(patientForm.discount) || 0);

    const patientPayload = {
      first_name: patientForm.first_name,
      last_name: patientForm.last_name,
      reg_no: patientForm.reg_no,
      bill_no: patientForm.bill_no,
      husband_name: patientForm.husband_name,
      gender: patientForm.gender,
      phone: patientForm.cell_no,
      alternative_number: patientForm.alternative_number,
      address: patientForm.address,
      date_of_admission: patientForm.date_of_admission,
      diagnosis: patientForm.diagnosis,
      surgeon_name: patientForm.surgeon_name,
      anaesthetist_name: patientForm.anaesthetist_name,
      assistant_name: patientForm.assistant_name,
      package_amount: Number(patientForm.package_amount) || 0,
      advance_payment: Number(patientForm.advance_payment) || 0,
      discount: Number(patientForm.discount) || 0,
      remaining_amount: balance,
      photo_url: patientForm.patient_image,
      age: patientForm.age ? Number(patientForm.age) : null,
      total_amount: Number(patientForm.total_amount) || 0,
      cash_method: patientForm.cash_method,
      surgeon_charge: Number(patientForm.surgeon_charge) || 0,
      anaesthetist_charge: Number(patientForm.anaesthetist_charge) || 0,
      assistant_charge: Number(patientForm.assistant_charge) || 0,
    };

    const request = editingPatientId
      ? supabase
        .from('patientDetailsTable')
        .update(patientPayload)
        .eq('id', editingPatientId)
      : supabase.from('patientDetailsTable').insert(patientPayload);

    const { error } = await request;

    if (error) {
      setPatientMessage(error.message);
      setPatientsLoading(false);
      return;
    }

    resetPatientForm();
    setShowPatientModal(false);
    await fetchPatients();
  };

  const handleEditPatient = (patient) => {
    setEditingPatientId(patient.id);
    setPatientForm({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      reg_no: patient.reg_no || '',
      bill_no: patient.bill_no || '',
      husband_name: patient.husband_name || '',
      gender: patient.gender || '',
      age: patient.age || '',
      cell_no: patient.phone || '',
      alternative_number: patient.alternative_number || '',
      address: patient.address || '',
      date_of_admission: patient.date_of_admission || '',
      diagnosis: patient.diagnosis || '',
      surgeon_name: patient.surgeon_name || '',
      anaesthetist_name: patient.anaesthetist_name || '',
      assistant_name: patient.assistant_name || '',
      package_amount: patient.package_amount || '',
      advance_payment: patient.advance_payment || '',
      discount: patient.discount || '',
      patient_image: patient.photo_url || '',
      total_amount: patient.total_amount || '',
      remaining_amount: patient.remaining_amount || '',
      cash_method: patient.cash_method || '',
      surgeon_charge: patient.surgeon_charge || '',
      anaesthetist_charge: patient.anaesthetist_charge || '',
      assistant_charge: patient.assistant_charge || '',
    });
    setPatientMessage('');
    setShowPatientModal(true);
  };

  const handlePrintClick = (patient) => {
    setSelectedPatient(patient);
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "Siddhartha Nursing Home";
    window.print();
    document.title = originalTitle;
  };

  const handleDeletePatient = async (patientId) => {
    setPatientMessage('');
    setPatientsLoading(true);

    const { error } = await supabase
      .from('patientDetailsTable')
      .delete()
      .eq('id', patientId);

    if (error) {
      setPatientMessage(error.message);
      setPatientsLoading(false);
      return;
    }

    if (editingPatientId === patientId) {
      resetPatientForm();
    }

    await fetchPatients();
  };

  if (!hasSupabaseConfig) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <h1>Supabase is not configured</h1>
          <p>Add your project URL and publishable key to .env.local.</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <LoginPage
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleLogin={handleLogin}
        handleSignUp={handleSignUp}
        loading={loading}
        message={message}
      />
    );
  }

  const totalPatients = patients.length;
  const monthlyPatients = patients.filter((p) => {
    if (!p.created_at) return false;
    const date = new Date(p.created_at);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    );
  }).length;

  const filteredPatients = patients.filter((p) =>
    p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery) ||
    p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.surgeon_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="app-shell" onClick={() => showProfileMenu && setShowProfileMenu(false)}>
      <Navbar
        session={session}
        userRole={userRole}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        handleLogout={handleLogout}
        loading={loading}
      />

      <div className="dashboard-layout">
        <Sidebar />

        <Dashboard
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resetPatientForm={resetPatientForm}
          setShowPatientModal={setShowPatientModal}
          totalPatients={totalPatients}
          monthlyPatients={monthlyPatients}
          patientsLoading={patientsLoading}
          filteredPatients={filteredPatients}
          userRole={userRole}
          handlePrintClick={handlePrintClick}
          handleEditPatient={handleEditPatient}
          handleDeletePatient={handleDeletePatient}
          showPatientModal={showPatientModal}
          editingPatientId={editingPatientId}
          patientForm={patientForm}
          handlePatientChange={handlePatientChange}
          handleImageChange={handleImageChange}
          handlePatientSubmit={handlePatientSubmit}
          patientMessage={patientMessage}
          masterDiagnoses={masterDiagnoses}
          masterStaff={masterStaff}
          showPrintModal={showPrintModal}
          selectedPatient={selectedPatient}
          handlePrint={handlePrint}
          setShowPrintModal={setShowPrintModal}
        />
      </div>
    </main>
  );
}

export default App;

