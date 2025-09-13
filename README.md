# Git X 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Administrador de cuentas Git con integración completa de GitHub CLI y gestión de claves SSH**

Git X es una aplicación Electron moderna que te permite gestionar múltiples cuentas Git, claves SSH y autenticarte fácilmente con GitHub CLI para una experiencia Git más fluida y segura.

## ✨ Características Principales

### 🔐 Gestión de Cuentas Git
- **Múltiples cuentas**: Maneja varias cuentas Git simultáneamente
- **Cambio rápido**: Activa/desactiva cuentas con un solo clic
- **Configuración automática**: Git se configura automáticamente al cambiar de cuenta
- **Exportación**: Exporta tus cuentas en formato JSON

### 🔑 Gestión de Claves SSH
- **Generación automática**: Crea claves SSH RSA de 4096 bits
- **Múltiples claves**: Maneja diferentes claves para diferentes servicios
- **Exportación segura**: Exporta claves públicas para agregar a GitHub/GitLab
- **Validación**: Verifica que las claves sean válidas

### 🚀 Integración con GitHub CLI
- **Login automático**: Autenticación web con códigos de una sola vez
- **Configuración automática**: Git se configura automáticamente con tu cuenta
- **Manejo de múltiples cuentas**: Cambia fácilmente entre diferentes cuentas de GitHub
- **Interfaz intuitiva**: Proceso paso a paso con indicadores visuales

## 🎯 Casos de Uso

- **Desarrolladores**: Cambiar entre cuentas personales y de trabajo
- **Equipos**: Manejar múltiples proyectos con diferentes configuraciones
- **DevOps**: Automatizar la configuración de Git en diferentes entornos
- **Estudiantes**: Gestionar proyectos académicos y personales

## 🚀 Inicio Rápido

### 1. Instalación
```bash
# Clonar el repositorio
git clone https://github.com/mauriciorossdev/git-x.git
cd git-x

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
```

### 2. Primera Cuenta
1. Haz clic en **"🔐 Login con GitHub CLI"** para autenticación automática
2. O usa **"➕ Agregar Nueva Cuenta"** para configuración manual
3. Completa la información de tu cuenta Git
4. ¡Listo! Tu cuenta está configurada

### 3. Generar Claves SSH
1. Ve a la pestaña **"Claves SSH"**
2. Haz clic en **"🔑 Generar Nueva Clave"**
3. Elige el tipo de clave (RSA 4096 bits recomendado)
4. Exporta la clave pública y agrégala a GitHub/GitLab

## 🔧 Tecnologías

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Electron
- **Build**: Vite
- **Gestión de estado**: React Hooks
- **Almacenamiento**: localStorage (configurable para persistencia)

## 📱 Capturas de Pantalla

### Dashboard Principal
- Vista general de cuentas activas
- Estado actual de Git
- Acceso rápido a todas las funcionalidades

### Gestión de Cuentas
- Lista de todas las cuentas configuradas
- Indicadores de estado activo/inactivo
- Acciones rápidas (activar, eliminar, exportar)

### Login con GitHub CLI
- Proceso paso a paso de autenticación
- Verificación de códigos de una sola vez
- Configuración automática de Git

### Gestión de Claves SSH
- Generación automática de claves
- Validación y exportación
- Manejo de múltiples claves

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm start            # Ejecutar en modo desarrollo
npm run package      # Empaquetar aplicación
npm run make         # Crear distributables
npm run publish      # Publicar aplicación

# Linting
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de linting
```

## 🔐 Configuración de GitHub CLI

Para usar la funcionalidad de login automático, necesitas tener GitHub CLI instalado:

### macOS
```bash
brew install gh
```

### Windows
```bash
winget install GitHub.cli
```

### Linux
```bash
# Ver instrucciones completas en README-GitHub-CLI.md
```

## 📚 Documentación

- **[README-GitHub-CLI.md](README-GitHub-CLI.md)**: Guía completa de GitHub CLI
- **[README-SSH.md](README-SSH.md)**: Documentación de gestión de claves SSH
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Guía para contribuir al proyecto
- **[SECURITY.md](SECURITY.md)**: Política de seguridad y reporte de vulnerabilidades

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestra [Guía de Contribución](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **GitHub CLI**: Por la excelente herramienta de línea de comandos
- **Electron**: Por el framework de aplicaciones de escritorio
- **React**: Por la biblioteca de interfaz de usuario
- **Tailwind CSS**: Por el framework de CSS utilitario

## 🔮 Roadmap

- [ ] **Sincronización en la nube**: Backup automático de configuraciones
- [ ] **Integración con repositorios**: Operaciones directas en repositorios
- [ ] **Gestión de tokens**: Manejo de tokens de acceso personal
- [ ] **Temas personalizables**: Múltiples temas visuales
- [ ] **Plugins**: Sistema de plugins para funcionalidades adicionales
- [ ] **Multiplataforma**: Soporte completo para Windows y Linux

---

## 💡 Consejos de Uso

1. **Usa GitHub CLI** para la autenticación más segura
2. **Genera claves SSH** de 4096 bits para mayor seguridad
3. **Exporta regularmente** tus configuraciones como respaldo
4. **Mantén actualizado** GitHub CLI para las últimas funcionalidades

## 🚨 Solución de Problemas

### Problemas Comunes

#### GitHub CLI no está instalado
```bash
# Verificar instalación
gh --version

# Instalar si no está presente
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
```

#### Error de permisos en macOS
```bash
# Dar permisos de accesibilidad
# Ir a: Preferencias del Sistema > Seguridad y Privacidad > Accesibilidad
# Agregar Terminal y/o la aplicación Git X
```

#### Problemas con claves SSH
```bash
# Verificar permisos de archivos SSH
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_*

# Verificar agente SSH
ssh-add -l
```

### Obtener Ayuda

- 📖 **Documentación**: Revisa los archivos README específicos
- 🐛 **Reportar Bugs**: [GitHub Issues](https://github.com/mauriciorossdev/git-x/issues)
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/mauriciorossdev/git-x/discussions)
- 🔒 **Seguridad**: [SECURITY.md](SECURITY.md) para reportes de seguridad

## 📊 Estadísticas del Proyecto

![GitHub stars](https://img.shields.io/github/stars/mauriciorossdev/git-x?style=social)
![GitHub forks](https://img.shields.io/github/forks/mauriciorossdev/git-x?style=social)
![GitHub issues](https://img.shields.io/github/issues/mauriciorossdev/git-x)
![GitHub pull requests](https://img.shields.io/github/issues-pr/mauriciorossdev/git-x)

¡Disfruta de una experiencia Git más fluida y segura con Git X! 🎉

---

*Desarrollado con ❤️ para la comunidad de desarrolladores*
