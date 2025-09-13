# Git X - Integración con GitHub CLI

## 🚀 Nueva Funcionalidad: Login con GitHub CLI

Git X ahora incluye integración completa con GitHub CLI (`gh`) para una autenticación más segura y automatizada.

## ✨ Características

- **Login automático**: Autenticación web con códigos de una sola vez
- **Configuración automática**: Git se configura automáticamente con tu cuenta
- **Manejo de múltiples cuentas**: Cambia fácilmente entre diferentes cuentas de GitHub
- **Interfaz intuitiva**: Proceso paso a paso con indicadores visuales
- **Información completa**: Documentación integrada sobre GitHub CLI

## 🔐 Proceso de Login

### 1. Iniciar Login
- Haz clic en el botón **"🔐 Login con GitHub CLI"**
- Se abrirá un modal con el proceso de autenticación

### 2. Autenticación Web
- El sistema verificará que GitHub CLI esté instalado
- Se abrirá tu navegador para la autenticación con GitHub
- GitHub te proporcionará un código de una sola vez

### 3. Verificación del Código
- Copia el código de una sola vez de tu terminal
- Pégalo en el campo del modal
- Haz clic en "✅ Verificar Código"

### 4. Configuración Automática
- El sistema configurará Git automáticamente
- Tu cuenta será agregada a la lista de cuentas
- La cuenta se activará automáticamente

## 📥 Instalación de GitHub CLI

### macOS
```bash
brew install gh
```

### Windows
```bash
winget install GitHub.cli
```

### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

## 🛠️ Comandos Útiles

Una vez instalado GitHub CLI, puedes usar estos comandos:

```bash
# Ver estado de autenticación
gh auth status

# Login manual (si prefieres usar la terminal)
gh auth login

# Cerrar sesión
gh auth logout

# Crear repositorio
gh repo create

# Crear pull request
gh pr create
```

## 🔄 Flujo de Trabajo Recomendado

1. **Primera vez**: Instala GitHub CLI siguiendo las instrucciones
2. **Login inicial**: Usa el botón "🔐 Login con GitHub CLI" en Git X
3. **Cambio de cuenta**: Si necesitas cambiar de cuenta, usa el mismo proceso
4. **Gestión**: Usa Git X para manejar múltiples cuentas y claves SSH

## 🎯 Ventajas sobre el Login Manual

| Aspecto | Login Manual | GitHub CLI |
|---------|-------------|------------|
| **Seguridad** | Contraseñas en texto plano | Códigos de una sola vez |
| **Configuración** | Manual paso a paso | Automática |
| **Múltiples cuentas** | Complejo de manejar | Fácil cambio |
| **Integración** | Separado de Git | Integrado nativamente |
| **Automatización** | No disponible | Scripts y flujos |

## 🚨 Solución de Problemas

### GitHub CLI no está instalado
- Sigue las instrucciones de instalación para tu sistema operativo
- Reinicia tu terminal después de la instalación

### Error de autenticación
- Verifica que el código de una sola vez sea correcto
- Asegúrate de que no haya espacios extra
- Intenta el proceso nuevamente

### Problemas de configuración Git
- Verifica que Git esté instalado en tu sistema
- Asegúrate de tener permisos para configurar Git globalmente

## 📚 Recursos Adicionales

- [Sitio oficial de GitHub CLI](https://cli.github.com/)
- [Manual completo](https://cli.github.com/manual/)
- [Repositorio en GitHub](https://github.com/cli/cli)
- [Guía de instalación](https://github.com/cli/cli#installation)

## 🔮 Próximas Funcionalidades

- **Sincronización automática**: Sincronizar cuentas con GitHub CLI
- **Gestión de tokens**: Manejo de tokens de acceso personal
- **Integración con repositorios**: Operaciones directas en repositorios
- **Backup automático**: Respaldo automático de configuraciones

---

## 💡 Consejos de Uso

1. **Mantén GitHub CLI actualizado** para obtener las últimas funcionalidades
2. **Usa HTTPS** como protocolo preferido para mayor compatibilidad
3. **Verifica el estado** de autenticación regularmente con `gh auth status`
4. **Combina con Git X** para un manejo completo de cuentas y claves SSH

¡Disfruta de una experiencia Git más fluida y segura con Git X y GitHub CLI! 🎉
