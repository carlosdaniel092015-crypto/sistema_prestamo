import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, Users, Calendar, PieChart, Activity } from 'lucide-react';

export default function Dashboard({ clientes }) {
  const estadisticas = useMemo(() => {
    const totalClientes = clientes.length;
    const capitalTotal = clientes.reduce((sum, c) => sum + c.capitalActual, 0);
    const interesTotal = clientes.reduce((sum, c) => {
      const interes = c.capitalActual * (c.tasaInteres / 100);
      return sum + interes;
    }, 0);
    const totalPagadoGeneral = clientes.reduce((sum, c) => sum + (c.totalPagado || 0), 0);
    
    // Clientes por tasa de interés
    const quincenal = clientes.filter(c => c.tasaInteres === 5).length;
    const mensual = clientes.filter(c => c.tasaInteres === 10).length;
    
    // Capital por categoría
    const capitalQuincenal = clientes
      .filter(c => c.tasaInteres === 5)
      .reduce((sum, c) => sum + c.capitalActual, 0);
    const capitalMensual = clientes
      .filter(c => c.tasaInteres === 10)
      .reduce((sum, c) => sum + c.capitalActual, 0);
    
    // Pagos recientes (últimos 7 días)
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let pagosRecientes = 0;
    clientes.forEach(cliente => {
      cliente.historial.forEach(h => {
        if (h.tipo === 'interes' || h.tipo === 'interes-capital' || h.tipo === 'abono') {
          const [dia, mes, anio] = h.fecha.split('/');
          const fechaPago = new Date(anio, mes - 1, dia);
          if (fechaPago >= hace7Dias) {
            pagosRecientes++;
          }
        }
      });
    });
    
    // Interés promedio por cliente
    const interesPromedio = totalClientes > 0 ? interesTotal / totalClientes : 0;
    
    return {
      totalClientes,
      capitalTotal,
      interesTotal,
      totalPagadoGeneral,
      quincenal,
      mensual,
      capitalQuincenal,
      capitalMensual,
      pagosRecientes,
      interesPromedio
    };
  }, [clientes]);

  const porcentajeQuincenal = estadisticas.totalClientes > 0 
    ? (estadisticas.quincenal / estadisticas.totalClientes * 100).toFixed(1)
    : 0;
  
  const porcentajeMensual = estadisticas.totalClientes > 0 
    ? (estadisticas.mensual / estadisticas.totalClientes * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 mb-6">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clientes */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users size={40} className="opacity-80" />
            <span className="text-3xl font-bold">{estadisticas.totalClientes}</span>
          </div>
          <h3 className="text-lg font-semibold">Total Clientes</h3>
          <p className="text-sm opacity-90 mt-1">Clientes activos</p>
        </div>

        {/* Capital Total */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={40} className="opacity-80" />
            <span className="text-3xl font-bold">${estadisticas.capitalTotal.toFixed(0)}</span>
          </div>
          <h3 className="text-lg font-semibold">Capital Total</h3>
          <p className="text-sm opacity-90 mt-1">Capital activo en préstamos</p>
        </div>

        {/* Interés Total */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={40} className="opacity-80" />
            <span className="text-3xl font-bold">${estadisticas.interesTotal.toFixed(0)}</span>
          </div>
          <h3 className="text-lg font-semibold">Interés Esperado</h3>
          <p className="text-sm opacity-90 mt-1">Interés del período actual</p>
        </div>

        {/* Total Pagado */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity size={40} className="opacity-80" />
            <span className="text-3xl font-bold">${estadisticas.totalPagadoGeneral.toFixed(0)}</span>
          </div>
          <h3 className="text-lg font-semibold">Total Recaudado</h3>
          <p className="text-sm opacity-90 mt-1">Pagos históricos totales</p>
        </div>
      </div>

      {/* Fila de estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Distribución por tipo de interés */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="text-indigo-600" size={28} />
            <h3 className="text-xl font-bold text-gray-800">Distribución de Clientes</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">5% Quincenal</span>
                <span className="text-indigo-600 font-bold">{estadisticas.quincenal} ({porcentajeQuincenal}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeQuincenal}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">10% Mensual</span>
                <span className="text-purple-600 font-bold">{estadisticas.mensual} ({porcentajeMensual}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeMensual}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Capital por categoría */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-green-600" size={28} />
            <h3 className="text-xl font-bold text-gray-800">Capital por Categoría</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Quincenal (5%)</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${estadisticas.capitalQuincenal.toFixed(2)}
                </p>
              </div>
              <div className="text-indigo-600">
                <TrendingUp size={32} />
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Mensual (10%)</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${estadisticas.capitalMensual.toFixed(2)}
                </p>
              </div>
              <div className="text-purple-600">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600" size={28} />
            <h3 className="text-xl font-bold text-gray-800">Actividad Reciente</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pagos (7 días)</p>
                <p className="text-3xl font-bold text-blue-600">
                  {estadisticas.pagosRecientes}
                </p>
              </div>
              <div className="text-blue-600">
                <Activity size={32} />
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Interés Promedio</p>
                <p className="text-2xl font-bold text-green-600">
                  ${estadisticas.interesPromedio.toFixed(2)}
                </p>
              </div>
              <div className="text-green-600">
                <DollarSign size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 clientes por capital */}
      {clientes.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={24} />
            Top 5 Clientes por Capital
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">#</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Cliente</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Capital</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Interés</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Tasa</th>
                </tr>
              </thead>
              <tbody>
                {[...clientes]
                  .sort((a, b) => b.capitalActual - a.capitalActual)
                  .slice(0, 5)
                  .map((cliente, idx) => {
                    const interes = cliente.capitalActual * (cliente.tasaInteres / 100);
                    return (
                      <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="bg-indigo-100 text-indigo-700 font-bold py-1 px-3 rounded-full">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{cliente.nombre}</td>
                        <td className="py-3 px-4 text-right font-bold text-green-600">
                          ${cliente.capitalActual.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-orange-600">
                          ${interes.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            cliente.tasaInteres === 5 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {cliente.tasaInteres}% {cliente.tasaInteres === 5 ? 'Q' : 'M'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
