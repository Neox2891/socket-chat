// back-end

const { io } = require('../server');
const { Usuario } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

let usuarios = new Usuario();

io.on('connection', (client) => {

    client.on('entrarChat', (data, cb) => {

        if (!data.nombre || !data.sala) {
            cb({
                ok: false,
                msg: 'El nombre y sala es requerido'
            });
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listasPersonas', usuarios.getPersonasPorSala(data.sala));

        cb(usuarios.getPersonasPorSala(data.sala));
    });

    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);

        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Admin', `${ personaBorrada.nombre } salió`));
        client.broadcast.to(personaBorrada.sala).emit('listasPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));

    });

    client.on('mensajePrivado', data => {

        if (!data.para) {
            throw new Error('El (id) de la parsona es necesario!');
        }

        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    });

});