# Guía de Contribución a Git X 🚀

¡Gracias por tu interés en contribuir a Git X! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Funcionalidades](#solicitar-funcionalidades)

## 🤝 Código de Conducta

Este proyecto sigue un código de conducta para asegurar un ambiente acogedor para todos. Al participar, se espera que mantengas un comportamiento respetuoso y constructivo.

## 🚀 Cómo Contribuir

### 1. Fork y Clone

1. **Fork** el repositorio en GitHub
2. **Clone** tu fork localmente:
   ```bash
   git clone https://github.com/tu-usuario/git-x.git
   cd git-x
   ```

### 2. Configurar el Repositorio Remoto

```bash
git remote add upstream https://github.com/mauriciorossdev/git-x.git
git fetch upstream
```

### 3. Crear una Rama

```bash
git checkout -b feature/nombre-de-tu-funcionalidad
# o
git checkout -b fix/descripcion-del-bug
```

### 4. Hacer Cambios

- Realiza tus cambios siguiendo los [estándares de código](#estándares-de-código)
- Asegúrate de que los tests pasen
- Actualiza la documentación si es necesario

### 5. Commit y Push

```bash
git add .
git commit -m "feat: agregar nueva funcionalidad de exportación"
git push origin feature/nombre-de-tu-funcionalidad
```

### 6. Crear Pull Request

1. Ve a tu fork en GitHub
2. Haz clic en "Compare & pull request"
3. Completa la plantilla del PR
4. Asigna revisores si es necesario

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- **Node.js**: 18.0.0 o superior
- **npm**: 8.0.0 o superior (o yarn)
- **Git**: 2.30.0 o superior
- **GitHub CLI**: Para testing de funcionalidades (opcional)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/mauriciorossdev/git-x.git
cd git-x

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
```

### Scripts Disponibles

```bash
# Desarrollo
npm start              # Ejecutar en modo desarrollo
npm run build          # Construir para producción
npm run package        # Empaquetar aplicación
npm run make           # Crear distributables

# Linting y Testing
npm run lint           # Ejecutar ESLint
npm run lint:fix       # Corregir errores de linting automáticamente
```

## 📝 Estándares de Código

### TypeScript

- Usa TypeScript para todo el código
- Define tipos explícitos para props y funciones
- Evita `any` - usa tipos específicos

### React

- Usa componentes funcionales con hooks
- Mantén componentes pequeños y enfocados
- Usa `React.FC` para componentes
- Props interface debe empezar con el nombre del componente

### Estilo de Código

- Sigue las reglas de ESLint configuradas
- Usa Prettier para formateo (si está configurado)
- Nombres descriptivos para variables y funciones
- Comentarios en español para lógica compleja

### Ejemplo de Componente

```typescript
interface GitAccountFormProps {
  onSubmit: (account: GitAccount) => void;
  onCancel: () => void;
  initialData?: Partial<GitAccount>;
}

const GitAccountForm: React.FC<GitAccountFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  // Componente implementation
};
```

### Estructura de Archivos

```
src/
├── components/          # Componentes React
│   ├── GitAccountForm.tsx
│   └── ...
├── contexts/           # Contextos de React
├── services/           # Servicios y lógica de negocio
├── types/              # Definiciones de TypeScript
└── utils/              # Utilidades compartidas
```

## 🔄 Proceso de Pull Request

### Antes de Enviar

- [ ] El código sigue los estándares del proyecto
- [ ] Los tests pasan (si existen)
- [ ] La documentación está actualizada
- [ ] No hay conflictos con la rama principal
- [ ] El commit message sigue el formato convencional

### Formato de Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar funcionalidad de exportación JSON
fix: corregir error en validación de email
docs: actualizar README con nuevas instrucciones
style: formatear código según estándares
refactor: simplificar lógica de autenticación
test: agregar tests para GitAccountForm
```

### Plantilla de Pull Request

```markdown
## 📝 Descripción
Breve descripción de los cambios realizados.

## 🔗 Tipo de Cambio
- [ ] Bug fix (cambio que corrige un problema)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación (cambio solo en documentación)

## ✅ Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código en áreas difíciles de entender
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban que mi fix es efectivo
- [ ] Los tests nuevos y existentes pasan localmente

## 🧪 Testing
Describe las pruebas que realizaste para verificar tus cambios.

## 📸 Screenshots (si aplica)
Agrega screenshots para mostrar los cambios visuales.

## 📋 Información Adicional
Cualquier información adicional que los revisores necesiten saber.
```

## 🐛 Reportar Bugs

### Usando GitHub Issues

1. Ve a la pestaña "Issues" del repositorio
2. Haz clic en "New issue"
3. Selecciona "Bug report"
4. Completa la plantilla

### Información Requerida

- **Descripción clara** del problema
- **Pasos para reproducir** el bug
- **Comportamiento esperado** vs **comportamiento actual**
- **Screenshots** si aplica
- **Información del sistema**:
  - OS: macOS/Windows/Linux
  - Node.js version
  - Versión de la aplicación

### Ejemplo de Bug Report

```markdown
**Describe el bug**
Al intentar generar una nueva clave SSH, la aplicación se cierra inesperadamente.

**Pasos para reproducir**
1. Ir a la pestaña "Claves SSH"
2. Hacer clic en "Generar Nueva Clave"
3. Completar el formulario
4. Hacer clic en "Generar"
5. La aplicación se cierra

**Comportamiento esperado**
La clave SSH debería generarse correctamente y mostrarse en la lista.

**Screenshots**
[Agregar screenshots si aplica]

**Información del sistema**
- OS: macOS 13.0
- Node.js: 18.17.0
- Versión: 1.0.0
```

## 💡 Solicitar Funcionalidades

### Usando GitHub Issues

1. Ve a la pestaña "Issues"
2. Haz clic en "New issue"
3. Selecciona "Feature request"
4. Completa la plantilla

### Información Requerida

- **Descripción clara** de la funcionalidad
- **Problema que resuelve** o **valor que agrega**
- **Alternativas consideradas** (si las hay)
- **Contexto adicional** relevante

## 🏷️ Etiquetas de Issues

- `bug`: Algo no funciona como debería
- `enhancement`: Nueva funcionalidad o mejora
- `documentation`: Mejoras o adiciones a la documentación
- `good first issue`: Bueno para nuevos contribuidores
- `help wanted`: Se necesita ayuda extra
- `question`: Más información es requerida

## 🎯 Áreas de Contribución

### Para Nuevos Contribuidores

- [ ] Mejorar documentación
- [ ] Agregar tests
- [ ] Corregir typos
- [ ] Mejorar accesibilidad
- [ ] Optimizar performance

### Para Contribuidores Experimentados

- [ ] Nuevas funcionalidades
- [ ] Refactoring de código
- [ ] Mejoras de arquitectura
- [ ] Integración con nuevas APIs
- [ ] Optimizaciones de build

## 📞 Obtener Ayuda

- **Discusiones**: Usa GitHub Discussions para preguntas generales
- **Issues**: Para bugs y feature requests
- **Email**: [tu-email@example.com] para asuntos privados

## 🙏 Reconocimientos

¡Gracias a todos los contribuidores que hacen posible Git X! Tu esfuerzo es muy apreciado.

---

**¿Tienes preguntas?** No dudes en abrir un issue o contactarnos. ¡Estamos aquí para ayudar! 🚀
