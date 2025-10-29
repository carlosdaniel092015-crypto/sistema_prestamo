import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  PieChart, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function Dashboard({ clientes }) {
  // Cálculos generales
  const totalClientes = clientes.length;
  const capitalTotal = clientes.reduce((sum, c) => sum + c.capitalActual, 0);
  const capitalInvertido = clientes.reduce((sum, c) => sum + c.capitalInicial, 0);
  const totalRecaudado = clientes.reduce((sum, c) => sum + c.totalPagado, 0);
  
  // Intereses totales a cobrar
  const interesesTotales = clientes.reduce((sum, c) => {
    const interes = c.capitalActual * (c.tasaInteres / 100);
    return sum + interes;
  }, 0);

  // Clientes por tipo de tasa (solo 5% quincenal)
  const clientesQuincenal = clientes.filter(c => c.tasaInteres === 5).length;

  // Clientes con más deuda
  const topDeudores = [...clientes]
    .sort((a, b) => b.capitalActual - a.capitalActual)
    .slice(0, 5);

  // Total pagado en intereses (histórico)
  const totalInteresesPagados = clientes.reduce((sum, cliente) => {
    const pagosInteres = cliente.historial.filter(h => 
      h.tipo === 'interes' || h.tipo === 'interes-capital'
    );
    return sum + pagosInteres.reduce((s, p) => s + (p.interesPagado || p.monto), 0);
  }, 0);

  // Actividad reciente (últimos 7 días)
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  
  let pagosRecientes = 0;
  clientes.forEach(cliente => {
    cliente.historial.forEach(h => {
      if (h.fecha && h.tipo !== 'inicio') {
        const [dia, mes, anio] = h.fecha.split('/');
        const fechaPago = new Date(`${anio}-${mes}-${dia}`);
        if (fechaPago >= hace7Dias) {
          pagosRecientes++;
        }
      }
    });
  });

  // Ganancia estimada mensual (solo 5% quincenal)
  const gananciaEstimadaMensual = clientes.reduce((sum, c) => {
    if (c.tasaInteres === 5) {
      return sum + (c.capitalActual * 0.10); // 5% quincenal = 10% mensual
    } else {
      return sum;
    }
  }, 0);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "indigo" }) => (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`bg-${color}-100 p-2 sm:p-3 rounded-lg`}>
          <Icon className={`text-${color}-600`} size={20} />
        </div>
      </div>
      <h3 className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 break-words">{value}</p>
      {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Título del Dashboard */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-2">Dashboard General</h2>
        <p className="text-sm sm:text-base text-gray-600">Resumen completo de tu cartera de préstamos</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          icon={Users}
          title="Total Clientes"
          value={totalClientes}
          subtitle="Clientes activos"
          color="blue"
        />
        
        <StatCard
          icon={DollarSign}
          title="Capital en Préstamos"
          value={`$${capitalTotal.toFixed(2)}`}
          subtitle="Capital actual total"
          color="green"
        />
        
        <StatCard
          icon={TrendingUp}
          title="Total Recaudado"
          value={`$${totalRecaudado.toFixed(2)}`}
          subtitle="Pagos recibidos"
          color="indigo"
        />
        
        <StatCard
          icon={PieChart}
          title="Intereses a Cobrar"
          value={`$${interesesTotales.toFixed(2)}`}
          subtitle="Próximo período"
          color="orange"
        />
      </div>

      {/* Estadísticas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Ganancia Mensual Estimada</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 break-words">${gananciaEstimadaMensual.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Basado en tasa quincenal
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Intereses Pagados</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 break-words">${totalInteresesPagados.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Total histórico
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Actividad Reciente</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{pagosRecientes}</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Pagos últimos 7 días
          </div>
        </div>
      </div>

      {/* Distribución por tipo de tasa y ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="text-indigo-600" size={20} />
            Distribución por Tasa
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm sm:text-base text-gray-700 font-semibold">5% Quincenal</span>
                <span className="text-sm sm:text-base text-indigo-600 font-bold">{clientesQuincenal} clientes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-indigo-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalClientes > 0 ? (clientesQuincenal / totalClientes) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {totalClientes > 0 ? ((clientesQuincenal / totalClientes) * 100).toFixed(1) : 0}% del total
              </p>
            </div>
          </div>
        </div>

        {/* Capital Invertido vs Recaudado */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Retorno de Inversión
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm sm:text-base text-gray-700 font-semibold">Capital Invertido</span>
                <span className="text-sm sm:text-base text-blue-600 font-bold break-words">${capitalInvertido.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div className="bg-blue-600 h-2 sm:h-3 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm sm:text-base text-gray-700 font-semibold">Total Recaudado</span>
                <span className="text-sm sm:text-base text-green-600 font-bold break-words">${totalRecaudado.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${capitalInvertido > 0 ? Math.min((totalRecaudado / capitalInvertido) * 100, 100) : 0}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {capitalInvertido > 0 ? ((totalRecaudado / capitalInvertido) * 100).toFixed(1) : 0}% recuperado
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-700 font-semibold">Ganancia Neta</span>
                <span className={`text-lg sm:text-xl font-bold break-words ${totalRecaudado - capitalInvertido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(totalRecaudado - capitalInvertido).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Deudores */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="text-orange-600" size={20} />
          Top 5 Préstamos Más Grandes
        </h3>
        
        {topDeudores.length > 0 ? (
          <div className="space-y-3">
            {topDeudores.map((cliente, idx) => {
              const interes = cliente.capitalActual * (cliente.tasaInteres / 100);
              return (
                <div key={cliente.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="bg-indigo-100 text-indigo-600 font-bold rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{cliente.nombre}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Tasa: {cliente.tasaInteres}% {cliente.tasaInteres === 5 ? 'quincenal' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-lg sm:text-xl font-bold text-indigo-600 break-words">${cliente.capitalActual.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm text-orange-600">Interés: ${interes.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8 text-sm sm:text-base">No hay clientes registrados</p>
        )}
      </div>

      {/* Resumen rápido */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <h3 className="text-xl sm:text-2xl font-bold mb-4">💡 Resumen Rápido</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <p className="opacity-90 mb-1">Promedio por cliente</p>
            <p className="text-xl sm:text-2xl font-bold break-words">
              ${totalClientes > 0 ? (capitalTotal / totalClientes).toFixed(2) : '0.00'}
            </p>
          </div>
          <div>
            <p className="opacity-90 mb-1">Tasa promedio efectiva</p>
            <p className="text-xl sm:text-2xl font-bold">
              {totalClientes > 0 
                ? ((clientes.reduce((sum, c) => sum + c.tasaInteres, 0) / totalClientes).toFixed(1))
                : '0'}%
            </p>
          </div>
          <div>
            <p className="opacity-90 mb-1">Proyección mensual</p>
            <p className="text-xl sm:text-2xl font-bold break-words">${gananciaEstimadaMensual.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
