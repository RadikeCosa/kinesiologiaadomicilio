# Screenshots

Guardar acá solo screenshots sanitizadas antes de usar este repo como pieza fuerte de portfolio.

Capturas privadas usadas en `README.md`:

- `admin-dashboard.png`
- `admin-patients.png`
- `admin-patient-detail.png`
- `admin-treatment.png`
- `admin-encounters.png`

Capturas públicas opcionales:

- `public-home.png`
- `public-services.png`
- `public-evaluar.png`

No se embeben en el `README.md` principal porque la landing pública ya puede verse directamente en Vercel y no conviene duplicar ahí previews del sitio público.

Capturas pendientes:

- Ninguna por ahora. Si se agregan nuevas vistas privadas, tienen que cumplir el mismo nivel de sanitización antes de entrar al repo.

Estado actual:

- `public-home.png`: landing pública portfolio-safe, disponible online en Vercel.
- `public-services.png`: vista pública de servicios y FAQs, mantenida solo como referencia documental opcional.
- `public-evaluar.png`: flujo público guiado para orientar la consulta, mantenido solo como referencia documental opcional.
- `admin-dashboard.png`: dashboard privado/local capturado contra HAPI FHIR dev/test en `http://localhost:8081/fhir`.
- `admin-patients.png`: listado privado de pacientes con datos ficticios y accesos operativos.
- `admin-patient-detail.png`: detalle privado de paciente con datos demográficos y de contacto sanitizados.
- `admin-treatment.png`: vista privada de contexto de tratamiento capturada con dataset demo en `8081`.
- `admin-encounters.png`: vista privada de encuentros y seguimiento funcional con notas clínicas ficticias.
- No existe demo pública editable de `/admin`.
- `/admin` no debe describirse como producción ni como sandbox online.
- Las capturas privadas actuales fueron revisadas para evitar datos reales identificables.

Reglas:

- Usar solo datos ficticios o completamente sanitizados.
- No exponer nombres reales de pacientes, DNI, teléfonos, direcciones ni notas clínicas.
- No exponer nombres reales de familiares ni otra información sensible no ficticia.
- Preferir capturas hechas con fixtures descartables o datasets demo seguros.
- Si el flujo privado sigue dependiendo de HAPI FHIR local, aclararlo en el README en lugar de sugerir un demo público de `/admin`.
- No subir capturas tomadas contra el entorno local-real `http://localhost:8080/fhir`.
