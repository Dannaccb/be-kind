import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { actionsApi } from '../api/actions';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';

interface CreateActionFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  color?: string;
}

const CreateAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateActionFormData>({
    defaultValues: {
      status: 'active',
    },
  });

  const descriptionLength = watch('description')?.length || 0;
  const maxDescriptionLength = 300;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 5MB', {
          icon: '⚠️',
        });
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato de archivo no válido. Use JPG, PNG o SVG', {
          icon: '⚠️',
        });
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CreateActionFormData) => {
    setIsLoading(true);
    try {
      // Validate required file
      if (!selectedFile) {
        toast.error('Por favor, selecciona una imagen para la acción', {
          icon: '⚠️',
        });
        setIsLoading(false);
        return;
      }

      // Prepare the action data - status will be converted to Integer in API
      // Keep as string/boolean for form, API will convert to Integer (1=active, 0=inactive)
      let statusValue: 'active' | 'inactive' = 'active';
      if (typeof data.status === 'string') {
        statusValue = data.status === 'active' ? 'active' : 'inactive';
      } else if (typeof data.status === 'boolean') {
        statusValue = data.status ? 'active' : 'inactive';
      }
      
      // Server requires FormData, so we must send the file
      const actionData = {
        name: data.name,
        description: data.description,
        status: statusValue,
        color: data.color,
        file: selectedFile, // File is required for FormData
      };
      
      if (import.meta.env.DEV) {
        console.log('📝 Creating action with data:', {
          name: actionData.name,
          description: actionData.description,
          status: actionData.status,
          color: actionData.color,
          hasFile: !!selectedFile,
          fileName: selectedFile?.name,
          fileSize: selectedFile?.size,
          fileType: selectedFile?.type,
        });
      }
      
      await actionsApi.create(actionData);

      toast.success('¡Acción creada exitosamente!', {
        icon: '✅',
      });
      
      // Close drawer first, then navigate
      setIsDrawerOpen(false);
      // Small delay to allow drawer animation, then navigate without page reload
      setTimeout(() => {
        navigate('/dashboard', { replace: true, state: { refresh: true } });
      }, 200);
    } catch (error: any) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.data?.message ||
        'Error al crear la acción';
      toast.error(errorMessage, {
        icon: '❌',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 w-full min-h-screen flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-3 lg:p-4 overflow-y-auto bg-gray-50 mt-14 sm:mt-16 lg:mt-16">
          <div className="max-w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Acción</h1>

            {/* Drawer/Modal */}
            {isDrawerOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end backdrop-blur-sm">
                <div
                  className="bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
                  style={{ height: '100vh', width: '50%', maxWidth: '800px' }}
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <h2 className="text-2xl font-bold text-gray-800">
                        Crear acción
                      </h2>
                      <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Form */}
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex-1 overflow-y-auto p-6"
                    >
                      <div className="space-y-6">
                        {/* Name Field */}
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Nombre de la acción*
                          </label>
                          <input
                            id="name"
                            type="text"
                            {...register('name', {
                              required: 'El nombre es requerido',
                              minLength: {
                                value: 3,
                                message: 'El nombre debe tener al menos 3 caracteres',
                              },
                            })}
                            placeholder="Escribe el nombre de la buena acción"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        {/* Description Field */}
                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Descripción de la buena acción*
                          </label>
                          <textarea
                            id="description"
                            rows={6}
                            {...register('description', {
                              required: 'La descripción es requerida',
                              maxLength: {
                                value: maxDescriptionLength,
                                message: `La descripción no puede exceder ${maxDescriptionLength} caracteres`,
                              },
                              minLength: {
                                value: 10,
                                message: 'La descripción debe tener al menos 10 caracteres',
                              },
                            })}
                            placeholder="Agregar descripción"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                              errors.description
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                          />
                          <div className="flex justify-between mt-1">
                            <div>
                              {errors.description && (
                                <p className="text-sm text-red-600">
                                  {errors.description.message}
                                </p>
                              )}
                            </div>
                            <p
                              className={`text-sm ${
                                descriptionLength > maxDescriptionLength
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {descriptionLength}/{maxDescriptionLength}
                            </p>
                          </div>
                        </div>

                        {/* Logo/Icon Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo/Imagen*
                          </label>
                          {previewUrl ? (
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700">
                                    {selectedFile?.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(selectedFile?.size || 0) / 1024} KB
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleRemoveFile}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar imagen"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                                className="hidden"
                                id="logo-upload"
                                onChange={handleFileChange}
                              />
                              <label
                                htmlFor="logo-upload"
                                className="cursor-pointer flex flex-col items-center"
                              >
                                <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600 font-medium">
                                  Clic para cargar archivo
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                  JPG, PNG, SVG (máx. 5MB)
                                </span>
                              </label>
                            </div>
                          )}
                          {!previewUrl && (
                            <p className="mt-2 text-xs text-gray-500">
                              Formatos permitidos: JPG, PNG, SVG (máx. 5MB)
                            </p>
                          )}
                        </div>

                        {/* Color Field */}
                        <div>
                          <label
                            htmlFor="color"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Color*
                          </label>
                          <div className="flex gap-4">
                            <input
                              id="color"
                              type="text"
                              {...register('color', {
                                pattern: {
                                  value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                                  message: 'Formato HEX inválido (ej: #FF5733)',
                                },
                              })}
                              placeholder="Registra color código HEX"
                              className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.color ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            <input
                              type="color"
                              {...register('color')}
                              className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                            />
                          </div>
                          {errors.color && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.color.message}
                            </p>
                          )}
                        </div>

                        {/* Status Toggle */}
                        <div>
                          <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Estado
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                {...register('status')}
                                className="sr-only peer"
                                defaultChecked
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ml-3 text-sm text-gray-700">
                                Activo
                              </span>
                            </label>
                          </label>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-4 mt-8 pt-6 border-t">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                            isLoading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="spinner w-5 h-5 border-2"></div>
                              Creando...
                            </span>
                          ) : (
                            'Crear'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateAction;

