const { test, expect } = require('@playwright/test');

async function registrarPaciente(page, name, email, phone) {
  await page.fill('#patient-name', name);
  await page.fill('#patient-email', email);
  await page.fill('#patient-phone', phone);
  await page.click('#patient-form button[type="submit"]');
}

async function agendarCita(page, { patientName, doctorName, date, time }) {
  await page.selectOption('#appointment-patient', { label: patientName });
  await page.selectOption('#appointment-doctor', { label: doctorName });
  await page.fill('#appointment-date', date);
  await page.fill('#appointment-time', time);
  await page.click('#appointment-form button[type="submit"]');
}

test.describe('Sistema de reserva de citas médicas', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:3000/api/testing/reset').catch(() => {});
    await page.goto('/');
  });

  test('flujo completo: registro de paciente y agendamiento exitoso', async ({ page }) => {
    await registrarPaciente(page, 'Paciente Exito', 'exito@test.com', '3001111222');
    await expect(page.locator('#messages')).toContainText('Paciente registrado correctamente');
    await expect(page.locator('#appointment-patient')).toContainText('Paciente Exito');

    await agendarCita(page, {
      patientName: 'Paciente Exito',
      doctorName: 'Dra. Pérez',
      date: '2025-12-06',
      time: '10:00'
    });

    await expect(page.locator('#appointments-table')).toContainText('Paciente Exito');
  });

  test('validación: campos vacíos', async ({ page }) => {
    await page.click('#patient-form button[type="submit"]');
    await expect(page.locator('#messages')).toContainText('Todos los campos son obligatorios');
  });

  test('intento de agendar cita en horario ocupado', async ({ page }) => {
    await registrarPaciente(page, 'Paciente A', 'a@test.com', '3002222333');
    await registrarPaciente(page, 'Paciente B', 'b@test.com', '3003333444');

await page.waitForSelector('#appointment-patient');

await expect(page.locator('#appointment-patient')).toContainText('Paciente A', { timeout: 8000 });

await expect(page.locator('#appointment-patient')).toContainText('Paciente B', { timeout: 8000 });
    await agendarCita(page, {
      patientName: 'Paciente A',
      doctorName: 'Dr. Gómez',
      date: '2025-12-06',
      time: '12:30'
    });

    await agendarCita(page, {
      patientName: 'Paciente B',
      doctorName: 'Dr. Gómez',
      date: '2025-12-06',
      time: '12:30'
    });

    await expect(page.locator('#messages')).toContainText('Horario no disponible para este doctor');
  });

  test('cancelación de cita', async ({ page }) => {
    await registrarPaciente(page, 'Paciente Cancelar', 'cancelar@test.com', '3005555666');
    await expect(page.locator('#appointment-patient')).toContainText('Paciente Cancelar');

    await agendarCita(page, {
      patientName: 'Paciente Cancelar',
      doctorName: 'Dra. Pérez',
      date: '2025-12-07',
      time: '09:00'
    });

    await expect(page.locator('#appointments-table')).toContainText('Paciente Cancelar');

    await page.click('#appointments-table tbody tr button.cancel-btn');
    await expect(page.locator('#messages')).toContainText('Cita cancelada');
  });
});


