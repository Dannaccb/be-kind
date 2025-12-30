import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { actionsApi, Action } from '../api/actions';
import { formatDate } from '../utils/format';
import Loading from '../components/Loading';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

const Dashboard = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Verify token exists before making request
      let token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
      
      // Try direct sessionStorage if storage.get didn't work
      if (!token) {
        const directToken = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (directToken) {
          // Remove quotes if it's a JSON string
          token = directToken.replace(/^"(.*)"$/, '$1').trim();
        }
      }
      
      if (!token) {
        const errorMsg = 'No hay token de autenticación. Por favor, inicia sesión nuevamente.';
        setError(errorMsg);
        toast.error(errorMsg, {
          icon: '⚠️',
        });
        setIsLoading(false);
        return;
      }
      
      if (import.meta.env.DEV) {
        console.log('🔄 Fetching actions:', {
          pageNumber,
          pageSize,
          tokenPreview: token.substring(0, 30) + '...',
        });
      }
      
      const response = await actionsApi.getList(pageNumber, pageSize);
      
      if (import.meta.env.DEV) {
        console.log('✅ Actions response received:', {
          dataCount: response.data?.length || 0,
          totalCount: response.totalCount,
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
        });
      }
      
      // Ensure we have valid data
      const actionsData = Array.isArray(response.data) ? response.data : [];
      const total = response.totalCount || 0;
      const pages = response.totalPages || (total > 0 ? Math.ceil(total / pageSize) : 1);
      
      if (import.meta.env.DEV) {
        console.log('📊 Processing response:', {
          rawData: response.data,
          actionsDataLength: actionsData.length,
          totalCount: total,
          totalPages: pages,
          currentPage: pageNumber,
        });
      }
      
      setActions(actionsData);
      setTotalPages(pages);
      setTotalCount(total);
      
      if (import.meta.env.DEV) {
        console.log('✅ Dashboard state updated:', {
          actionsCount: actionsData.length,
          totalCount: total,
          totalPages: pages,
          currentPage: pageNumber,
          hasData: actionsData.length > 0,
        });
      }
      
      // Show info message if no data but request was successful
      if (actionsData.length === 0 && total === 0) {
        if (import.meta.env.DEV) {
          console.log('ℹ️ No actions found in response - showing empty state');
        }
      } else if (actionsData.length === 0 && total > 0) {
        if (import.meta.env.DEV) {
          console.warn('⚠️ Total count indicates data exists but array is empty');
        }
      }
    } catch (err: any) {
      console.error('❌ Error fetching actions:', err);
      
      let errorMessage =
        err.message ||
        err.response?.data?.message ||
        err.data?.message ||
        err.response?.data?.error ||
        err.data?.error ||
        'Error al cargar las acciones';
      
      // Handle CORS errors specifically
      if (err.isCorsError || (!err.response && err.message === 'Network Error')) {
        errorMessage = 'Error de CORS: El servidor no permite peticiones desde este origen. ' +
          'Por favor, verifica la configuración del servidor o contacta al administrador. ' +
          'Si estás en desarrollo, intenta reiniciar el servidor de desarrollo.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: '⚠️',
        autoClose: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1);
  };

  // Memoize filtered actions to avoid re-filtering on every render
  const displayActions = useMemo(() => {
    if (!searchTerm) return actions;
    const lowerSearch = searchTerm.toLowerCase();
    return actions.filter((action) =>
      action.name?.toLowerCase().includes(lowerSearch) ||
      action.description?.toLowerCase().includes(lowerSearch)
    );
  }, [actions, searchTerm]);

  const getStatusBadge = (status: string | boolean | number | undefined) => {
    // Handle different status formats: number (1=active, 0=inactive), string, or boolean
    let isActive = false;
    
    if (typeof status === 'number') {
      isActive = status === 1;
    } else if (typeof status === 'boolean') {
      isActive = status;
    } else if (typeof status === 'string') {
      const statusStr = status.toLowerCase();
      isActive = statusStr === 'active' || statusStr === 'activo' || statusStr === 'true' || statusStr === '1';
    }
    
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          isActive
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}
      >
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // formatDate is imported from utils

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 w-full lg:w-[calc(100%-16rem)] min-h-screen flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-3 lg:p-4 overflow-y-auto bg-gray-50 mt-16 lg:mt-[10vh]">
          <div className="max-w-full">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Acciones</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-4 border-b border-gray-200">
              <button className="px-3 py-2 text-blue-700 font-semibold border-b-2 border-blue-700 transition-colors text-sm">
                Acciones
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
                Tipos
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
                Evidencias
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-stretch sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium transition-colors text-sm whitespace-nowrap">
                  <FunnelIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/acciones/crear')}
                  className="px-3 sm:px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 font-medium shadow-sm text-sm whitespace-nowrap"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Crear Acción</span>
                  <span className="sm:hidden">Crear</span>
                </button>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <Loading />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 text-sm mb-3">{error}</p>
                <button
                  onClick={fetchActions}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Reintentar
                </button>
              </div>
            ) : actions.length === 0 && !isLoading && !error ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-1 text-sm">
                    {searchTerm
                      ? 'No se encontraron acciones que coincidan con tu búsqueda'
                      : 'No hay acciones disponibles'}
                  </p>
                  <p className="text-gray-500 text-xs mb-3">
                    {searchTerm
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Crea tu primera acción para comenzar'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => navigate('/dashboard/acciones/crear')}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 text-sm"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Crear primera acción
                    </button>
                  )}
                </div>
              </div>
            ) : displayActions.length > 0 ? (
              <>
                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto -mx-3 lg:mx-0">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-1.5">
                              Nombre de la acción
                              <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              Icono de la acción
                              <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              Estado
                              <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              Descripción
                              <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              Fecha de creación
                              <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayActions.map((action) => (
                          <tr key={action.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {action.name || 'Sin nombre'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {action.icon ? (
                                typeof action.icon === 'string' && action.icon.startsWith('http') ? (
                                  // If icon is a URL, show as image
                                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden shadow-sm">
                                    <img 
                                      src={action.icon} 
                                      alt={action.name || 'Icon'} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Fallback if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<span class="text-gray-400 text-xs">—</span>';
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  // If icon is an emoji or text, show as text
                                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shadow-sm">
                                    <span className="text-lg">{action.icon}</span>
                                  </div>
                                )
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">—</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {getStatusBadge(action.status)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                              <div className="truncate" title={action.description || 'Sin descripción'}>
                                {action.description || 'Sin descripción'}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {action.createdAt ? formatDate(action.createdAt) : '—'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                  title="Editar"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                                  title="Eliminar"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100"
                                  title="Ver"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination - Only show if there are results */}
                {totalCount > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                        Resultados por página
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <div className="text-xs text-gray-700 font-medium text-center sm:text-left">
                      {pageNumber * pageSize - pageSize + 1} -{' '}
                      {Math.min(pageNumber * pageSize, totalCount)} de {totalCount}
                    </div>
                    <div className="flex gap-1 justify-center sm:justify-end">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={pageNumber === 1}
                        className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        title="Primera página"
                      >
                        <ChevronDoubleLeftIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handlePageChange(pageNumber - 1)}
                        disabled={pageNumber === 1}
                        className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        title="Página anterior"
                      >
                        <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handlePageChange(pageNumber + 1)}
                        disabled={pageNumber >= totalPages || totalPages === 0}
                        className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        title="Página siguiente"
                      >
                        <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={pageNumber >= totalPages || totalPages === 0}
                        className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        title="Última página"
                      >
                        <ChevronDoubleRightIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

