import React, { useState } from 'react';
import { Lock, Mail, User, LogIn, UserPlus } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export default function Login({ onLoginSuccess }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [formulario, setFormulario] = useState({
    email: '',
    password: '',
    confirmarPassword: ''
  });

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      if (esRegistro) {
        // Validaciones para registro
        if (formulario.password.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres');
          setCargando(false);
          return;
        }

        if (formulario.password !== formulario.confirmarPassword) {
          alert('Las contraseñas no coinciden');
          setCargando(false);
          return;
        }

        // Registrar nuevo usuario
        await createUserWithEmailAndPassword(auth, formulario.email, formulario.password);
        alert('¡Cuenta creada exitosamente! Bienvenido');
        onLoginSuccess();
      } else {
        // Iniciar sesión
        await signInWithEmailAndPassword(auth, formulario.email, formulario.password);
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      
      // Mensajes de error personalizados
      let mensaje = 'Usuario o contraseña incorrecta';
      
      if (error.code === 'auth/invalid-email') {
        mensaje = 'Correo electrónico inválido';
      } else if (error.code === 'auth/user-not-found') {
        mensaje = 'Usuario o contraseña incorrecta';
      } else if (error.code === 'auth/wrong-password') {
        mensaje = 'Usuario o contraseña incorrecta';
      } else if (error.code === 'auth/email-already-in-use') {
        mensaje = 'Este correo ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'La contraseña es muy débil';
      } else if (error.code === 'auth/invalid-credential') {
        mensaje = 'Usuario o contraseña incorrecta';
      }
      
      alert(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-indigo-900">
            Sistema de Préstamos
          </h1>
          <p className="text-gray-600 mt-2">César Suárez</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setEsRegistro(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              !esRegistro
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <LogIn className="inline mr-2" size={18} />
            Iniciar Sesión
          </button>
          <button
            onClick={() => setEsRegistro(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              esRegistro
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <UserPlus className="inline mr-2" size={18} />
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              <Mail className="inline mr-2" size={18} />
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={formulario.email}
              onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none transition"
              placeholder="tu@email.com"
              disabled={cargando}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              <Lock className="inline mr-2" size={18} />
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formulario.password}
              onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none transition"
              placeholder="••••••••"
              disabled={cargando}
            />
          </div>

          {/* Confirmar Password (solo en registro) */}
          {esRegistro && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <Lock className="inline mr-2" size={18} />
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                value={formulario.confirmarPassword}
                onChange={(e) => setFormulario({ ...formulario, confirmarPassword: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none transition"
                placeholder="••••••••"
                disabled={cargando}
              />
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={cargando}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 ${
              cargando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {cargando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : esRegistro ? (
              <>
                <UserPlus size={20} />
                Crear Cuenta
              </>
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {esRegistro ? (
            <p>
              Al registrarte, podrás acceder al sistema completo de gestión de préstamos
            </p>
          ) : (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setEsRegistro(true)}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Regístrate aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
