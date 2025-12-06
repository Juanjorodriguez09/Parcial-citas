const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../frontend')));

async function seedDoctors() {
  const count = await prisma.doctor.count();
  if (count === 0) {
    await prisma.doctor.createMany({
      data: [
        { name: 'Dra. Pérez' },
        { name: 'Dr. Gómez' }
      ]
    });
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

function isValidPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}


app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({ orderBy: { id: 'asc' } });
    res.json(doctors);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/patients', async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: 'Teléfono inválido' });
  }

  try {
    const patient = await prisma.patient.create({
      data: { name, email, phone }
    });
    res.status(201).json(patient);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({ orderBy: { id: 'asc' } });
    res.json(patients);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { patientId, doctorId, date, time } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const pid = Number(patientId);
  const did = Number(doctorId);

  try {
    const patient = await prisma.patient.findUnique({ where: { id: pid } });
    const doctor = await prisma.doctor.findUnique({ where: { id: did } });

    if (!patient) return res.status(400).json({ error: 'Paciente no válido' });
    if (!doctor) return res.status(400).json({ error: 'Doctor no válido' });

    const existing = await prisma.appointment.findFirst({
      where: { doctorId: did, date, time }
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: 'Horario no disponible para este doctor' });
    }

    const appointment = await prisma.appointment.create({
      data: { date, time, patientId: pid, doctorId: did }
    });

    res.status(201).json(appointment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      include: { patient: true, doctor: true }
    });
    res.json(appointments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Cancelar cita
app.delete('/api/appointments/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.appointment.delete({ where: { id } });
    res.json({ message: 'Cita cancelada' });
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/testing/reset', async (req, res) => {
  try {
    await prisma.appointment.deleteMany();
    await prisma.patient.deleteMany();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error reseteando BD de prueba' });
  }
});

seedDoctors().catch(console.error);

module.exports = app;