import { Socket } from "socket.io";
import socketIO from "socket.io";
import { UsuariosLista } from "../classes/usuarios-lista";
import { Usuario } from "../classes/usuario";
import { mapa } from "../routes/router";
import { Marcador } from "../classes/marcador";

export const UsuariosConectados = new UsuariosLista();

export const conectarCliente = (cliente: Socket, io: socketIO.Server) => {
  const usuario = new Usuario(cliente.id);
  UsuariosConectados.agregar(usuario);
};

export const desconectar = (cliente: Socket, io: socketIO.Server) => {
  cliente.on("disconnect", () => {
    console.log("Cliente desconectado");
    UsuariosConectados.borrarUsuario(cliente.id);

    io.emit("usuarios-activos", UsuariosConectados.getLista());
  });
};

//Escuchar mensajes
export const mensaje = (cliente: Socket, io: socketIO.Server) => {
  cliente.on("mensaje", (payload: { de: string; cuerpo: string }) => {
    console.log("Mensaje recibido: ", payload);
    io.emit("mensaje-nuevo", payload);
  });
};

//Configurar usuario - login
export const configurarUsuario = (cliente: Socket, io: socketIO.Server) => {
  cliente.on(
    "configurar-usuario",
    (payload: { nombre: string }, callback: Function) => {
      //console.log("usuario configurado recibido: ", payload);
      UsuariosConectados.actualizarNombre(cliente.id, payload.nombre);
      io.emit("usuarios-activos", UsuariosConectados.getLista());
      //io.emit("mensaje-nuevo", payload);
      callback({
        ok: true,
        mensaje: `Usuario ${payload.nombre} configurado`,
      });
    }
  );
};

//Obtener usuarios

export const obtenerUsuarios = (cliente: Socket, io: socketIO.Server) => {
  cliente.on("obtener-usuarios", () => {
    io.to(cliente.id).emit("usuarios-activos", UsuariosConectados.getLista());
  });
};

//Mapa marcadores
export const nuevoMarcador = (cliente: Socket, io: socketIO.Server) => {
  cliente.on("agregar-marcador", (marcador) => {
    mapa.agregarMarcador(marcador);
    cliente.broadcast.emit("agregar-marcador", marcador);
  });
};

export const borrarMarcador = (cliente: Socket, io: socketIO.Server) => {
  cliente.on("marcador-borrar", (id: string) => {
    mapa.borrarMarcador(id);
    cliente.broadcast.emit("marcador-borrar", id);
  });
};

export const moverMarcador = (cliente: Socket, io: socketIO.Server) => {
  cliente.on("marcador-mover", (marcador: Marcador) => {
    mapa.moverMarcador(marcador);
    cliente.broadcast.emit("marcador-mover", marcador);
  });
};
