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
  Lock,
  Mail,
  LogIn,
  UserPlus,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// ==================== COMPONENTE PRINCIPAL ====================
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [historialEliminados, setHistorialEliminados] = useState([]);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      cargarClientes();
      cargarHistorialEliminados();
    }
  }, []);

  const iniciarSesion = (email) => {
    const user = { email };
    setUsuario(user);
    localStorage.setItem('usuario', JSON.stringify(user));
    cargarClientes();
    cargarHistorialEliminados();
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    setClientes([]);
    setHistorialEliminados([]);
    setVistaActual('dashboard');
  };

  const cargarClientes = () => {
    const clientesGuardados = localStorage.getItem('clientes');
    if (clientesGuardados) {
      setClientes(JSON.parse(clientesGuardados));
    }
  };

  const cargarHistorialEliminados = () => {
    const historialGuardado = localStorage.getItem('historialEliminados');
    if (historialGuardado) {
      setHistorialEliminados(JSON.parse(historialGuardado));
    }
  };

  const guardarClientes = (nuevosClientes) => {
    setClientes(nuevosClientes);
    localStorage.setItem('clientes', JSON.stringify(nuevosClientes));
  };

  const guardarHistorialEliminados = (nuevoHistorial) => {
    setHistorialEliminados(nuevoHistorial);
    localStorage.setItem('historialEliminados', JSON.stringify(nuevoHistorial));
  };

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
      }],
      createdAt: new Date().toISOString()
    };
    guardarClientes([...clientes, clienteData]);
    setMostrarFormulario(false);
    alert('Cliente agregado exitosamente');
  };

  const registrarPago = (clienteId, tipo, monto, interesPagado = 0, abonoCapital = 0, fechaPersonalizada = null) => {
    const cliente = clientes.find(c => c.id === clienteId);
    const nuevoCapital = cliente.capitalActual - abonoCapital;
    const nuevoTotal = cliente.totalPagado + monto;
    
    const fechaActual = fechaPersonalizada || new Date().toLocaleDateString('es-DO');
    const horaActual = new Date().toLocaleTimeString('es-DO');
    
    const nuevoHistorial = [...cliente.historial, {
      tipo,
      fecha: fechaActual,
      hora: horaActual,
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

    const nuevosClientes = clientes.map(c => c.id === clienteId ? clienteActualizado : c);
    guardarClientes(nuevosClientes);
    
    if (clienteSeleccionado?.id === clienteId) {
      setClienteSeleccionado(clienteActualizado);
    }
    alert('Pago registrado exitosamente');
  };

  const reenganche = (clienteId, montoReenganche, fechaPersonalizada = null) => {
    const cliente = clientes.find(c => c.id === clienteId);
    const nuevoCapital = cliente.capitalActual + montoReenganche;
    
    const fechaActual = fechaPersonalizada || new Date().toLocaleDateString('es-DO');
    const horaActual = new Date().toLocaleTimeString('es-DO');
    
    const nuevoHistorial = [...cliente.historial, {
      tipo: 'reenganche',
      fecha: fechaActual,
      hora: horaActual,
      capitalAnterior: cliente.capitalActual,
      montoReenganche,
      capitalDespues: nuevoCapital
    }];
    
    const clienteActualizado = { 
      ...cliente, 
      capitalActual: nuevoCapital, 
      historial: nuevoHistorial 
    };

    const nuevosClientes = clientes.map(c => c.id === clienteId ? clienteActualizado : c);
    guardarClientes(nuevosClientes);
    setClienteSeleccionado(clienteActualizado);
    alert('Reenganche realizado exitosamente');
  };

  const eliminarCliente = (clienteId) => {
    if (!confirm('¿Estás seguro de eliminar este cliente? Su información se guardará en el historial.')) return;
    
    const clienteAEliminar = clientes.find(c => c.id === clienteId);
    if (clienteAEliminar) {
      const clienteConFechaEliminacion = {
        ...clienteAEliminar,
        fechaEliminacion: new Date().toISOString(),
        fechaEliminacionLegible: new Date().toLocaleDateString('es-DO')
      };
      guardarHistorialEliminados([...historialEliminados, clienteConFechaEliminacion]);
    }
    
    const nuevosClientes = clientes.filter(c => c.id !== clienteId);
    guardarClientes(nuevosClientes);
    setClienteSeleccionado(null);
    setVistaActual('clientes');
    alert('Cliente eliminado. La información se guardó en el historial.');
  };

  const eliminarDelHistorial = (clienteId) => {
    if (!confirm('¿Eliminar permanentemente este registro del historial?')) return;
    const nuevoHistorial = historialEliminados.filter(c => c.id !== clienteId);
    guardarHistorialEliminados(nuevoHistorial);
    alert('Registro eliminado permanentemente');
  };

  const restaurarCliente = (cliente, nuevoMonto, fechaNueva) => {
    const { fechaEliminacion, fechaEliminacionLegible, ...clienteRestaurado } = cliente;
    
    let fechaFinal = fechaNueva || new Date().toLocaleDateString('es-DO');
    if (fechaNueva && fechaNueva.includes('-')) {
      const [year, month, day] = fechaNueva.split('-');
      fechaFinal = `${day}/${month}/${year}`;
    }
    
    const clienteConNuevoCapital = {
      ...clienteRestaurado,
      capitalActual: nuevoMonto,
      historial: [
        ...clienteRestaurado.historial,
        {
          tipo: 'reenganche',
          fecha: fechaFinal,
          hora: new Date().toLocaleTimeString('es-DO'),
          capitalAnterior: cliente.capitalActual,
          montoReenganche: nuevoMonto - cliente.capitalActual,
          capitalDespues: nuevoMonto,
          nota: 'Restaurado desde historial'
        }
      ]
    };
    
    guardarClientes([...clientes, clienteConNuevoCapital]);
    const nuevoHistorial = historialEliminados.filter(c => c.id !== cliente.id);
    guardarHistorialEliminados(nuevoHistorial);
    alert('Cliente restaurado exitosamente');
  };

  if (!usuario) {
    return <Login onLoginSuccess={iniciarSesion} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-900">Sistema de Préstamos</h1>
              <p className="text-xs sm:text-sm text-gray-600">César Suárez</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">{usuario.email}</span>
              <button 
                onClick={cerrarSesion} 
                className="flex items-center gap-1 sm:gap-2 bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base"
              >
                <LogOut size={16} className="sm:w-5 sm:h-5" /> 
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-indigo-600 text-white sticky top-[60px] sm:top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex gap-1 overflow-x-auto">
          <button 
            onClick={() => { setVistaActual('dashboard'); setClienteSeleccionado(null); }}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 text-xs sm:text-base whitespace-nowrap ${vistaActual === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <BarChart3 size={16} className="sm:w-5 sm:h-5" /> Dashboard
          </button>
          <button 
            onClick={() => { setVistaActual('clientes'); setClienteSeleccionado(null); }}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 text-xs sm:text-base whitespace-nowrap ${vistaActual === 'clientes' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <Users size={16} className="sm:w-5 sm:h-5" /> 
            <span className="hidden sm:inline">Clientes ({clientes.length})</span>
            <span className="sm:hidden">({clientes.length})</span>
          </button>
          <button 
            onClick={() => { setVistaActual('historial'); setClienteSeleccionado(null); }}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 text-xs sm:text-base whitespace-nowrap ${vistaActual === 'historial' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <History size={16} className="sm:w-5 sm:h-5" /> 
            <span className="hidden sm:inline">Historial ({historialEliminados.length})</span>
            <span className="sm:hidden">({historialEliminados.length})</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {vistaActual === 'dashboard' ? (
          <Dashboard clientes={clientes} />
        ) : vistaActual === 'clientes' ? (
          <ListaClientes 
            clientes={clientes} 
            onSeleccionar={(cliente) => { setClienteSeleccionado(cliente); setVistaActual('detalle'); }} 
            onAgregar={() => setMostrarFormulario(true)} 
          />
        ) : vistaActual === 'historial' ? (
          <HistorialEliminados 
            historial={historialEliminados} 
            onEliminarDelHistorial={eliminarDelHistorial}
            onRestaurar={restaurarCliente}
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
        <FormularioCliente 
          onGuardar={agregarCliente} 
          onCancelar={() => setMostrarFormulario(false)} 
        />
      )}
    </div>
  );
}

// ==================== LOGIN ====================
function Login({ onLoginSuccess }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [formulario, setFormulario] = useState({ email: '', password: '', confirmarPassword: '' });

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (esRegistro && formulario.password !== formulario.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    onLoginSuccess(formulario.email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md">
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-indigo-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
            <Lock className="text-white" size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-900">Sistema de Préstamos</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2">César Suárez</p>
        </div>

        <div className="flex gap-2 mb-3 sm:mb-4 lg:mb-6">
          <button
            onClick={() => setEsRegistro(false)}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 lg:px-4 rounded-lg font-semibold transition text-xs sm:text-sm lg:text-base ${!esRegistro ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <LogIn className="inline mr-1 sm:mr-2" size={14} />
            Iniciar Sesión
          </button>
          <button
            onClick={() => setEsRegistro(true)}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 lg:px-4 rounded-lg font-semibold transition text-xs sm:text-sm lg:text-base ${esRegistro ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <UserPlus className="inline mr-1 sm:mr-2" size={14} />
            Registrarse
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-2 sm:space-y-3 lg:space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
              <Mail className="inline mr-1 sm:mr-2" size={14} />
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={formulario.email}
              onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 focus:border-indigo-500 focus:outline-none transition text-xs sm:text-sm lg:text-base"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
              <Lock className="inline mr-1 sm:mr-2" size={14} />
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formulario.password}
              onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 focus:border-indigo-500 focus:outline-none transition text-xs sm:text-sm lg:text-base"
              placeholder="••••••••"
            />
          </div>

          {esRegistro && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
                <Lock className="inline mr-1 sm:mr-2" size={14} />
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                value={formulario.confirmarPassword}
                onChange={(e) => setFormulario({ ...formulario, confirmarPassword: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 focus:border-indigo-500 focus:outline-none transition text-xs sm:text-sm lg:text-base"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 sm:py-2 lg:py-3 rounded-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base"
          >
            {esRegistro ? <><UserPlus size={16} /> Crear Cuenta</> : <><LogIn size={16} /> Iniciar Sesión</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==================== DASHBOARD ====================
function Dashboard({ clientes }) {
  const totalClientes = clientes.length;
  const capitalTotal = clientes.reduce((sum, c) => sum + c.capitalActual, 0);
  const totalRecaudado = clientes.reduce((sum, c) => sum + c.totalPagado, 0);
  const interesesTotales = clientes.reduce((sum, c) => sum + c.capitalActual * (c.tasaInteres / 100), 0);
  const gananciaEstimadaMensual = clientes.reduce((sum, c) => sum + (c.capitalActual * 0.10), 0);
  
  const totalInteresesPagados = clientes.reduce((sum, cliente) => {
    const pagosInteres = cliente.historial.filter(h => h.tipo === 'interes' || h.tipo === 'interes-capital');
    return sum + pagosInteres.reduce((s, p) => s + (p.interesPagado || p.monto), 0);
  }, 0);
  
  // Ganancia Neta = Total Recaudado - Capital que aún está en préstamo
  const gananciaNeta = totalRecaudado - capitalTotal;

  const topDeudores = [...clientes].sort((a, b) => b.capitalActual - a.capitalActual).slice(0, 5);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "indigo" }) => (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <div className={`bg-${color}-100 p-1.5 sm:p-2 lg:p-3 rounded-lg`}>
          <Icon className={`text-${color}-600`} size={18} />
        </div>
      </div>
      <h3 className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">{title}</h3>
      <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 break-words">{value}</p>
      {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-900 mb-1 sm:mb-2">Dashboard General</h2>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Resumen completo de tu cartera de préstamos</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
        <StatCard icon={Users} title="Total Clientes" value={totalClientes} subtitle="Clientes activos" color="blue" />
        <StatCard icon={DollarSign} title="Capital en Préstamos" value={`$${capitalTotal.toFixed(2)}`} subtitle="Capital actual total" color="green" />
        <StatCard icon={TrendingUp} title="Total Recaudado" value={`$${totalRecaudado.toFixed(2)}`} subtitle="Pagos recibidos" color="indigo" />
        <StatCard icon={PieChart} title="Intereses a Cobrar" value={`$${interesesTotales.toFixed(2)}`} subtitle="Próximo período" color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4">
            <div className="bg-purple-100 p-1.5 sm:p-2 lg:p-3 rounded-lg flex-shrink-0">
              <Calendar className="text-purple-600" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Ganancia Mensual Estimada</h3>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-words">${gananciaEstimadaMensual.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">Basado en tasa quincenal</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4">
            <div className="bg-green-100 p-1.5 sm:p-2 lg:p-3 rounded-lg flex-shrink-0">
              <CheckCircle className="text-green-600" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Intereses Pagados</h3>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-words">${totalInteresesPagados.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">Total histórico</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4">
            <div className="bg-blue-100 p-1.5 sm:p-2 lg:p-3 rounded-lg flex-shrink-0">
              <TrendingUp className="text-blue-600" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Ganancia Neta</h3>
              <p className={`text-lg sm:text-xl lg:text-2xl font-bold break-words ${gananciaNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${gananciaNeta.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">Recaudado - Capital prestado</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <AlertCircle className="text-orange-600" size={18} />
          Top 5 Préstamos Más Grandes
        </h3>
        
        {topDeudores.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {topDeudores.map((cliente, idx) => {
              const interes = cliente.capitalActual * (cliente.tasaInteres / 100);
              return (
                <div key={cliente.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 lg:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition gap-2 sm:gap-3 lg:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1 w-full sm:w-auto">
                    <div className="bg-indigo-100 text-indigo-600 font-bold rounded-full w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0 text-sm sm:text-base">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{cliente.nombre}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Tasa: {cliente.tasaInteres}% quincenal</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto pl-9 sm:pl-0">
                    <p className="text-base sm:text-lg lg:text-xl font-bold text-indigo-600 break-words">${cliente.capitalActual.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm text-orange-600">Interés: ${interes.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6 sm:py-8 text-xs sm:text-sm lg:text-base">No hay clientes registrados</p>
        )}
      </div>
    </div>
  );
}

// ==================== LISTA CLIENTES ====================
function ListaClientes({ clientes, onSeleccionar, onAgregar }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Clientes Activos</h2>
        <button 
          onClick={onAgregar} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
        >
          <PlusCircle size={18} /> Nuevo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center">
          <Users size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No hay clientes registrados</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Comienza agregando tu primer cliente</p>
          <button 
            onClick={onAgregar} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <PlusCircle size={18} /> Agregar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-2">{cliente.nombre || 'Sin nombre'}</h3>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
                    {tasa}%
                  </span>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
                    <span className="font-bold text-green-600">${(cliente.totalPagado || 0).toFixed(2)}</span>
                  </div>
                </div>
                <button className="w-full mt-3 sm:mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-xs sm:text-sm">
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

// ==================== DETALLE CLIENTE ====================
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
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{cliente.nombre || 'Sin nombre'}</h2>
            <p className="text-sm sm:text-base text-gray-600">Tasa: {tasa}% quincenal</p>
          </div>
          <button
            onClick={() => onEliminar(cliente.id)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base"
          >
            Eliminar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Capital Actual</p>
            <p className="text-xl sm:text-2xl font-bold text-indigo-600 break-words">${capital.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Interés a Cobrar</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600 break-words">${interes.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pagado</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 break-words">${(cliente.totalPagado || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setMostrarPago(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <DollarSign size={18} />
            Registrar Pago
          </button>
          <button
            onClick={() => setMostrarReenganche(true)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <TrendingUp size={18} />
            Reenganche
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <History size={20} />
          Historial de Operaciones
        </h3>

        {historial.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">Sin movimientos aún</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
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
                  <div className="text-left sm:text-right">
                    {h.tipo !== 'reenganche' && (
                      <p className="font-bold text-green-600 text-sm sm:text-base">${(h.monto || 0).toFixed(2)}</p>
                    )}
                    {h.tipo === 'reenganche' && (
                      <p className="font-bold text-orange-600 text-sm sm:text-base">+${(h.montoReenganche || 0).toFixed(2)}</p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600">
                      Capital: ${(h.capitalDespues || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

// ==================== FORMULARIO CLIENTE ====================
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Nuevo Cliente</h3>
        <div className="space-y-2 sm:space-y-3">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
          <input
            type="number"
            placeholder="Capital inicial"
            value={capitalInicial}
            onChange={(e) => setCapitalInicial(e.target.value)}
            className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button 
            onClick={onCancelar} 
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL PAGO ====================
function ModalPago({ cliente, onGuardar, onCerrar }) {
  const [monto, setMonto] = useState('');
  const [abonoCapital, setAbonoCapital] = useState('');
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');

  const guardar = () => {
    if (!monto && !abonoCapital) {
      alert('Debe ingresar al menos un monto');
      return;
    }
    const montoNum = parseFloat(monto || 0);
    const abonoNum = parseFloat(abonoCapital || 0);
    
    let fechaFinal = null;
    if (fechaPersonalizada) {
      const [year, month, day] = fechaPersonalizada.split('-');
      fechaFinal = `${day}/${month}/${year}`;
    }
    
    onGuardar(cliente.id, abonoNum > 0 ? 'interes-capital' : 'interes', montoNum + abonoNum, montoNum, abonoNum, fechaFinal);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Registrar Pago</h3>
        <div className="space-y-2 sm:space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Fecha (opcional)</label>
            <input
              type="date"
              value={fechaPersonalizada}
              onChange={(e) => setFechaPersonalizada(e.target.value)}
              className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">Deja vacío para usar la fecha actual</p>
          </div>
          <input
            type="number"
            placeholder="Monto de interés"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
          <input
            type="number"
            placeholder="Abono a capital (opcional)"
            value={abonoCapital}
            onChange={(e) => setAbonoCapital(e.target.value)}
            className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button 
            onClick={onCerrar} 
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL REENGANCHE ====================
function ModalReenganche({ cliente, onGuardar, onCerrar }) {
  const [monto, setMonto] = useState('');
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');

  const guardar = () => {
    if (!monto) {
      alert('Ingrese el monto del reenganche');
      return;
    }
    
    let fechaFinal = null;
    if (fechaPersonalizada) {
      const [year, month, day] = fechaPersonalizada.split('-');
      fechaFinal = `${day}/${month}/${year}`;
    }
    
    onGuardar(cliente.id, parseFloat(monto), fechaFinal);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Reenganche</h3>
        <div className="space-y-2 sm:space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Fecha (opcional)</label>
            <input
              type="date"
              value={fechaPersonalizada}
              onChange={(e) => setFechaPersonalizada(e.target.value)}
              className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">Deja vacío para usar la fecha actual</p>
          </div>
          <input
            type="number"
            placeholder="Monto a reenganchar"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button 
            onClick={onCerrar} 
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm sm:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL RESTAURAR ====================
function ModalRestaurar({ cliente, onGuardar, onCerrar }) {
  const [nuevoMonto, setNuevoMonto] = useState(cliente.capitalActual.toString());
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');

  const guardar = () => {
    if (!nuevoMonto) {
      alert('Ingrese el nuevo monto del capital');
      return;
    }
    
    onGuardar(parseFloat(nuevoMonto), fechaPersonalizada);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Restaurar Cliente</h3>
        <p className="text-sm text-gray-600 mb-4">Cliente: <span className="font-semibold">{cliente.nombre}</span></p>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Fecha de Restauración
            </label>
            <input
              type="date"
              value={fechaPersonalizada}
              onChange={(e) => setFechaPersonalizada(e.target.value)}
              className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">Deja vacío para usar la fecha actual</p>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Nuevo Monto del Capital
            </label>
            <input
              type="number"
              placeholder="Nuevo capital"
              value={nuevoMonto}
              onChange={(e) => setNuevoMonto(e.target.value)}
              className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Capital anterior: ${cliente.capitalActual.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button 
            onClick={onCerrar} 
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button 
            onClick={guardar} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <CheckCircle size={16} />
            Restaurar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== HISTORIAL DE CLIENTES ELIMINADOS ====================
function HistorialEliminados({ historial, onEliminarDelHistorial, onRestaurar }) {
  const [clienteExpandido, setClienteExpandido] = useState(null);
  const [mostrarModalRestaurar, setMostrarModalRestaurar] = useState(false);
  const [clienteARestaurar, setClienteARestaurar] = useState(null);

  if (historial.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center">
        <History size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">Sin clientes en el historial</h3>
        <p className="text-sm sm:text-base text-gray-500">Los clientes eliminados aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-900 mb-1 sm:mb-2">Historial de Clientes</h2>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Clientes eliminados y su información completa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {historial.map(cliente => {
          const expandido = clienteExpandido === cliente.id;
          const tasa = cliente.tasaInteres || 5;
          const capital = cliente.capitalActual || 0;
          
          return (
            <div key={cliente.id} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{cliente.nombre}</h3>
                  <p className="text-xs sm:text-sm text-red-600">Eliminado: {cliente.fechaEliminacionLegible}</p>
                </div>
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
                  {tasa}%
                </span>
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capital al eliminar:</span>
                  <span className="font-bold text-indigo-600">${capital.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capital inicial:</span>
                  <span className="font-bold text-gray-700">${(cliente.capitalInicial || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total pagado:</span>
                  <span className="font-bold text-green-600">${(cliente.totalPagado || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setClienteExpandido(expandido ? null : cliente.id)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-xs sm:text-sm"
                >
                  <History size={16} />
                  {expandido ? 'Ocultar Historial' : 'Ver Historial Completo'}
                </button>

                {expandido && (
                  <div className="border-t pt-3 space-y-2 max-h-60 overflow-y-auto">
                    {cliente.historial?.slice().reverse().map((h, idx) => (
                      <div key={idx} className="border-l-4 border-indigo-600 pl-3 py-2 bg-gray-50 rounded text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-800 block">
                              {h.tipo === 'inicio' && '🎯 Préstamo Inicial'}
                              {h.tipo === 'interes' && '💰 Pago de Interés'}
                              {h.tipo === 'interes-capital' && '💎 Pago Interés + Capital'}
                              {h.tipo === 'reenganche' && '🔄 Reenganche'}
                            </span>
                            <p className="text-gray-600">
                              {h.fecha} {h.hora && `- ${h.hora}`}
                            </p>
                          </div>
                          <div className="text-right">
                            {h.tipo !== 'reenganche' && (
                              <p className="font-bold text-green-600">${(h.monto || 0).toFixed(2)}</p>
                            )}
                            {h.tipo === 'reenganche' && (
                              <p className="font-bold text-orange-600">+${(h.montoReenganche || 0).toFixed(2)}</p>
                            )}
                            <p className="text-gray-600">
                              Cap: ${(h.capitalDespues || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setClienteARestaurar(cliente);
                      setMostrarModalRestaurar(true);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-xs sm:text-sm"
                  >
                    <CheckCircle size={16} />
                    Restaurar
                  </button>
                  <button
                    onClick={() => onEliminarDelHistorial(cliente.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-xs sm:text-sm"
                  >
                    <X size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mostrarModalRestaurar && clienteARestaurar && (
        <ModalRestaurar
          cliente={clienteARestaurar}
          onGuardar={(nuevoMonto, fecha) => {
            onRestaurar(clienteARestaurar, nuevoMonto, fecha);
            setMostrarModalRestaurar(false);
            setClienteARestaurar(null);
          }}
          onCerrar={() => {
            setMostrarModalRestaurar(false);
            setClienteARestaurar(null);
          }}
        />
      )}
    </div>
  );
}
