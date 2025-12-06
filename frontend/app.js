const API = '/api';

const messagesDiv = document.getElementById('messages');
const patientForm = document.getElementById('patient-form');
const appointmentForm = document.getElementById('appointment-form');
const patientSelect = document.getElementById('appointment-patient');
const doctorSelect = document.getElementById('appointment-doctor');
const appointmentsTableBody = document.querySelector('#appointments-table tbody');

function setMessage(text, type = 'info') {
  messagesDiv.textContent = text || '';
  messagesDiv.className = 'messages';
  if (type === 'error') messagesDiv.classList.add('error');
  if (type === 'success') messagesDiv.classList.add('success');
}

async function loadDoctors() {
  try {
    const res = await fetch(`${API}/doctors`);
    const doctors = await res.json();

    doctorSelect.innerHTML = '';
    doctors.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name;
      doctorSelect.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
    setMessage('Error cargando doctores', 'error');
  }
}

async function loadPatients() {
  try {
    const res = await fetch(`${API}/patients`);
    const patients = await res.json();

    patientSelect.innerHTML = '';
    patients.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      patientSelect.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
    setMessage('Error cargando pacientes', 'error');
  }
}

async function loadAppointments() {
  try {
    const res = await fetch(`${API}/appointments`);
    const appointments = await res.json();

    appointmentsTableBody.innerHTML = '';
    appointments.forEach((a) => {
      const tr = document.createElement('tr');

      const tdPatient = document.createElement('td');
      tdPatient.textContent = a.patient?.name ?? '';

      const tdDoctor = document.createElement('td');
      tdDoctor.textContent = a.doctor?.name ?? '';

      const tdDate = document.createElement('td');
      tdDate.textContent = a.date;

      const tdTime = document.createElement('td');
      tdTime.textContent = a.time;

      const tdAction = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'cancel-btn';
      btn.textContent = 'Cancelar';
      btn.dataset.id = a.id;
      btn.addEventListener('click', async () => {
        try {
          const resDel = await fetch(`${API}/appointments/${a.id}`, {
            method: 'DELETE'
          });
          const data = await resDel.json();
          if (!resDel.ok) {
            setMessage(data.error || 'Error al cancelar cita', 'error');
            return;
          }
          setMessage('Cita cancelada', 'success');
          loadAppointments();
        } catch (e) {
          console.error(e);
          setMessage('Error al cancelar cita', 'error');
        }
      });

      tdAction.appendChild(btn);

      tr.appendChild(tdPatient);
      tr.appendChild(tdDoctor);
      tr.appendChild(tdDate);
      tr.appendChild(tdTime);
      tr.appendChild(tdAction);

      appointmentsTableBody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    setMessage('Error cargando citas', 'error');
  }
}

patientForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameInput = document.getElementById('patient-name');
  const emailInput = document.getElementById('patient-email');
  const phoneInput = document.getElementById('patient-phone');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name || !email || !phone) {
    setMessage('Todos los campos son obligatorios', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setMessage('Email inválido', 'error');
    return;
  }

  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length !== phone.length) {
    setMessage('El teléfono solo puede contener números', 'error');
    return;
  }
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    setMessage('El teléfono debe tener entre 7 y 15 dígitos', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone })
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Error al registrar paciente', 'error');
      return;
    }

    setMessage('Paciente registrado correctamente', 'success');

    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
    nameInput.focus();

    await loadPatients();
  } catch (e) {
    console.error(e);
    setMessage('Error de red al registrar paciente', 'error');
  }
});

appointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const patientId = patientSelect.value;
  const doctorId = doctorSelect.value;
  const date = document.getElementById('appointment-date').value;
  const time = document.getElementById('appointment-time').value;

  if (!patientId || !doctorId || !date || !time) {
    setMessage('Todos los campos de la cita son obligatorios', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, doctorId, date, time })
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Error al crear cita', 'error');
      return;
    }

    setMessage('Cita creada correctamente', 'success');
    await loadAppointments();
  } catch (e) {
    console.error(e);
    setMessage('Error de red al crear cita', 'error');
  }
});

(async function init() {
  await loadDoctors();
  await loadPatients();
  await loadAppointments();
})();