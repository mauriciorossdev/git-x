# Gestor de Claves SSH - Git X

Esta funcionalidad te permite generar y gestionar claves SSH directamente desde la aplicación Git X.

## Características

- **Generación de claves SSH**: Soporta ED25519 (recomendado), RSA y ECDSA
- **Gestión de múltiples claves**: Organiza tus claves por nombre (personal, trabajo, etc.)
- **Exportación a JSON**: Guarda toda la información de tus claves en formato JSON
- **Interfaz intuitiva**: Formulario simple para generar nuevas claves
- **Visualización completa**: Ve tanto la clave pública como privada

## Cómo usar

### 1. Generar una nueva clave SSH

1. Ve a la pestaña "Claves SSH"
2. Haz clic en "Nueva Clave SSH"
3. Completa el formulario:
   - **Nombre**: Un nombre descriptivo (ej: "personal", "trabajo", "github")
   - **Tipo**: Selecciona el tipo de clave (ED25519 es recomendado)
   - **Email**: Tu dirección de email
   - **Ruta del archivo**: Donde se guardará la clave (se sugiere automáticamente)
4. Haz clic en "Generar Clave SSH"

### 2. Ver detalles de las claves

- Haz clic en "Ver Detalles" para cualquier clave
- Verás tanto la clave pública como privada
- Puedes copiar cada una al portapapeles
- Se muestra el comando exacto que se ejecutó

### 3. Exportar a JSON

- Haz clic en "Exportar JSON" para descargar todas las claves
- El archivo incluye toda la información necesaria
- Útil para respaldos o migraciones

## Estructura del JSON exportado

```json
[
  {
    "id": "1703123456789",
    "name": "Personal",
    "type": "ed25519",
    "email": "tu_email@example.com",
    "filePath": "/Users/usuario/.ssh/id_ed25519_personal",
    "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...",
    "privateKey": "-----BEGIN OPENSSH PRIVATE KEY-----\n...",
    "createdAt": "2023-12-21T10:30:00.000Z"
  }
]
```

## Comandos SSH generados

La aplicación genera automáticamente comandos como:

```bash
# Para ED25519
ssh-keygen -t ed25519 -C "tu_email@example.com" -f ~/.ssh/id_ed25519_personal

# Para RSA
ssh-keygen -t rsa -C "tu_email@example.com" -f ~/.ssh/id_rsa_trabajo

# Para ECDSA
ssh-keygen -t ecdsa -C "tu_email@example.com" -f ~/.ssh/id_ecdsa_github
```

## Tipos de claves soportados

- **ED25519**: Clave moderna y segura (recomendada)
- **RSA**: Clave tradicional, compatible con sistemas antiguos
- **ECDSA**: Clave elíptica, buena seguridad

## Seguridad

- Las claves privadas se muestran solo cuando solicitas ver los detalles
- Puedes eliminar claves de la lista sin afectar los archivos del sistema
- La exportación incluye solo la información de la aplicación

## Notas técnicas

- Las claves se generan usando el comando `ssh-keygen` del sistema
- Los archivos se guardan en el directorio `~/.ssh/` por defecto
- La aplicación verifica que las claves se generen correctamente
- Soporte para macOS, Linux y Windows
