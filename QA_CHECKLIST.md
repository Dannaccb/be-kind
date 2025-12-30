# QA Checklist - be kind network

Lista de verificación funcional para la aplicación be kind network.

## ✅ Autenticación (Login)

### 1. Login Exitoso
- [* ] Ingresar credenciales válidas (`a.berrio@yopmail.com` / `AmuFK8G4Bh64Q1uX+IxQhw==`)
- [ ] Verificar que se muestra un loader durante la autenticación
- [ ] Verificar que se muestra mensaje de éxito (toast)
- [ ] Verificar que se redirige al Dashboard después del login
- [ ] Verificar que el token se guarda en localStorage

### 2. Login con Credenciales Inválidas
- [ ] Intentar login con email incorrecto
- [ ] Verificar que se muestra mensaje de error claro
- [ ] Verificar que NO se redirige al Dashboard
- [ ] Verificar que el formulario permanece visible

### 3. Validaciones del Formulario de Login
- [ ] Intentar enviar formulario vacío
- [ ] Verificar que se muestran mensajes de error para campos requeridos
- [ ] Ingresar email con formato inválido (ej: "test@")
- [ ] Verificar que se muestra error de formato de email
- [ ] Verificar que el botón de login está deshabilitado durante la carga

### 4. Funcionalidad de Mostrar/Ocultar Contraseña
- [ ] Verificar que el campo de contraseña está oculto por defecto
- [ ] Hacer clic en el ícono de ojo
- [ ] Verificar que la contraseña se muestra
- [ ] Hacer clic nuevamente
- [ ] Verificar que la contraseña se oculta

## ✅ Dashboard - Listado de Acciones

### 5. Carga Inicial del Dashboard
- [ ] Verificar que se muestra un loader mientras cargan las acciones
- [ ] Verificar que la tabla se muestra con datos después de cargar
- [ ] Verificar que se muestran las columnas correctas (Nombre, Icono, Estado, Descripción, Fecha, Acciones)
- [ ] Verificar que el token se envía en el header de la petición

### 6. Paginación
- [ ] Verificar que se muestra el número total de resultados
- [ ] Verificar que se muestra el rango actual (ej: "1-10 de 40")
- [ ] Hacer clic en el botón "Siguiente" (⏩)
- [ ] Verificar que se cargan los siguientes 10 resultados
- [ ] Hacer clic en el botón "Anterior" (⏪)
- [ ] Verificar que se cargan los resultados anteriores
- [ ] Cambiar el tamaño de página a 20
- [ ] Verificar que se muestran 20 resultados por página
- [ ] Verificar que la paginación se reinicia a la página 1

### 7. Búsqueda
- [ ] Ingresar un término de búsqueda en el campo "Buscar"
- [ ] Verificar que la tabla se filtra en tiempo real
- [ ] Verificar que solo se muestran acciones que coinciden con el término
- [ ] Limpiar el campo de búsqueda
- [ ] Verificar que se muestran todas las acciones nuevamente

### 8. Estados del Dashboard
- [ ] Simular un error de red (desconectar internet)
- [ ] Verificar que se muestra un mensaje de error
- [ ] Verificar que aparece un botón "Reintentar"
- [ ] Si no hay acciones, verificar que se muestra un mensaje de "No hay acciones disponibles"

## ✅ Crear Acción

### 9. Formulario de Creación
- [ ] Navegar a "Crear Acción" desde el Dashboard
- [ ] Verificar que se abre un drawer/modal
- [ ] Verificar que todos los campos están presentes:
  - Nombre de la acción*
  - Descripción*
  - Logo*
  - Color*
  - Estado (toggle)
- [ ] Intentar enviar el formulario vacío
- [ ] Verificar que se muestran mensajes de error para campos requeridos

### 10. Validaciones del Formulario
- [ ] Ingresar nombre con menos de 3 caracteres
- [ ] Verificar que se muestra error de longitud mínima
- [ ] Ingresar descripción con menos de 10 caracteres
- [ ] Verificar que se muestra error de longitud mínima
- [ ] Ingresar descripción con más de 300 caracteres
- [ ] Verificar que se muestra error y contador de caracteres en rojo
- [ ] Ingresar color con formato HEX inválido
- [ ] Verificar que se muestra error de formato

### 11. Creación Exitosa de Acción
- [ ] Llenar todos los campos requeridos correctamente
- [ ] Seleccionar una imagen para el icono (JPG, PNG o SVG)
- [ ] Verificar que se muestra preview de la imagen seleccionada
- [ ] Seleccionar un color usando el selector de color
- [ ] Verificar que el toggle de estado funciona
- [ ] Enviar el formulario
- [ ] Verificar que se muestra un loader durante el envío
- [ ] Verificar que se muestra mensaje de éxito (toast)
- [ ] Verificar que se cierra el drawer y se redirige al Dashboard
- [ ] Verificar que la nueva acción aparece en el listado (o se refresca)

### 12. Cancelar Creación
- [ ] Abrir el formulario de creación
- [ ] Llenar algunos campos
- [ ] Hacer clic en "Cancelar" o en la X
- [ ] Verificar que se cierra el drawer sin guardar
- [ ] Verificar que se regresa al Dashboard

## ✅ Navegación y Rutas Protegidas

### 13. Protección de Rutas
- [ ] Cerrar sesión
- [ ] Intentar acceder directamente a `/dashboard` en la URL
- [ ] Verificar que se redirige automáticamente a `/login`
- [ ] Hacer login nuevamente
- [ ] Verificar que se puede acceder al Dashboard

### 14. Navegación del Sidebar
- [ ] Verificar que el sidebar muestra todos los elementos de menú
- [ ] Hacer clic en diferentes elementos del menú
- [ ] Verificar que el elemento activo se resalta
- [ ] Verificar que "Cerrar sesión" funciona correctamente

### 15. Persistencia de Sesión
- [ ] Hacer login exitoso
- [ ] Recargar la página (F5)
- [ ] Verificar que la sesión se mantiene
- [ ] Verificar que se permanece en el Dashboard sin necesidad de login nuevamente

## ✅ Notificaciones y Feedback

### 16. Toast Notifications
- [ ] Verificar que los mensajes de éxito se muestran como toast verde
- [ ] Verificar que los mensajes de error se muestran como toast rojo
- [ ] Verificar que los toasts desaparecen automáticamente después de 3 segundos
- [ ] Verificar que se pueden cerrar manualmente haciendo clic

## 📊 Resumen de Pruebas

- **Total de pruebas**: 16 escenarios principales
- **Categorías**: 
  - Autenticación: 4 pruebas
  - Dashboard: 4 pruebas
  - Crear Acción: 4 pruebas
  - Navegación: 3 pruebas
  - Notificaciones: 1 prueba

## 🐛 Problemas Conocidos

- Los botones de editar y eliminar en la tabla no tienen funcionalidad implementada (solo UI)
- El botón de "Ver" acción no tiene funcionalidad implementada

## ✅ Criterios de Aceptación

Una prueba se considera exitosa si:
1. La funcionalidad se comporta como se describe
2. No hay errores en la consola del navegador
3. La UI responde correctamente a las interacciones
4. Los mensajes de error/success son claros y útiles

