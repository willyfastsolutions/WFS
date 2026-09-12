# WillyFastSolutions - Local Development & Replication Guide

Esta guía explica cómo ejecutar, probar y desarrollar de forma 100% local en tu computadora antes de subir cambios a producción o a GitHub.

---

## 1. Arquitectura Local

El entorno local está diseñado para ser completamente independiente, seguro y rápido:

* **Backend**: FastAPI corriendo en `http://localhost:8000`
  - Documentación interactiva Swagger en: `http://localhost:8000/docs`
  - Base de datos local: SQLite en `backend/willyfast.db` (espejo exacto de producción)
  - Simulación de correos (`MOCK_SMTP=True`): Muestra el contenido de los correos en la terminal sin enviar emails reales a clientes mientras desarrollas.
* **Frontend**: Next.js 16 corriendo en `http://localhost:3000`
  - Detecta automáticamente el entorno local y redirige todas las llamadas al backend local `http://localhost:8000`.

---

## 2. Iniciar el Entorno Local en 1 Clic

Tienes dos opciones para iniciar tanto el frontend como el backend automáticamente:

### Opción A (Recomendada - Doble Clic):
Haz doble clic en el archivo:
```text
start_local.bat
```
Esto abrirá dos terminales (una para el Backend y otra para el Frontend) y abrirá automáticamente tu navegador en `http://localhost:3000`.

### Opción B (Desde PowerShell):
```powershell
.\start_local.ps1
```

### Opción C (Manual en dos terminales):
* **Terminal 1 (Backend)**:
  ```powershell
  cd backend
  .\venv\Scripts\python run.py
  ```
* **Terminal 2 (Frontend)**:
  ```powershell
  cd frontend
  npm run dev
  ```

---

## 3. Credenciales de Acceso Local

* **Superadministrador**:
  - **Email**: `admin@willyfastsolutions.com`
  - **Contraseña**: `admin1234`
* **Administrador Empresa Apex Logistics**:
  - **Email**: `admin@apex.com`
  - **Contraseña**: `admin1234`
* **Administrador Empresa Titan Mining**:
  - **Email**: `admin@titan.com`
  - **Contraseña**: `admin1234`

---

## 4. Replicar Datos Reales de Producción a Local

Si en producción se crearon nuevas empresas, maquinaria, checklists o historiales y quieres tener los datos idénticos en tu entorno local para hacer pruebas:

Ejecuta en tu terminal:
```powershell
backend\venv\Scripts\python replicate_prod_to_local.py
```

**¿Qué hace este comando?**
1. Crea una copia de seguridad automática de tu base de datos local en `backend/backups/`.
2. Se conecta a la base de datos de producción (Supabase PostgreSQL).
3. Clona todas las empresas, máquinas, checklists, usuarios, registros de mantenimiento y auditorías en tu SQLite local (`backend/willyfast.db`).
4. Puedes hacer pruebas, borrar y editar máquinas en local sin ningún riesgo de afectar los datos reales de los clientes en producción.

---

## 5. Desplegar a Producción cuando termines tus cambios locales

Una vez que hayas probado y validado tus cambios en local:

1. **Guarda y sube a GitHub**:
   ```powershell
   git add -A
   git commit -m "Descripción de los cambios"
   git push origin main
   ```

2. **Despliega en caliente al servidor VPS**:
   ```powershell
   backend\venv\Scripts\python deploy_to_prod.py
   ```
   *Este comando compilará el frontend con `npm run build`, empaquetará el código estático, subirá los archivos del backend al VPS `2.24.203.120` y reiniciará los servicios automáticamente en menos de 30 segundos.*
