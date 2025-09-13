# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nuevas funcionalidades que están en desarrollo

### Changed
- Cambios en funcionalidades existentes

### Deprecated
- Funcionalidades que serán removidas en futuras versiones

### Removed
- Funcionalidades removidas en esta versión

### Fixed
- Corrección de bugs

### Security
- Mejoras de seguridad

## [1.0.0] - 2024-12-21

### Added
- 🚀 **Lanzamiento inicial de Git X**
- 🔐 **Gestión de cuentas Git múltiples**
  - Agregar, editar y eliminar cuentas Git
  - Cambio rápido entre cuentas activas
  - Exportación de configuraciones en formato JSON
  - Validación de datos de entrada

- 🔑 **Generador y gestor de claves SSH**
  - Soporte para ED25519, RSA y ECDSA
  - Generación automática de claves de 4096 bits
  - Gestión de múltiples claves por nombre
  - Exportación de claves públicas y privadas
  - Validación de claves generadas

- 🚀 **Integración completa con GitHub CLI**
  - Login automático con códigos de una sola vez
  - Configuración automática de Git
  - Manejo de múltiples cuentas de GitHub
  - Interfaz paso a paso con indicadores visuales
  - Verificación de instalación de GitHub CLI

- 🎨 **Interfaz de usuario moderna**
  - Diseño responsivo con Tailwind CSS
  - Tema oscuro/claro con persistencia
  - Componentes React con TypeScript
  - Interfaz intuitiva y accesible

- 🛠️ **Funcionalidades técnicas**
  - Aplicación Electron multiplataforma
  - Build con Vite para desarrollo rápido
  - Linting con ESLint y TypeScript
  - Configuración de Electron Forge para distribución

### Technical Details
- **Frontend**: React 19.1.1 + TypeScript + Tailwind CSS
- **Backend**: Electron 37.3.0
- **Build**: Vite 5.4.19
- **Linting**: ESLint con reglas TypeScript
- **Platforms**: macOS (ARM64), Windows, Linux

### Documentation
- README completo con guías de instalación
- Documentación específica para GitHub CLI
- Guía de gestión de claves SSH
- Guía de contribución para desarrolladores
- Política de seguridad y reporte de vulnerabilidades

## [0.1.0] - 2024-12-20

### Added
- 🏗️ **Configuración inicial del proyecto**
  - Estructura base de Electron + React + TypeScript
  - Configuración de Vite para desarrollo
  - Setup de Tailwind CSS
  - Configuración de ESLint

- 📦 **Dependencias principales**
  - Electron Forge para empaquetado
  - React y React DOM
  - TypeScript y tipos
  - Tailwind CSS y plugins

---

## Notas de Versión

### Convenciones de Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/):
- **MAJOR** (X.0.0): Cambios incompatibles en la API
- **MINOR** (0.X.0): Nueva funcionalidad compatible
- **PATCH** (0.0.X): Corrección de bugs compatible

### Tipos de Cambios

- **Added**: Nueva funcionalidad
- **Changed**: Cambios en funcionalidad existente
- **Deprecated**: Funcionalidad que será removida
- **Removed**: Funcionalidad removida
- **Fixed**: Corrección de bugs
- **Security**: Mejoras de seguridad

### Formato de Fechas

Las fechas siguen el formato [ISO 8601](https://es.wikipedia.org/wiki/ISO_8601): YYYY-MM-DD

---

*Para más información sobre el proyecto, visita el [README](README.md) principal.*
