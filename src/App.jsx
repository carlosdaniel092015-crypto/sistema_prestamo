import React, { useState, useEffect } from 'react';
import { Trash2, Plus, DollarSign, TrendingUp, RefreshCw, Undo2 } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [clientesEliminados, setClientesEliminados] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalPago, setModalPago] = useState({ tipo: null, cliente: null });
  const [cargando, setCargando] = useState(true);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    montoInicial: '',
    tasaInteres: '5',
    fechaInicio: ''
  });

  const [datosPago, setDatosPago] = useState({
    montoPagado: '',
    fecha: '',
    hora: ''
  });

  // Cargar clientes activos desde Firebase en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'clientes'), orderBy('fechaCreacion', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientesData = [];
      snapshot.forEach((doc) => {
        clientesData.push({ id: doc.id, ...doc.data() });
      });
      setClientes(clientesData);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Cargar clientes eliminados desde Firebase en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'clientesEliminados'), orderBy('fechaEliminacion', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eliminadosData = [];
      snapshot.forEach((doc) => {
        eliminadosData.push({ id: doc.id, ...doc.data() });
      });
      setClientesEliminados(eliminadosData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const ahora = new Date();
    const fechaStr = ahora.toISOString().slice(0, 16);
    setNuevoCliente(prev => ({ ...prev, fechaInicio: fechaStr }));
    setDatosPago(prev => ({ ...prev, fecha: fechaStr.slice(0, 10), hora: fechaStr.slice(11, 16) }));
  }, []);

  const formatearFechaHora = (fechaISO, hora24) => {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    
    const [horas, minutos] = hora24.split(':');
    const h = parseInt(horas);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hora12 = h % 12 || 12;
    
    return {
      fecha: `${dia}/${mes}/${anio}`,
      hora: `${hora12}:${minutos} ${ampm}`
    };
  };

  const calcularInteres = (capital, tasa) => {
    return capital * (tasa / 100);
  };

  const agregarCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.montoInicial || !nuevoCliente.fechaInicio) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const [fechaISO, horaISO] = nuevoCliente.fechaInicio.split('T');
      const { fecha, hora } = formatearFechaHora(fechaISO, horaISO);

      const cliente = {
        nombre: nuevoCliente.nombre,
        capitalInicial: parseFloat(nuevoCliente.montoInicial),
        capitalActual: parseFloat(nuevoCliente.montoInicial),
        tasaInteres: parseFloat(nuevoCliente.tasaInteres),
        fechaInicio: fecha,
        horaInicio: hora,
        historial: [{
          tipo: 'inicio',
          fecha: fecha,
          hora: hora,
          monto: parseFloat(nuevoCliente.montoInicial),
          capitalRestante: parseFloat(nuevoCliente.montoInicial),
          descripcion: `Préstamo iniciado - Tasa: ${nuevoCliente.tasaInteres}% ${nuevoCliente.tasaInteres === '5' ? 'quincenal' : 'mensual'}`
        }],
        totalPagado: 0,
        quinceanasPagadas: 0,
        fechaCreacion: new Date().toISOString()
      };

      await addDoc(collection(db, 'clientes'), cliente);
      
      setNuevoCliente({ nombre: '', montoInicial: '', tasaInteres: '5', fechaInicio: '' });
      setMostrarFormulario(false);
      alert('Cliente agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      alert('Error al agregar cliente. Verifica tu conexión.');
    }
  };

  const registrarPago = async (clienteId, tipoPago) => {
    if (!datosPago.fecha || !datosPago.hora) {
      alert('Por favor ingresa fecha y hora del pago');
      return;
    }

    const cliente = clientes.find(c => c.id === clienteId);
    const { fecha, hora } = formatearFechaHora(datosPago.fecha, datosPago.hora);
    const interesActual = calcularInteres(cliente.capitalActual, cliente.tasaInteres);

    let nuevoHistorial = [...cliente.historial];
    let nuevoCapital = cliente.capitalActual;
    let totalPagadoNuevo = cliente.totalPagado;
    let quinceanasPagadas = cliente.quinceanasPagadas;

    if (tipoPago === 'interes') {
      const montoPagado = parseFloat(datosPago.montoPagado);
      if (!montoPagado || montoPagado <= 0) {
        alert('Ingresa el monto del interés pagado');
        return;
      }

      quinceanasPagadas += 1;
      let descripcion = `Interés pagado ${fecha}`;
      
      if (cliente.tasaInteres === 5 && quinceanasPagadas % 2 === 0) {
        descripcion = `Interés pagado (2 quincenas) ${fecha}`;
      }

      nuevoHistorial.push({
        tipo: 'interes',
        fecha: fecha,
        hora: hora,
        monto: montoPagado,
        capitalRestante: nuevoCapital,
        descripcion: descripcion
      });
      totalPagadoNuevo += montoPagado;
    } else if (tipoPago === 'interes-capital') {
      const montoPagado = parseFloat(datosPago.montoPagado);
      if (!montoPagado || montoPagado <= 0) {
        alert('Ingresa un monto válido');
        return;
      }

      if (montoPagado < interesActual) {
        alert(`El monto debe ser al menos ${interesActual.toFixed(2)} para cubrir el interés`);
        return;
      }

      const abonoCapital = montoPagado - interesActual;
      nuevoCapital = Math.max(0, cliente.capitalActual - abonoCapital);
      quinceanasPagadas += 1;

      nuevoHistorial.push({
        tipo: 'interes-capital',
        fecha: fecha,
        hora: hora,
        monto: montoPagado,
        interesPagado: interesActual,
        abonoCapital: abonoCapital,
        capitalRestante: nuevoCapital,
        descripcion: `Pago de interés + abono al capital`
      });
      totalPagadoNuevo += montoPagado;
    } else if (tipoPago === 'abono') {
      const montoAbono = parseFloat(datosPago.montoPagado);
      if (!montoAbono || montoAbono <= 0) {
        alert('Ingresa un monto válido');
        return;
      }

      nuevoCapital = Math.max(0, cliente.capitalActual - montoAbono);

      nuevoHistorial.push({
        tipo: 'abono',
        fecha: fecha,
        hora: hora,
        monto: montoAbono,
        capitalRestante: nuevoCapital,
        descripcion: 'Abono directo al capital'
      });
      totalPagadoNuevo += montoAbono;
    } else if (tipoPago === 'reenganche') {
      const montoReenganche = parseFloat(datosPago.montoPagado);
      if (!montoReenganche || montoReenganche <= 0) {
        alert('Ingresa el monto del reenganche');
        return;
      }

      nuevoCapital = cliente.capitalActual + montoReenganche;

      nuevoHistorial.push({
        tipo: 'reenganche',
        fecha: fecha,
        hora: hora,
        monto: montoReenganche,
        capitalRestante: nuevoCapital,
        descripcion: `Reenganche realizado - Monto agregado: $${montoReenganche.toFixed(2)}`
      });
      quinceanasPagadas = 0;
    }

    try {
      const clienteRef = doc(db, 'clientes', clienteId);
      await updateDoc(clienteRef, {
        capitalActual: nuevoCapital,
        historial: nuevoHistorial,
        totalPagado: totalPagadoNuevo,
        quinceanasPagadas: quinceanasPagadas
      });

      setModalPago({ tipo: null, cliente: null });
      setDatosPago({ montoPagado: '', fecha: datosPago.fecha, hora: datosPago.hora });
      alert('Pago registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago. Verifica tu conexión.');
    }
  };

  const eliminarCliente = async (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    const confirmar = window.confirm(`¿Estás seguro de eliminar a ${cliente.nombre}?`);
    if (confirmar) {
      try {
        // Agregar a colección de eliminados
        await addDoc(collection(db, 'clientesEliminados'), {
          ...cliente,
          fechaEliminacion: new Date().toISOString()
        });
        
        // Eliminar de clientes activos
        await deleteDoc(doc(db, 'clientes', clienteId));
        
        alert('Cliente eliminado');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  const restaurarCliente = async (clienteId) => {
    const cliente = clientesEliminados.find(c => c.id === clienteId);
    if (cliente) {
      try {
        const { fechaEliminacion, ...clienteRestaurado } = cliente;
        
        // Agregar de vuelta a clientes activos
        await addDoc(collection(db, 'clientes'), clienteRestaurado);
        
        // Eliminar de eliminados
        await deleteDoc(doc(db, 'clientesEliminados', clienteId));
        
        alert('Cliente restaurado');
      } catch (error) {
        console.error('Error al restaurar cliente:', error);
        alert('Error al restaurar cliente');
      }
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-900 font-semibold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-indigo-900 text-center">
            Sistema de Préstamos César Suárez
          </h1>
          <p className="text-center text-gray-600 mt-2">Gestión profesional de préstamos</p>
          <p className="text-center text-green-600 text-sm mt-1">🔥 Conectado a Firebase</p>
        </header>

        <div className="mb-6">
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition"
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Registrar Nuevo Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={nuevoCliente.nombre}
                onChange={e => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Monto del préstamo"
                value={nuevoCliente.montoInicial}
                onChange={e => setNuevoCliente({ ...nuevoCliente, montoInicial: e.target.value })}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={nuevoCliente.tasaInteres}
                onChange={e => setNuevoCliente({ ...nuevoCliente, tasaInteres: e.target.value })}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500 focus:outline-none"
              >
                <option value="5">5% Quincenal</option>
                <option value="10">10% Mensual</option>
              </select>
              <input
                type="datetime-local"
                value={nuevoCliente.fechaInicio}
                onChange={e => setNuevoCliente({ ...nuevoCliente, fechaInicio: e.target.value })}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              onClick={agregarCliente}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
            >
              Agregar Cliente
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {clientes.map(cliente => {
            const interesActual = calcularInteres(cliente.capitalActual, cliente.tasaInteres);
            return (
              <div key={cliente.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{cliente.nombre}</h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      eliminarCliente(cliente.id);
                    }}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                    type="button"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capital actual:</span>
                    <span className="font-bold text-green-600">${cliente.capitalActual.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interés {cliente.tasaInteres === 5 ? 'quincenal' : 'mensual'}:</span>
                    <span className="font-bold text-orange-600">${interesActual.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total pagado:</span>
                    <span className="font-bold text-blue-600">${cliente.totalPagado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Inicio:</span>
                    <span>{cliente.fechaInicio} - {cliente.horaInicio}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModalPago({ tipo: 'interes', cliente })}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <DollarSign size={16} />
                    Pagar Interés
                  </button>
                  <button
                    onClick={() => setModalPago({ tipo: 'interes-capital', cliente })}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <TrendingUp size={16} />
                    Interés + Capital
                  </button>
                  <button
                    onClick={() => setModalPago({ tipo: 'abono', cliente })}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Plus size={16} />
                    Abonar Capital
                  </button>
                  <button
                    onClick={() => setModalPago({ tipo: 'reenganche', cliente })}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <RefreshCw size={16} />
                    Reenganche
                  </button>
                </div>

                <button
                  onClick={() => setClienteSeleccionado(clienteSeleccionado === cliente.id ? null : cliente.id)}
                  className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-sm"
                >
                  {clienteSeleccionado === cliente.id ? 'Ocultar' : 'Ver'} Historial
                </button>

                {clienteSeleccionado === cliente.id && (
                  <div className="mt-4 border-t pt-4 max-h-64 overflow-y-auto">
                    <h4 className="font-bold text-gray-800 mb-2">Historial de Operaciones</h4>
                    {cliente.historial.map((h, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded mb-2 text-sm">
                        <div className="flex justify-between font-semibold">
                          <span className="text-indigo-700">{h.descripcion}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {h.fecha} - {h.hora}
                        </div>
                        {h.tipo !== 'inicio' && (
                          <div className="mt-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monto:</span>
                              <span className="font-semibold">${h.monto.toFixed(2)}</span>
                            </div>
                            {h.interesPagado && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Interés:</span>
                                <span>${h.interesPagado.toFixed(2)}</span>
                              </div>
                            )}
                            {h.abonoCapital && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Abono:</span>
                                <span>${h.abonoCapital.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Capital restante:</span>
                              <span className="font-semibold">${h.capitalRestante.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {clientesEliminados.length > 0 && (
          <div className="bg-red-50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <Undo2 size={24} />
              Clientes Eliminados (Restaurar)
            </h2>
            <div className="space-y-2">
              {clientesEliminados.map(cliente => (
                <div key={cliente.id} className="flex justify-between items-center bg-white p-4 rounded">
                  <span className="font-semibold text-gray-800">{cliente.nombre}</span>
                  <button
                    onClick={() => restaurarCliente(cliente.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <Undo2 size={16} />
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {modalPago.tipo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {modalPago.tipo === 'interes' && 'Pagar Interés'}
                {modalPago.tipo === 'interes-capital' && 'Pagar Interés + Abonar Capital'}
                {modalPago.tipo === 'abono' && 'Abonar al Capital'}
                {modalPago.tipo === 'reenganche' && 'Confirmar Reenganche'}
              </h3>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">Cliente: <strong>{modalPago.cliente.nombre}</strong></p>
                <p className="text-gray-600 mb-2">Capital actual: <strong className="text-blue-600">${modalPago.cliente.capitalActual.toFixed(2)}</strong></p>
                {modalPago.tipo !== 'reenganche' && (
                  <p className="text-gray-600">
                    Interés actual: <strong className="text-orange-600">
                      ${calcularInteres(modalPago.cliente.capitalActual, modalPago.cliente.tasaInteres).toFixed(2)}
                    </strong>
                  </p>
                )}
              </div>

              {(modalPago.tipo === 'interes' || modalPago.tipo === 'interes-capital' || modalPago.tipo === 'abono' || modalPago.tipo === 'reenganche') && (
                <input
                  type="number"
                  placeholder={
                    modalPago.tipo === 'interes' ? 'Monto del interés pagado' :
                    modalPago.tipo === 'reenganche' ? 'Monto del reenganche' :
                    'Monto a pagar'
                  }
                  value={datosPago.montoPagado}
                  onChange={e => setDatosPago({ ...datosPago, montoPagado: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 mb-3 focus:border-indigo-500 focus:outline-none"
                />
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <input
                  type="date"
                  value={datosPago.fecha}
                  onChange={e => setDatosPago({ ...datosPago, fecha: e.target.value })}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="time"
                  value={datosPago.hora}
                  onChange={e => setDatosPago({ ...datosPago, hora: e.target.value })}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => registrarPago(modalPago.cliente.id, modalPago.tipo)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setModalPago({ tipo: null, cliente: null })}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
