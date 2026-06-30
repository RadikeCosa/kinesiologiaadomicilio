# Screenshots

Guardar acá solo screenshots sanitizadas antes de usar este repo como pieza fuerte de portfolio.

Capturas disponibles hoy:

- `public-home.png`
- `public-services.png`
- `public-evaluar.png`
- `admin-dashboard.png`

Pendientes solo si existe una versión igual de segura:

- `admin-patient-detail.png`
- `admin-encounters.png`
- `admin-patients.png`
- `admin-treatment.png`

Estado actual:

- `public-home.png`: landing pública desplegable y portfolio-safe.
- `public-services.png`: vista pública de servicios y FAQs.
- `public-evaluar.png`: flujo público guiado para orientar la consulta.
- `admin-dashboard.png`: dashboard privado/local capturado contra HAPI FHIR dev/test en `http://localhost:8081/fhir`.
- No existe demo pública editable de `/admin`.
- No se agregaron capturas profundas de pacientes porque las rutas revisadas mostraban nombres, DNI, teléfonos, direcciones o contenido clínico.

Reglas:

- Usar solo datos ficticios o completamente sanitizados.
- No exponer nombres reales de pacientes, DNI, teléfonos, direcciones ni notas clínicas.
- Preferir capturas hechas con fixtures descartables o con un futuro mock/demo mode seguro.
- Si el flujo privado sigue dependiendo de HAPI FHIR local, aclararlo en el README en lugar de sugerir un demo público de `/admin`.
- No subir capturas tomadas contra el entorno local-real `http://localhost:8080/fhir`.
