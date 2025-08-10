import React, { useState, useEffect } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, getCategorias } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import defaultProductImage from '../assets/default-product.jpg';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState(product || { name: '', price: '', description: '', stock: '', CategoriaId: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showCategorias, setShowCategorias] = useState(false);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    // Inicializar el formulario con los datos del producto o valores vacíos
    setFormData(product || { name: '', price: '', description: '', stock: '', CategoriaId: '' });
    
    const fetchCategorias = async () => {
        const data = await getCategorias();
        setCategorias(data);
        
        // Si estamos editando un producto, asegurarse de que CategoriaId esté correctamente establecido
        if (product) {
            // Si el producto tiene una categoría, usar su ID
            if (product.Categoria && product.Categoria.id) {
                const categoriaId = product.Categoria.id.toString();
                setFormData(prev => ({...prev, CategoriaId: categoriaId}));
                setSelectedCategorias([categoriaId]);
            } 
            // Si el producto tiene CategoriaId directamente
            else if (product.CategoriaId) {
                const categoriaId = product.CategoriaId.toString();
                setFormData(prev => ({...prev, CategoriaId: categoriaId}));
                setSelectedCategorias([categoriaId]);
            }
        } 
        // Si estamos creando un producto nuevo y hay categorías disponibles
        else if (data.length > 0) {
            const categoriaId = data[0].id.toString();
            setFormData(prev => ({...prev, CategoriaId: categoriaId}));
            setSelectedCategorias([categoriaId]);
        }
    }
    fetchCategorias();
  }, [product]);
  
  // Efecto para depuración
  useEffect(() => {
    if (product) {
      console.log('Producto para editar:', product);
      console.log('CategoriaId establecido:', formData.CategoriaId);
      console.log('Categorías seleccionadas:', selectedCategorias);
    }
  }, [product, formData.CategoriaId, selectedCategorias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    // Crear previsualizaciones
    const previews = files.map(file => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(previews).then(setPreviewImages);
  };
  
  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, imageFiles);
  };

  // Función para manejar la selección de categorías
  const handleCategoriaToggle = (categoriaId) => {
    // Por ahora, solo permitimos una categoría (relación uno a muchos)
    // En el futuro, si se cambia a muchos a muchos, se puede modificar esta lógica
    setSelectedCategorias([categoriaId]);
    setFormData(prev => ({ ...prev, CategoriaId: categoriaId }));
    setShowCategorias(false); // Ocultar el selector después de seleccionar
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <input 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          placeholder="Nombre" 
          className="form-control"
          required 
        />
      </div>
      
      <div className="form-group">
        <input 
          name="price" 
          type="number" 
          value={formData.price} 
          onChange={handleChange} 
          placeholder="Precio" 
          className="form-control"
          required 
        />
      </div>
      
      <div className="form-group">
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Descripción"
          className="form-control"
          rows="4"
        ></textarea>
      </div>
      
      <div className="form-group file-input">
        <input 
          name="images" 
          type="file" 
          multiple
          accept="image/*"
          onChange={handleFileChange} 
          className="form-control"
        />
        
        {/* Mostrar imágenes existentes del producto */}
        {product && product.imagenes && product.imagenes.length > 0 && imageFiles.length === 0 && (
          <div className="current-images">
            <small>Imágenes actuales:</small>
            <div className="images-grid">
              {product.imagenes.map((imagen, index) => (
                <div key={index} className="image-item">
                  <img src={`http://localhost:5000${imagen.url}`} alt={`${product.name} ${index + 1}`} />
                  {imagen.esPrincipal && <span className="principal-badge">Principal</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Mostrar imagen única (compatibilidad) si no hay múltiples imágenes */}
        {product && product.image && !product.imagenes?.length && imageFiles.length === 0 && (
          <div className="current-image">
            <small>Imagen actual:</small>
            <img src={`http://localhost:5000${product.image}`} alt={product.name} />
          </div>
        )}
        
        {/* Mostrar previsualizaciones de nuevas imágenes */}
        {previewImages.length > 0 && (
          <div className="preview-images">
            <small>Nuevas imágenes:</small>
            <div className="images-grid">
              {previewImages.map((preview, index) => (
                <div key={index} className="image-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  {index === 0 && <span className="principal-badge">Principal</span>}
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="form-group">
        <input 
          name="stock" 
          type="number" 
          value={formData.stock} 
          onChange={handleChange} 
          placeholder="Stock" 
          className="form-control"
          required 
        />
      </div>
      
      <div className="form-group categoria-selector">
        <button 
          type="button" 
          className="categoria-toggle" 
          onClick={() => setShowCategorias(!showCategorias)}
        >
          {selectedCategorias.length > 0 
            ? categorias.find(c => c.id.toString() === selectedCategorias[0])?.name || 'Seleccionar categoría'
            : 'Seleccionar categoría'}
        </button>
        
        {showCategorias && (
          <div className="categorias-container">
            {categorias.map(categoria => (
              <div 
                key={categoria.id} 
                className={`categoria-item ${selectedCategorias.includes(categoria.id.toString()) ? 'selected' : ''}`}
                onClick={() => handleCategoriaToggle(categoria.id.toString())}
              >
                {categoria.name}
              </div>
            ))}
          </div>
        )}
        
        {/* Mantenemos el select original pero oculto para mantener la compatibilidad con el backend */}
        <select 
          name="CategoriaId" 
          value={formData.CategoriaId} 
          onChange={handleChange} 
          required
          style={{ display: 'none' }}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="save-btn">Guardar</button>
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};


const DashboardProductos = () => {
  const [productos, setProductos] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const fetchProductos = async () => {
    const data = await getProductos();
    setProductos(data);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProducto(id, user.id);
        fetchProductos();
        toast.success('Producto eliminado');
      } catch (error) {
        toast.error('Error al eliminar el producto');
      }
    }
  };

  const handleSave = async (productData, imageFiles) => {
    console.log('=== handleSave called ===');
    console.log('productData:', productData);
    console.log('imageFiles:', imageFiles);
    console.log('user.id:', user.id);
    
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
        console.log(`Appending ${key}:`, productData[key]);
        formData.append(key, productData[key]);
    });
    
    // Agregar múltiples archivos de imagen
    if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file, index) => {
            console.log(`Appending image file ${index}:`, file.name, file.type, file.size);
            formData.append('images', file);
        });
    }
    
    // Log FormData contents
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    try {
      if (editingProduct) {
        console.log('Updating product with ID:', editingProduct.id);
        await updateProducto(editingProduct.id, formData, user.id);
        toast.success('Producto actualizado');
      } else {
        console.log('Creating new product');
        await createProducto(formData, user.id);
        toast.success('Producto creado');
      }
      fetchProductos();
      setEditingProduct(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsCreating(false);
  }

  return (
    <div>
      <h3>Gestionar Productos</h3>
      
      {(isCreating || editingProduct) ? (
        <ProductForm product={editingProduct} onSave={handleSave} onCancel={handleCancel} />
      ) : (
        <button onClick={() => setIsCreating(true)}>Crear Nuevo Producto</button>
      )}

      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>IMAGEN</th>
              <th>NOMBRE</th>
              <th>PRECIO</th>
              <th>STOCK</th>
              <th>CATEGORÍA</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id}>
                <td className="product-image">
                  {p.image && <img src={`http://localhost:5000${p.image}`} alt={p.name} />}
                  {!p.image && <img src={defaultProductImage} alt={p.name} />}
                </td>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
                <td>{p.Categoria ? p.Categoria.name : 'Sin categoría'}</td>
                <td className="product-actions">
                  <button className="edit-btn" onClick={() => setEditingProduct(p)}>Editar</button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardProductos;
