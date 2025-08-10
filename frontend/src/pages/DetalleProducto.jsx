import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductoById, addToCarrito } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import defaultProductImage from '../assets/default-product.jpg';

const DetalleProducto = () => {
  const [producto, setProducto] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const data = await getProductoById(id);
        setProducto(data);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      }
    };
    fetchProducto();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.warn("Por favor, inicia sesión para añadir productos al carrito.");
      return;
    }
    try {
      await addToCarrito(user.id, producto.id, 1);
      toast.success("Producto añadido al carrito");
    } catch (error) {
      toast.error("Error al añadir producto al carrito");
    }
  };

  if (!producto) return <div>Cargando...</div>;

  // Obtener imágenes del producto
  const productImages = producto.imagenes && producto.imagenes.length > 0 
    ? producto.imagenes.sort((a, b) => a.orden - b.orden).map(img => img.url)
    : producto.image ? [producto.image] : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="producto-detalle">
      <h2>{producto.name}</h2>
      <div className="producto-info">
        
        <div className="producto-images">
          {productImages.length > 0 ? (
            <div className="image-carousel">
              <div className="main-image">
                <img 
                  src={`http://localhost:5000${productImages[currentImageIndex]}`} 
                  alt={producto.name} 
                />
                {productImages.length > 1 && (
                  <>
                    <button className="carousel-btn prev" onClick={prevImage}>‹</button>
                    <button className="carousel-btn next" onClick={nextImage}>›</button>
                  </>
                )}
              </div>
              
              {productImages.length > 1 && (
                <div className="image-thumbnails">
                  {productImages.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000${image}`}
                      alt={`${producto.name} ${index + 1}`}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <img src={defaultProductImage} alt={producto.name} className="default-image" />
          )}
        </div>
        
        <div className="producto-details">
          <p className="description">{producto.description}</p>
          <p className="category">Categoría: {producto.Categoria?.name || 'Sin categoría'}</p>

          <h3 className="price">${producto.price}</h3>
          <p className="stock">Stock: {producto.stock}</p>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto;
