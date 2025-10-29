import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  DollarSign, 
  History, 
  TrendingUp,
  X,
  ArrowRight,
  BarChart3,
  LogOut,
  Menu
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
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargandoAuth(false);
      if (user) cargarClientes();
    });
    return () => unsubscribe();
  }, []);

  // Cargar clientes
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

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setClientes([]);
      setVistaActual('dashboard');
    } catch (error) {
      alert('Error al cerrar sesión');
    }
  };

  // Agregar nuevo cliente
  const agregarCliente = async (nuevoCliente) => {
    try {
      const clienteData = {
        ...nuevoCliente,
        tasaInteres: 5,
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
      const clienteActualizado = { ...cliente, capitalActual: nuevoCapital, totalPagado: nuevoTotal, historial: nuevoHistorial };
      await updateDoc(doc(db, 'clientes', clienteId), {
        capitalActual: nuevoCapital,
        totalPagado: nuevoTotal,
        historial: nuevoHistorial
      });
      setClientes(clientes.map(c => c.id === clienteId ? clienteActualizado : c));
      if (clienteSeleccionado?.id === clienteId) setClienteSeleccionado(clienteActualizado);
      alert('Pago registrado exitosamente');
    } catch (error) {
      alert('Error al registrar el pago');
    }
  };

  // Reenganche
  const reenganche = async (clienteId, montoReenganche) => {
    try {
      const cliente = clientes.find(c => c.id === clienteId);
      const nuevoCapital = cliente.capitalActual + montoReenganche;
      const nuevoHistorial = [...cliente.historial, {
        tipo: 'reenganche',
        fecha: new Date().toLocaleDateString('es-DO'),
        hora: new Date().toLocaleTimeString('es-DO'),
        capitalAnterior: cliente.capitalActual,
        montoReenganche,
        capitalDespues: nuevoCapital
      }];
      await updateDoc(doc(db, 'clientes', clienteId), {
        capitalActual: nuevoCapital,
        historial: nuevoHistorial
      });
      const clienteActualizado = { ...cliente, capitalActual: nuevoCapital, historial: nuevoHistorial };
      setClientes(prev => prev.map(c => c.id === clienteId ? clienteActualizado : c));
      setClienteSeleccionado(clienteActualizado);
      alert('Reenganche realizado exitosamente');
    } catch (error) {
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
    } catch {
      alert('Error al eliminar cliente');
    }
  };

  if (cargandoAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!usuario) return <Login onLoginSuccess={() => cargarClientes()} />;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header responsive */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-900 truncate">
                Sistema de Préstamos
              </h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">César Suárez</p>
            </div>
            
            {/* Desktop user info */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-700 truncate max-w-[200px]">{usuario.email}</span>
              <button 
                onClick={cerrarSesion} 
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <LogOut size={18} /> 
                <span className="hidden lg:inline">Salir</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Mobile menu dropdown */}
          {menuAbierto && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-700 truncate">{usuario.email}</span>
                <button 
                  onClick={cerrarSesion} 
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition justify-center"
                >
                  <LogOut size={18} /> Salir
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Navigation responsive */}
      <nav className="bg-indigo-600 text-white sticky top-[73px] sm:top-[81px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button 
              onClick={() => { setVistaActual('dashboard'); setClienteSeleccionado(null); setMenuAbierto(false); }}
              className={`px-4 sm:px-6 py-3 font-semibold flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                vistaActual === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <BarChart3 size={18} className="sm:w-5 sm:h-5" /> 
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Inicio</span>
            </button>
            <button 
              onClick={() => { setVistaActual('clientes'); setClienteSeleccionado(null); setMenuAbierto(false); }}
              className={`px-4 sm:px-6 py-3 font-semibold flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                vistaActual === 'clientes' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <Users size={18} className="sm:w-5 sm:h-5" /> 
              Clientes ({clientes.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
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

      {mostrarFormulario && (
        <FormularioCliente 
          onGuardar={agregarCliente} 
          onCancelar={() => setMostrarFormulario(false)} 
        />
      )}
    </div>
  );
}

// Lista de Clientes responsive
function ListaClientes({ clientes, onSeleccionar, onAgregar }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Clientes Activos</h2>
        <button 
          onClick={onAgregar} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
        >
          <PlusCircle size={20} /> Nuevo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center">
          <Users size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No hay clientes registrados</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">Comienza agregando tu primer cliente</p>
          <button 
            onClick={onAgregar} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            <PlusCircle size={20} /> Agregar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {clientes.map(cliente => {
            const tasa = cliente.tasaInteres || 5;
            const capital = cliente.capitalActual || 0;
            const interes = capital * (tasa / 100);
            return (
              <div 
                key={cliente.id} 
                onClick={() => onSeleccionar(cliente)} 
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate flex-1 pr-2">
                    {cliente.nombre || 'Sin nombre'}
                  </h3>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
                    {tasa}%
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capital:</span>
                    <span className="font-bold text-indigo-600">${capital.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interés:</span>
                    <span className="font-bold text-orange-600">${interes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total pagado:</span>
                    <span className="font-bold text-green-600">${cliente.totalPagado?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm">
                  Ver Detalles <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Detalle Cliente responsive
function DetalleCliente({ cliente, onVolver, onRegistrarPago, onReenganche, onEliminar }) {
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarReenganche, setMostrarReenganche] = useState(false);

  const tasa = cliente?.tasaInteres ?? 5;
  const capital = cliente?.capitalActual ?? 0;
  const interes = capital * (tasa / 100);
  const historial = Array.isArray(cliente.historial) ? cliente.historial : [];

  return (
    <div>
      <button
        onClick={onVolver}
        className="mb-4 sm:mb-6 text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 text-sm sm:text-base"
      >
        ← Volver a clientes
      </button>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
              {cliente.nombre || 'Sin nombre'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Tasa: {tasa}% quincenal</p>
          </div>
          <button
            onClick={() => onEliminar(cliente.id)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
          >
            Eliminar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Capital Actual</p>
            <p className="text-xl sm:text-2xl font-bold text-indigo-600">${capital.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Interés a Cobrar</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">${interes.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pagado</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">${cliente.totalPagado?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setMostrarPago(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <DollarSign size={20} />
            Registrar Pago
          </button>
          <button
            onClick={() => setMostrarReenganche(true)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <TrendingUp size={20} />
            Reenganche
          </button>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History size={20} className="sm:w-6 sm:h-6" />
          Historial de Operaciones
        </h3>

        {historial.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-500">Sin movimientos aún</p>
        ) : (
          <div className="space-y-3">
            {historial.slice().reverse().map((h, idx) => (
              <div key={idx} className="border-l-4 border-indigo-600 pl-3 sm:pl-4 py-2 bg-gray-50 rounded">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 text-sm sm:text-base block">
                      {h.tipo === 'inicio' && '🎯 Préstamo Inicial'}
                      {h.tipo === 'interes' && '💰 Pago de Interés'}
                      {h.tipo === 'interes-capital' && '💎 Pago Interés + Capital'}
                      {h.tipo === 'reenganche' && '🔄 Reenganche'}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {h.fecha} {h.hora && `- ${h.hora}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {h.tipo !== 'reenganche' && (
                      <p className="font-bold text-green-600 text-sm sm:text-base">
                        ${h.monto?.toFixed(2) || '0.00'}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600">
                      Capital: ${h.capitalDespues?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mostrarPago && (
        <ModalPago cliente={cliente} onGuardar={onRegistrarPago} onCerrar={() => setMostrarPago(false)} />
      )}
      {mostrarReenganche && (
        <ModalReenganche cliente={cliente} onGuardar={onReenganche} onCerrar={() => setMostrarReenganche(false)} />
      )}
    </div>
  );
}

// Formulario de nuevo cliente responsive
function FormularioCliente({ onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState('');
  const [capitalInicial, setCapitalInicial] = useState('');

  const guardar = () => {
    if (!nombre || !capitalInicial) {
      alert('Por favor completa todos los campos');
      return;
    }
    onGuardar({ nombre, capitalInicial: parseFloat(capitalInicial) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Nuevo Cliente</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
        />
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <button 
            onClick={onCerrar} 
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm sm:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
          <input
            type="number"
            placeholder="Capital inicial"
            value={capitalInicial}
            onChange={(e) => setCapitalInicial(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <button 
            onClick={onCancelar} 
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para pago responsive
function ModalPago({ cliente, onGuardar, onCerrar }) {
  const [monto, setMonto] = useState('');
  const [abonoCapital, setAbonoCapital] = useState('');

  const guardar = () => {
    if (!monto && !abonoCapital) {
      alert('Debe ingresar al menos un monto');
      return;
    }
    const montoNum = parseFloat(monto || 0);
    const abonoNum = parseFloat(abonoCapital || 0);
    onGuardar(cliente.id, abonoNum > 0 ? 'interes-capital' : 'interes', montoNum + abonoNum, montoNum, abonoNum);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Registrar Pago</h3>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Monto de interés"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
          <input
            type="number"
            placeholder="Abono a capital (opcional)"
            value={abonoCapital}
            onChange={(e) => setAbonoCapital(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <button 
            onClick={onCerrar} 
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para reenganche responsive
function ModalReenganche({ cliente, onGuardar, onCerrar }) {
  const [monto, setMonto] = useState('');

  const guardar = () => {
    if (!monto) {
      alert('Ingrese el monto del reenganche');
      return;
    }
    onGuardar(cliente.id, parseFloat(monto));
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Reenganche</h3>
        <input
          type="number"
          placeholder="Monto a reenganchar"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 sm:py
