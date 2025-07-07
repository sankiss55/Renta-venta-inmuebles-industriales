
const URL_BASE = "https://yofibox.com/api_aura/archivos/";
function send_gmail(event) { 
    event.preventDefault(); 

    let formData = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        correo: document.getElementById('email').value,
        mensaje: document.getElementById('mensaje').value,
        interes: document.getElementById('interes').value
    };

    // Validar datos
    const errors = validateForm(formData);
    if (errors.length > 0) {
        Swal.fire({
            title: "Por favor corrija los siguientes errores:",
            html: errors.join('<br>'),
            icon: "warning",
            draggable: true
        });
        return;
    }

    const dialog = document.getElementById("dialog_video");
    if(dialog) {
        dialog.classList.add('active');
    }
   
    axios.post(URL_BASE+"envio_gmail.php", formData)
    .then(response => {
        if(dialog) {
            dialog.classList.remove('active');
        }
        setTimeout(()=>{

    if(response.data.respuesta){
      Swal.fire({
  title: "El mensaje se ha enviado correctamente",
  icon: "success",
  draggable: true
});

    }else{
Swal.fire({
  title: "Lo sentimos la conexion no es estable, intente mas tarde",
  icon: "error",
  draggable: true
});
    }
    
    }, 2000);
    }).catch(function(error){
        if(dialog) {
            dialog.classList.remove('active');
        }
        Swal.fire({
            title: "Lo sentimos la conexion no es estable, intente mas tarde",
            icon: "error",
            draggable: true
        });
    })
}

  function validateForm(data) {
    const errors = [];
    
    // Validar nombre
    if (!data.nombre || data.nombre.trim().length < 3) {
        errors.push("El nombre debe tener al menos 3 caracteres");
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.correo || !emailRegex.test(data.correo)) {
        errors.push("Ingrese un correo electrónico válido");
    }
    
    // Validar teléfono (10 dígitos)
    const phoneRegex = /^\d{10}$/;
    if (!data.telefono || !phoneRegex.test(data.telefono)) {
        errors.push("Ingrese un número de teléfono válido (10 dígitos)");
    }
    
    // Validar mensaje
    if (!data.mensaje || data.mensaje.trim().length < 10) {
        errors.push("El mensaje debe tener al menos 10 caracteres");
    }
    
    // Validar interés
    if (!data.interes || data.interes.trim() === "") {
        errors.push("Seleccione un tipo de interés");
    }
    
    return errors;
}
