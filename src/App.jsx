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

  // Reenganche (suma el monto al capital existente)
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
      setClientes(clientes.map(c => c.id === clienteId ? clienteActualizado : c));
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
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">Sistema de Préstamos</h1>
            <p className="text-gray-600">César Suárez</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{usuario.email}</span>
            <button onClick={cerrarSesion} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              <LogOut size={20} /> Salir
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          <button onClick={() => { setVistaActual('dashboard'); setClienteSeleccionado(null); }}
            className={`px-6 py-3 font-semibold flex items-center gap-2 ${vistaActual === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>
            <BarChart3 size={20} /> Dashboard
          </button>
          <button onClick={() => { setVistaActual('clientes'); setClienteSeleccionado(null); }}
            className={`px-6 py-3 font-semibold flex items-center gap-2 ${vistaActual === 'clientes' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>
            <Users size={20} /> Clientes ({clientes.length})
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {cargando ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : vistaActual === 'dashboard' ? (
          <Dashboard clientes={clientes} />
        ) : vistaActual === 'clientes' ? (
          <ListaClientes clientes={clientes} onSeleccionar={(cliente) => { setClienteSeleccionado(cliente); setVistaActual('detalle'); }} onAgregar={() => setMostrarFormulario(true)} />
        ) : vistaActual === 'detalle' && clienteSeleccionado ? (
          <DetalleCliente cliente={clienteSeleccionado} onVolver={() => { setVistaActual('clientes'); setClienteSeleccionado(null); }}
            onRegistrarPago={registrarPago} onReenganche={reenganche} onEliminar={eliminarCliente} />
        ) : null}
      </main>

      {mostrarFormulario && (
        <FormularioCliente onGuardar={agregarCliente} onCancelar={() => setMostrarFormulario(false)} />
      )}
    </div>
  );
}

// ✅ Lista de Clientes corregida
function ListaClientes({ clientes, onSeleccionar, onAgregar }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes Activos</h2>
        <button onClick={onAgregar} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
          <PlusCircle size={20} /> Nuevo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Users size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No hay clientes registrados</h3>
          <p className="text-gray-500 mb-6">Comienza agregando tu primer cliente</p>
          <button onClick={onAgregar} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2">
            <PlusCircle size={20} /> Agregar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map(cliente => {
            const tasa = cliente.tasaInteres ? cliente.tasaInteres : 5;
            const capital = cliente.capitalActual ? cliente.capitalActual : 0;
            const interes = capital * (tasa / 100);
            return (
              <div key={cliente.id} onClick={() => onSeleccionar(cliente)} className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{cliente.nombre || 'Sin nombre'}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">{tasa}%</span>
                </div>
                <div className="space-y-2 text-sm">
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
                <button className="w-full mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
                  Ver Detalles <ArrowRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Formulario de nuevo cliente (solo 5% quincenal)
function FormularioCliente({ onGuardar, onCancelar }) {
  const [form, setForm] = useState({ nombre: '', capitalInicial: '', tasaInteres: 5 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.capitalInicial) return alert('Por favor completa todos los campos');
    onGuardar({ ...form, capitalInicial: parseFloat(form.capitalInicial) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Nuevo Cliente</h3>
          <button onClick={onCancelar} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500 outline-none" placeholder="Nombre del cliente" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Capital Inicial</label>
            <input type="number" step="0.01" value={form.capitalInicial} onChange={(e) => setForm({...form, capitalInicial: e.target.value})}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500 outline-none" placeholder="0.00" />
          </div>
          <div className="bg-indigo-50 text-indigo-700 p-4 rounded-lg font-semibold text-center">
            Tasa de Interés: 5% Quincenal
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onCancelar} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
