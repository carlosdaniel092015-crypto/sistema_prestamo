import React, { useState } from 'react';
import { 
  Users, 
  PlusCircle, 
  DollarSign, 
  History, 
  TrendingUp,
  ArrowRight,
  BarChart3,
  LogOut,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
  Menu,
  X
} from 'lucide-react';

// Componente Principal
export default function App() {
  const [clientes, setClientes] = useState([
    {
      id: '1',
      nombre: 'Juan Pérez',
      capitalInicial: 10000,
      capitalActual: 10000,
      totalPagado: 0,
      tasaInteres: 5,
      historial: [{
        tipo: 'inicio',
        fecha: '25/10/2025',
        monto: 10000,
        capitalDespues: 10000
      }]
    }
  ]);
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Agregar nuevo cliente
  const agregarCliente = (nuevoCliente) => {
    const clienteData = {
      ...nuevoCliente,
      id: Date.now().toString(),
      tasaInteres: 5,
      capitalActual: nuevoCliente.capitalInicial,
      totalPagado: 0,
      historial: [{
        tipo: 'inicio',
        fecha: new Date().toLocaleDateString('es-DO'),
        monto: nuevoCliente.capitalInicial,
        capitalDespues: nuevoCliente.capitalInicial
      }]
    };
    setClientes([...clientes, clienteData]);
    setMostrarFormulario(false);
  };

  // Registrar pago
  const registrarPago = (clienteId, tipo, monto, interesPagado = 0, abonoCapital = 0, fechaPago) => {
    const cliente = clientes.find(c => c.id === clienteId);
    const nuevoCapital = cliente.capitalActual - abonoCapital;
    const nuevoTotal = cliente.totalPagado + monto;
    const nuevoHistorial = [...cliente.historial, {
      tipo,
      fecha: fechaPago,
      hora: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
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
    setClientes(clientes.map(c => c.id === clienteId ? clienteActualizado : c));
    if (clienteSeleccionado?.id === clienteId) setClienteSeleccionado(clienteActualizado);
  };

  // Reenganche
  const reenganche = (clienteId, montoReenganche, fechaReenganche) => {
    const cliente = clientes.find(c => c.id === clienteId);
    const nuevoCapital = cliente.capitalActual + montoReenganche;
    const nuevoHistorial = [...cliente.historial, {
      tipo: 'reenganche',
      fecha: fechaReenganche,
      hora: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
      capitalAnterior: cliente.capitalActual,
      montoReenganche,
      capitalDespues: nuevoCapital
    }];
    const clienteActualizado = { 
      ...cliente, 
      capitalActual: nuevoCapital, 
      historial: nuevoHistorial 
    };
    setClientes(clientes.map(c => c.id === clienteId ? clienteActualizado : c));
    setClienteSeleccionado(clienteActualizado);
  };

  // Eliminar cliente
  const eliminarCliente = (clienteId) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    setClientes(clientes.filter(c => c.id !== clienteId));
    setClienteSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Responsive */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {menuAbierto ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-indigo-900">Sistema de Préstamos</h1>
                <p className="text-xs md:text-sm text-gray-600">César Suárez</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden sm:inline text-sm md:text-base text-gray-700">usuario@email.com</span>
              <button className="flex items-center gap-1 md:gap-2 bg-red-600 hover:bg-red-700 text-white px-2 md:px-4 py-2 rounded-lg text-sm md:text-base">
                <LogOut size={16} className="md:w-5 md:h-5" /> 
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Desktop */}
      <nav className="hidden md:block bg-indigo-600 text-white sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          <button 
            onClick={() => { setVistaActual('dashboard'); setClienteSeleccionado(null); setMenuAbierto(false); }}
            className={`px-6 py-3 font-semibold flex items-center gap-2 ${vistaActual === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <BarChart3 size={20} /> Dashboard
          </button>
          <button 
            onClick={() => { setVistaActual('clientes'); setClienteSeleccionado(null); setMenuAbierto(false); }}
            className={`px-6 py-3 font-semibold flex items-center gap-2 ${vistaActual === 'clientes' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <Users size={20} /> Clientes ({clientes.length})
          </button>
        </div>
      </nav>

      {/* Navigation - Mobile (Slide-in menu) */}
      {menuAbierto && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuAbierto(false)}>
          <div className="bg-white w-64 h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg text-gray-800">Menú</h2>
            </div>
            <nav className="p-2">
              <button 
                onClick={() => { setVistaActual('dashboard'); setClienteSeleccionado(null); setMenuAbierto(false); }}
                className={`w-full px-4 py-3 font-semibold flex items-center gap-2 rounded-lg ${vistaActual === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
              >
                <BarChart3 size={20} /> Dashboard
              </button>
              <button 
                onClick={() => { setVistaActual('clientes'); setClienteSeleccionado(null); setMenuAbierto(false); }}
                className={`w-full px-4 py-3 font-semibold flex items-center gap-2 rounded-lg mt-1 ${vistaActual === 'clientes' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
              >
                <Users size={20} /> Clientes ({clientes.length})
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 md:py-6">
        {vistaActual === 'dashboard' ? (
          <Dashboard clientes={clientes} />
        ) : vistaActual === 'clientes' ? (
          <ListaClientes 
            clientes={clientes} 
            onSeleccionar={(cliente) => { setClienteSeleccionado(cliente); setVistaActual('detalle'); }} 
            onAgregar={() => setMostrarFormulario(true)} 
          />
        ) : vistaActual === 'detalle' && clienteSeleccionado ? (
          <DetalleCliente 
            cliente={clienteSeleccionado} 
            onVolver={() => { setVistaActual('clientes'); setClienteSeleccionado(null); }}
            onRegistrarPago={registrarPago} 
            onReenganche={reenganche} 
            onEliminar={eliminarCliente} 
          />
        ) : null}
      </main>

      {mostrarFormulario && (
        <FormularioCliente onGuardar={agregarCliente} onCancelar={() => setMostrarFormulario(false)} />
      )}
    </div>
  );
}

// Dashboard Component
function Dashboard({ clientes }) {
  const totalClientes = clientes.length;
  const capitalTotal = clientes.reduce((sum, c) => sum + c.capitalActual, 0);
  const capitalInvertido = clientes.reduce((sum, c) => sum + c.capitalInicial, 0);
  const totalRecaudado = clientes.reduce((sum, c) => sum + c.totalPagado, 0);
  const interesesTotales = clientes.reduce((sum, c) => sum + (c.capitalActual * (c.tasaInteres / 100)), 0);
  const gananciaEstimadaMensual = clientes.reduce((sum, c) => sum + (c.capitalActual * 0.10), 0);
  
  const topDeudores = [...clientes].sort((a, b) => b.capitalActual - a.capitalActual).slice(0, 5);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "indigo" }) => (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`bg-${color}-100 p-2 md:p-3 rounded-lg`}>
          <Icon className={`text-${color}-600`} size={20} />
        </div>
      </div>
      <h3 className="text-gray-600 text-xs md:text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xl md:text-3xl font-bold text-gray-800 mb-1">{value}</p>
      {subtitle && <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-2">Dashboard General</h2>
        <p className="text-sm md:text-base text-gray-600">Resumen completo de tu cartera de préstamos</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon={Users} title="Total Clientes" value={totalClientes} subtitle="Clientes activos" color="blue" />
        <StatCard icon={DollarSign} title="Capital en Préstamos" value={`$${capitalTotal.toFixed(2)}`} subtitle="Capital actual" color="green" />
        <StatCard icon={TrendingUp} title="Total Recaudado" value={`$${totalRecaudado.toFixed(2)}`} subtitle="Pagos recibidos" color="indigo" />
        <StatCard icon={PieChart} title="Intereses a Cobrar" value={`$${interesesTotales.toFixed(2)}`} subtitle="Próximo período" color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 md:p-3 rounded-lg">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-gray-600 text-xs md:text-sm font-semibold">Ganancia Mensual</h3>
              <p className="text-lg md:text-2xl font-bold text-gray-800">${gananciaEstimadaMensual.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 md:p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-gray-600 text-xs md:text-sm font-semibold">Total Invertido</h3>
              <p className="text-lg md:text-2xl font-bold text-gray-800">${capitalInvertido.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-gray-600 text-xs md:text-sm font-semibold">Ganancia Neta</h3>
              <p className="text-lg md:text-2xl font-bold text-gray-800">${(totalRecaudado - capitalInvertido).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="text-orange-600" size={20} />
          Top 5 Préstamos Más Grandes
        </h3>
        
        {topDeudores.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {topDeudores.map((cliente, idx) => {
              const interes = cliente.capitalActual * (cliente.tasaInteres / 100);
              return (
                <div key={cliente.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="bg-indigo-100 text-indigo-600 font-bold rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sm md:text-base">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm md:text-base text-gray-800">{cliente.nombre}</p>
                      <p className="text-xs md:text-sm text-gray-500">Tasa: {cliente.tasaInteres}% quincenal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base md:text-xl font-bold text-indigo-600">${cliente.capitalActual.toFixed(2)}</p>
                    <p className="text-xs md:text-sm text-orange-600">Int: ${interes.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No hay clientes registrados</p>
        )}
      </div>
    </div>
  );
}

// Lista de Clientes
function ListaClientes({ clientes, onSeleccionar, onAgregar }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Clientes Activos</h2>
        <button 
          onClick={onAgregar} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <PlusCircle size={18} /> Nuevo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4 md:w-16 md:h-16" />
          <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">No hay clientes registrados</h3>
          <p className="text-sm md:text-base text-gray-500 mb-6">Comienza agregando tu primer cliente</p>
          <button 
            onClick={onAgregar} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-sm md:text-base"
          >
            <PlusCircle size={18} /> Agregar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {clientes.map(cliente => {
            const tasa = cliente.tasaInteres || 5;
            const capital = cliente.capitalActual || 0;
            const interes = capital * (tasa / 100);
            return (
              <div 
                key={cliente.id} 
                onClick={() => onSeleccionar(cliente)} 
                className="bg-white rounded-lg shadow-lg p-4 md:p-6 cursor-pointer hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <h3 className="text-base md:text-xl font-bold text-gray-800">{cliente.nombre}</h3>
                  <span className="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold bg-blue-100 text-blue-700">{tasa}%</span>
                </div>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
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
                <button className="w-full mt-3 md:mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm md:text-base">
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

// Detalle Cliente
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
        className="mb-4 md:mb-6 text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 text-sm md:text-base"
      >
        ← Volver a clientes
      </button>

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 md:mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{cliente.nombre}</h2>
            <p className="text-sm md:text-base text-gray-600">Tasa: {tasa}% quincenal</p>
          </div>
          <button
            onClick={() => onEliminar(cliente.id)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm md:text-base"
          >
            Eliminar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-indigo-50 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Capital Actual</p>
            <p className="text-xl md:text-2xl font-bold text-indigo-600">${capital.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Interés a Cobrar</p>
            <p className="text-xl md:text-2xl font-bold text-orange-600">${interes.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Total Pagado</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">${cliente.totalPagado?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button
            onClick={() => setMostrarPago(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <DollarSign size={18} />
            Registrar Pago
          </button>
          <button
            onClick={() => setMostrarReenganche(true)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <TrendingUp size={18} />
            Reenganche
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History size={20} />
          Historial de Operaciones
        </h3>

        {historial.length === 0 ? (
          <p className="text-gray-500 text-sm md:text-base">Sin movimientos aún</p>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {historial.slice().reverse().map((h, idx) => (
              <div key={idx} className="border-l-4 border-indigo-600 pl-3 md:pl-4 py-2 bg-gray-50 rounded">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="flex-1">
                    <span className="font-semibold text-sm md:text-base text-gray-800">
                      {h.tipo === 'inicio' && '🎯 Préstamo Inicial'}
                      {h.tipo === 'interes' && '💰 Pago de Interés'}
                      {h.tipo === 'interes-capital' && '💎 Pago Interés + Capital'}
                      {h.tipo === 'reenganche' && '🔄 Reenganche'}
                    </span>
                    <p className="text-xs md:text-sm text-gray-600">
                      {h.fecha} {h.hora && `- ${h.hora}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {h.tipo !== 'reenganche' && (
                      <p className="font-bold text-green-600 text-sm md:text-base">${h.monto?.toFixed(2) || '0.00'}</p>
                    )}
                    {h.tipo === 'reenganche' && (
                      <p className="font-bold text-orange-600 text-sm md:text-base">+${h.montoReenganche?.toFixed(2) || '0.00'}</p>
                    )}
                    <p className="text-xs md:text-sm text-gray-600">
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

// Formulario Cliente
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
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Nuevo Cliente</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Capital inicial"
            value={capitalInicial}
            onChange={(e) => setCapitalInicial(e.target.value)}
            className="w-full border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onCancelar} 
            className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm md:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm md:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Pago con fecha
function ModalPago({ cliente, onGuardar, onCerrar }) {
  const [monto, setMonto] = useState('');
  const [abonoCapital, setAbonoCapital] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);

  const guardar = () => {
    if (!monto && !abonoCapital) {
      alert('Debe ingresar al menos un monto');
      return;
    }
    if (!fechaPago) {
      alert('Debe seleccionar una fecha');
      return;
    }
    
    // Convertir fecha al formato DD/MM/YYYY
    const [year, month, day] = fechaPago.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;
    
    const montoNum = parseFloat(monto || 0);
    const abonoNum = parseFloat(abonoCapital || 0);
    onGuardar(
      cliente.id, 
      abonoNum > 0 ? 'interes-capital' : 'interes', 
      montoNum + abonoNum, 
      montoNum, 
      abonoNum,
      fechaFormateada
    );
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Registrar Pago</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del Pago
            </label>
            <input
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="w-full border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <input
            type="number"
            placeholder="Monto de interés"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Abono a capital (opcional)"
            value={abonoCapital}
            onChange={(e) => setAbonoCapital(e.target.value)}
            className="w-full border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onCerrar} 
            className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm md:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm md:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Reenganche con fecha
function ModalReenganche({ cliente, onGuardar, onCerrar }) {
  const [monto, setMonto] = useState('');
  const [fechaReenganche, setFechaReenganche] = useState(new Date().toISOString().split('T')[0]);

  const guardar = () => {
    if (!monto) {
      alert('Ingrese el monto del reenganche');
      return;
    }
    if (!fechaReenganche) {
      alert('Debe seleccionar una fecha');
      return;
    }
    
    // Convertir fecha al formato DD/MM/YYYY
    const [year, month, day] = fechaReenganche.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;
    
    onGuardar(cliente.id, parseFloat(monto), fechaFormateada);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Reenganche</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del Reenganche
            </label>
            <input
              type="date"
              value={fechaReenganche}
              onChange={(e) => setFechaReenganche(e.target.value)}
              className="w-full border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <input
            type="number"
            placeholder="Monto a reenganchar"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onCerrar} 
            className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm md:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm md:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
