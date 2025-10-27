import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  DollarSign, 
  History, 
  TrendingUp,
  X,
  Calendar,
  ArrowRight,
  BarChart3,
  LogOut
} from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import Login from './Login';
import Dashboard from './Dashboard';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargandoAuth(false);
      if (user) {
        cargarClientes();
      }
    });

    return () => unsubscribe();
  }, []);

  // Cargar clientes desde Firestore
  const cargarClientes = async () => {
    try {
      setCargando(true);
      const querySnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setClientes([]);
      setVistaActual('dashboard');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  };

  // Agregar nuevo cliente
  const agregarCliente = async (nuevoCliente) => {
    try {
      const clienteData = {
        ...nuevoCliente,
        capitalActual: nuevoCliente.capitalInicial,
        totalPagado: 0,
        historial: [{
          tipo: 'inicio',
          fecha: new Date().toLocaleDateString('es-DO'),
          monto: nuevoCliente.capitalInicial,
          capitalDespues: nuevoCliente.capitalInicial
        }],
        userId: usuario.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'clientes'), clienteData);
      setClientes([...clientes, { ...clienteData, id: docRef.id }]);
      setMostrarFormulario(false);
      alert('Cliente agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      alert('Error al agregar cliente');
    }
  };

  // Registrar pago
  const registrarPago = async (clienteId, tipo, monto, interesPagado = 0, abonoCapital = 0) => {
    try {
      const cliente = clientes.find(c => c.id === clienteId);
      const nuevoCapital = cliente.capitalActual - abonoCapital;
      const nuevoTotal = cliente.totalPagado + monto;

      const nuevoHistorial = [...cliente.historial, {
        tipo,
        fecha: new Date().toLocaleDateString('es-DO'),
        hora: new Date().toLocaleTimeString('es-DO'),
        monto,
        interesPagado,
        abonoCapital,
        capitalDespues: nuevoCapital
      }];

      const clienteActualizado = {
        ...cliente,
        capitalActual: nuevoCapital,
        totalPagado: nuevoTotal,
        historial: nuevoHistorial
      };

      await updateDoc(doc(db, 'clientes', clienteId), {
        capitalActual: nuevoCapital,
        totalPagado: nuevoTotal,
        historial: nuevoHistorial
      });

      setClientes(clientes.map(c => c.id === clienteId ? clienteActualizado : c));
      alert('Pago registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
    }
  };

  // Reenganche
  const reenganche = async (clienteId, nuevoCapital) => {
    try {
      const cliente = clientes.find(c => c.id === clienteId);
      
      const nuevoHistorial = [...cliente.historial, {
        tipo: 'reenganche',
        fecha: new Date().toLocaleDateString('es-DO'),
        hora: new Date().toLocaleTimeString('es-DO'),
        capitalAnterior: cliente.capitalActual,
        capitalNuevo: nuevoCapital,
        capitalDespues: nuevoCapital
      }];

      await updateDoc(doc(db, 'clientes', clienteId), {
        capitalActual: nuevoCapital,
        capitalInicial: nuevoCapital,
        historial: nuevoHistorial
      });

      const clienteActualizado = {
        ...cliente,
        capitalActual: nuevoCapital,
        capitalInicial: nuevoCapital,
        historial: nuevoHistorial
      };

      setClientes(clientes.map(c => c.id === clienteId ? clienteActualizado : c));
      alert('Reenganche realizado exitosamente');
    } catch (error) {
      console.error('Error al hacer reenganche:', error);
      alert('Error al realizar el reenganche');
    }
  };

  // Eliminar cliente
  const eliminarCliente = async (clienteId) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      await deleteDoc(doc(db, 'clientes', clienteId));
      setClientes(clientes.filter(c => c.id !== clienteId));
      setClienteSeleccionado(null);
      alert('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      alert('Error al eliminar cliente');
    }
  };

  if (cargandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return <Login onLoginSuccess={() => cargarClientes()} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">Sistema de Préstamos</h1>
              <p className="text-gray-600">César Suárez</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{usuario.email}</span>
              <button
                onClick={cerrarSesion}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                <LogOut size={20} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setVistaActual('dashboard');
                setClienteSeleccionado(null);
              }}
              className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
                vistaActual === 'dashboard' 
                  ? 'bg-indigo-700' 
                  : 'hover:bg-indigo-700'
              }`}
            >
              <BarChart3 size={20} />
              Dashboard
            </button>
            <button
              onClick={() => {
                setVistaActual('clientes');
                setClienteSeleccionado(null);
              }}
              className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
                vistaActual === 'clientes' 
                  ? 'bg-indigo-700' 
                  : 'hover:bg-indigo-700'
              }`}
            >
              <Users size={20} />
              Clientes ({clientes.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {cargando ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : vistaActual === 'dashboard' ? (
          <Dashboard clientes={clientes} />
        ) : vistaActual === 'clientes' ? (
          <ListaClientes 
            clientes={clientes}
            onSeleccionar={(cliente) => {
              setClienteSeleccionado(cliente);
              setVistaActual('detalle');
            }}
            onAgregar={() => setMostrarFormulario(true)}
          />
        ) : vistaActual === 'detalle' && clienteSeleccionado ? (
          <DetalleCliente
            cliente={clienteSeleccionado}
            onVolver={() => {
              setVistaActual('clientes');
              setClienteSeleccionado(null);
            }}
            onRegistrarPago={registrarPago}
            onReenganche={reenganche}
            onEliminar={eliminarCliente}
          />
        ) : null}
      </main>

      {/* Modal Formulario Nuevo Cliente */}
      {mostrarFormulario && (
        <FormularioCliente
          onGuardar={agregarCliente}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}
    </div>
  );
}

// Componente Lista de Clientes
function ListaClientes({ clientes, onSeleccionar, onAgregar }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes Activos</h2>
        <button
          onClick={onAgregar}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
        >
          <PlusCircle size={20} />
          Nuevo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Users size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No hay clientes registrados</h3>
          <p className="text-gray-500 mb-6">Comienza agregando tu primer cliente</p>
          <button
            onClick={onAgregar}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Agregar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map(cliente => {
            const interes = cliente.capitalActual * (cliente.tasaInteres / 100);
            return (
              <div
                key={cliente.id}
                onClick={() => onSeleccionar(cliente)}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{cliente.nombre}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    cliente.tasaInteres === 5 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {cliente.tasaInteres}%
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capital:</span>
                    <span className="font-bold text-indigo-600">${cliente.capitalActual.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interés:</span>
                    <span className="font-bold text-orange-600">${interes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total pagado:</span>
                    <span className="font-bold text-green-600">${cliente.totalPagado.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
                  Ver Detalles
                  <ArrowRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Componente Detalle Cliente
function DetalleCliente({ cliente, onVolver, onRegistrarPago, onReenganche, onEliminar }) {
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarReenganche, setMostrarReenganche] = useState(false);

  const interes = cliente.capitalActual * (cliente.tasaInteres / 100);

  return (
    <div>
      <button
        onClick={onVolver}
        className="mb-6 text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
      >
        ← Volver a clientes
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{cliente.nombre}</h2>
            <p className="text-gray-600">
              Tasa: {cliente.tasaInteres}% {cliente.tasaInteres === 5 ? 'quincenal' : 'mensual'}
            </p>
          </div>
          <button
            onClick={() => onEliminar(cliente.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Eliminar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Capital Actual</p>
            <p className="text-2xl font-bold text-indigo-600">${cliente.capitalActual.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Interés a Cobrar</p>
            <p className="text-2xl font-bold text-orange-600">${interes.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
            <p className="text-2xl font-bold text-green-600">${cliente.totalPagado.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setMostrarPago(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <DollarSign size={20} />
            Registrar Pago
          </button>
          <button
            onClick={() => setMostrarReenganche(true)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <TrendingUp size={20} />
            Reenganche
          </button>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History size={24} />
          Historial de Operaciones
        </h3>

        <div className="space-y-3">
          {cliente.historial.slice().reverse().map((h, idx) => (
            <div key={idx} className="border-l-4 border-indigo-600 pl-4 py-2 bg-gray-50 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-gray-800">
                    {h.tipo === 'inicio' && '🎯 Préstamo Inicial'}
                    {h.tipo === 'interes' && '💰 Pago de Interés'}
                    {h.tipo === 'interes-capital' && '💎 Pago Interés + Capital'}
                    {h.tipo === 'reenganche' && '🔄 Reenganche'}
                  </span>
                  <p className="text-sm text-gray-600">
                    {h.fecha} {h.hora && `- ${h.hora}`}
                  </p>
                </div>
                <div className="text-right">
                  {h.tipo !== 'reenganche' && (
                    <p className="font-bold text-green-600">${h.monto?.toFixed(2)}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Capital: ${h.capitalDespues?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modales */}
      {mostrarPago && (
        <ModalPago
          cliente={cliente}
          onGuardar={onRegistrarPago}
          onCerrar={() => setMostrarPago(false)}
        />
      )}

      {mostrarReenganche && (
        <ModalReenganche
          cliente={cliente}
          onGuardar={onReenganche}
          onCerrar={() => setMostrarReenganche(false)}
        />
      )}
    </div>
  );
}

// Formulario Nuevo Cliente
function FormularioCliente({ onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    nombre: '',
    capitalInicial: '',
    tasaInteres: 5
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.capitalInicial) {
      alert('Por favor completa todos los campos');
      return;
    }
    onGuardar({
      ...form,
      capitalInicial: parseFloat(form.capitalInicial)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Nuevo Cliente</h3>
          <button onClick={onCancelar} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500 outline-none"
              placeholder="Nombre del cliente"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Capital Inicial</label>
            <input
              type="number"
              step="0.01"
              value={form.capitalInicial}
              onChange={(e) => setForm({...form, capitalInicial: e.target.value})}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tasa de Interés</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm({...form, tasaInteres: 5})}
                className={`py-3 rounded-lg font-semibold transition ${
                  form.tasaInteres === 5
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                5% Quincenal
              </button>
              <button
                type="button"
                onClick={() => setForm({...form, tasaInteres: 10})}
                className={`py-3 rounded-lg font-semibold transition ${
                  form.tasaInteres === 10
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                10% Mensual
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Pago
function ModalPago({ cliente, onGuardar, onCerrar }) {
  const [tipoPago, setTipoPago] = useState('interes');
  const [montoInteres, setMontoInteres] = useState('');
  const [abonoCapital, setAbonoCapital] = useState('');

  const interesCalculado = cliente.capitalActual * (cliente.tasaInteres / 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (tipoPago === 'interes') {
      const monto = parseFloat(montoInteres);
      if (!monto || monto <= 0) {
        alert('Ingresa un monto válido');
        return;
      }
      onGuardar(cliente.id, 'interes', monto, monto, 0);
    } else {
      const interes = parseFloat(montoInteres);
      const capital = parseFloat(abonoCapital);
      
      if (!interes || !capital || interes <= 0 || capital <= 0) {
        alert('Ingresa montos válidos');
        return;
      }
      
      if (capital > cliente.capitalActual) {
        alert('El abono no puede ser mayor al capital actual');
        return;
      }
      
      onGuardar(cliente.id, 'interes-capital', interes + capital, interes, capital);
    }
    
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Registrar Pago</h3>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">Interés calculado</p>
          <p className="text-2xl font-bold text-orange-600">${interesCalculado.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tipo de Pago</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTipoPago('interes')}
                className={`py-3 rounded-lg font-semibold transition ${
                  tipoPago === 'interes'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Solo Interés
              </button>
              <button
                type="button"
                onClick={() => setTipoPago('interes-capital')}
                className={`py-3 rounded-lg font-semibold transition ${
                  tipoPago === 'interes-capital'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Interés + Capital
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Monto Interés</label>
            <input
              type="number"
              step="0.01"
              value={montoInteres}
              onChange={(e) => setMontoInteres(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 outline-none"
              placeholder="0.00"
            />
          </div>

          {tipoPago === 'interes-capital' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Abono a Capital</label>
              <input
                type="number"
                step="0.01"
                value={abonoCapital}
                onChange={(e) => setAbonoCapital(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 outline-none"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-600 mt-1">
                Capital actual: ${cliente.capitalActual.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Reenganche
function ModalReenganche({ cliente, onGuardar, onCerrar }) {
  const [nuevoCapital, setNuevoCapital] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const capital = parseFloat(nuevoCapital);
    
    if (!capital || capital <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    
    onGuardar(cliente.id, capital);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Reenganche</h3>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">Capital actual</p>
          <p className="text-2xl font-bold text-indigo-600">${cliente.capitalActual.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nuevo Capital</label>
            <input
              type="number"
              step="0.01"
              value={nuevoCapital}
              onChange={(e) => setNuevoCapital(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-orange-500 outline-none"
              placeholder="0.00"
            />
            <p className="text-sm text-gray-500 mt-2">
              Este será el nuevo capital del préstamo
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold"
            >
              Reenganchar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
