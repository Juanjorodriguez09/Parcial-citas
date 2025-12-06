# TESTING — Pruebas End-to-End del Sistema de Citas Médicas

Este documento describe brevemente las técnicas de selección de datos utilizadas y los casos de prueba implementados para validar el sistema de reserva de citas médicas.



## 1. Técnicas de selección de datos

### 1.1 Partición de equivalencia

Se agrupan los datos en clases donde se espera el mismo comportamiento. Se definieron las siguientes:

- Pacientes válidos: nombre, email y teléfono con formato correcto.
- Pacientes inválidos: campos vacíos o con formato incorrecto.
- Citas válidas: paciente existente, doctor existente, fecha y hora válidas, horario libre.
- Citas inválidas: intento de agendar con mismo doctor, misma fecha y misma hora (solapamiento).


### 1.2 Valores límite

Se probaron valores frontera en:

- Teléfono:
  - Mínimo: 7 dígitos.
  - Máximo: 15 dígitos.
  - Menos de 7 dígitos o más de 15 se consideran inválidos.
- Solapamiento de citas:
  - Se usa la misma fecha y hora para el mismo doctor para verificar que el sistema rechaza el horario repetido.

### 1.3 Datos válidos e inválidos

Se utilizaron explícitamente datos:

- Válidos: que permiten completar el flujo normal (registro y agendamiento).
- Inválidos: que deben activar mensajes de error (campos vacíos, formato de email incorrecto, horario de cita ocupado).

---

## 2. Casos de prueba E2E implementados

Las pruebas se implementaron con Playwright en el archivo `e2e/tests/citas.e2e.spec.js`.

### Caso 1: Flujo completo de registro y agendamiento exitoso

- Técnica: datos válidos y partición de equivalencia.
- Datos:
  - Paciente: nombre, email y teléfono válidos.
  - Doctor: uno de los doctores precargados.
  - Cita: fecha y hora válidas.
- Resultado esperado:
  - Se muestra mensaje de éxito en el registro del paciente.
  - El paciente aparece en la lista de selección.
  - La cita se crea y el paciente aparece en la tabla de citas.

### Caso 2: Validación de campos vacíos en registro de paciente

- Técnica: datos inválidos y partición de equivalencia.
- Datos:
  - Formulario de paciente enviado completamente vacío.
- Resultado esperado:
  - Se muestra el mensaje: “Todos los campos son obligatorios”.

### Caso 3: Intento de agendar cita en horario ya ocupado

- Técnicas: partición de equivalencia y valores límite sobre la regla de solapamiento.
- Datos:
  - Dos pacientes válidos diferentes.
  - Mismo doctor.
  - Misma fecha y misma hora.
- Resultado esperado:
  - La primera cita se registra.
  - El segundo intento con el mismo doctor, fecha y hora muestra el mensaje:
    - “Horario no disponible para este doctor”.

### Caso 4: Cancelación de cita

- Técnica: datos válidos.
- Datos:
  - Paciente válido.
  - Cita válida creada para ese paciente.
- Resultado esperado:
  - La cita aparece en la tabla.
  - Al pulsar “Cancelar”, se elimina la cita y se muestra el mensaje:
    - “Cita cancelada”.

---

## 3. Herramientas

- Framework de pruebas E2E: Playwright.
- Las pruebas se ejecutan con el comando:
  - `npm run test:e2e`
- El backend se levanta automáticamente mediante la configuración de `playwright.config.js`.