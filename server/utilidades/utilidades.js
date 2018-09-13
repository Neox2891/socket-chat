const crearMensaje = (usuario, mensaje) => {

    return {
        usuario,
        mensaje,
        fecha: new Date().getTime()
    }

}

module.exports = {
    crearMensaje
}