const API_URL = 'http://localhost:5000';

const request = async (endpoint, method = 'GET', body = null, headers = {}, isFormData = false) => {
  console.log(`API Request: ${method} ${endpoint}`, { headers, isFormData });
  
  const config = {
    method,
    headers: {
      ...headers,
    },
  };

  if (isFormData) {
    config.body = body;
    console.log('Sending FormData');
  } else if (body) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
    console.log('Sending JSON:', body);
  }

  try {
    console.log('Fetch config:', { url: `${API_URL}${endpoint}`, method, headers: config.headers });
    const response = await fetch(`${API_URL}${endpoint}`, config);
    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.log('Response not OK, trying to parse error...');
      const contentType = response.headers.get('content-type');
      console.log('Error response content-type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('Error response (JSON):', errorData);
        throw new Error(errorData.message || 'Something went wrong');
      } else {
        const errorText = await response.text();
        console.error('Error response (Text):', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }
    if (response.status === 204) {
        return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('Response data:', result);
      return result;
    } else {
      const textResult = await response.text();
      console.log('Response text:', textResult);
      throw new Error('Expected JSON response but got: ' + contentType);
    }
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

// Auth
export const login = (credentials) => request('/login', 'POST', credentials);
export const register = (userData) => request('/registro', 'POST', userData);

// Products
export const getProductos = () => request('/productos');
export const getProductoById = (id) => request(`/productos/${id}`);
export const createProducto = (data, userId) => request('/productos', 'POST', data, { 'X-User-ID': userId }, true);
export const updateProducto = (id, data, userId) => request(`/productos/${id}`, 'PUT', data, { 'X-User-ID': userId }, true);
export const deleteProducto = (id, userId) => request(`/productos/${id}`, 'DELETE', null, { 'X-User-ID': userId });

// Categories
export const getCategorias = () => request('/categorias');
export const createCategoria = (data, userId) => request('/categorias', 'POST', data, { 'X-User-ID': userId });
export const updateCategoria = (id, data, userId) => request(`/categorias/${id}`, 'PUT', data, { 'X-User-ID': userId });
export const deleteCategoria = (id, userId) => request(`/categorias/${id}`, 'DELETE', null, { 'X-User-ID': userId });

// Cart
export const getCarrito = (usuarioId) => request(`/carrito/${usuarioId}`);
export const addToCarrito = (usuarioId, productoId, quantity) => request(`/carrito/${usuarioId}`, 'POST', { productoId, quantity });
export const updateCarrito = (usuarioId, productoId, quantity) => request(`/carrito/${usuarioId}`, 'PUT', { productoId, quantity });
export const removeFromCarrito = (usuarioId, productoId) => request(`/carrito/${usuarioId}/${productoId}`, 'DELETE');
export const clearCarrito = (usuarioId) => request(`/carrito/${usuarioId}`, 'DELETE');

// Users (Admin)
export const getUsuarios = (userId) => request('/usuarios', 'GET', null, { 'X-User-ID': userId });
export const createUsuario = (data, userId) => request('/usuarios', 'POST', data, { 'X-User-ID': userId });
export const updateUsuario = (id, data, userId) => request(`/usuarios/${id}`, 'PUT', data, { 'X-User-ID': userId });
export const deleteUsuario = (id, userId) => request(`/usuarios/${id}`, 'DELETE', null, { 'X-User-ID': userId });
