import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductos, addToCarrito } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import defaultProductImage from '../assets/default-product.jpg';
import SearchBar from '../components/SearchBar';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductos();
        setProductos(data);
        setFilteredProductos(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProductos(productos);
    } else {
      const filtered = productos.filter(producto =>
        producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  }, [searchTerm, productos]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Función para obtener la imagen de portada
  const getCoverImage = (producto) => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      // Buscar la imagen principal o usar la primera
      const principalImage = producto.imagenes.find(img => img.esPrincipal);
      return principalImage ? principalImage.url : producto.imagenes[0].url;
    }
    return producto.image || null;
  };

  const handleAddToCart = async (productoId) => {
    if (!user) {
      toast.warn("Por favor, inicia sesión para añadir productos al carrito.");
      return;
    }
    try {
      await addToCarrito(user.id, productoId, 1);
      toast.success("Producto añadido al carrito");
    } catch (error) {
      toast.error("Error al añadir producto al carrito");
    }
  };

  return (
    <div className="catalogo-container">
      <h2>Catálogo de Productos</h2>
      
      <div className="catalog-search">
        <SearchBar onSearch={handleSearch} placeholder="Buscar productos..." />
      </div>
      
      {searchTerm && (
        <div className="search-results-info">
          {filteredProductos.length > 0 
            ? `Se encontraron ${filteredProductos.length} producto(s) para "${searchTerm}"`
            : `No se encontraron productos para "${searchTerm}"`
          }
        </div>
      )}
      
      <div className="product-list">
        {filteredProductos.map(p => {
          const coverImage = getCoverImage(p);
          return (
            <div key={p.id} className="product-card">
              <Link to={`/producto/${p.id}`}>
                <img 
                  src={coverImage ? `http://localhost:5000${coverImage}` : defaultProductImage} 
                  alt={p.name} 
                />
                <h3>{p.name}</h3>
              </Link>
              <p className="product-category">{p.Categoria?.name || 'Sin categoría'}</p>

              <p className="product-price">${p.price}</p>
              <button 
                className="add-to-cart-btn" 
                onClick={() => handleAddToCart(p.id)}
              >
                Añadir al carrito
              </button>
            </div>
          );
        })}
      </div>
      
      {filteredProductos.length === 0 && !searchTerm && (
        <div className="no-products">
          <p>No hay productos disponibles en este momento.</p>
        </div>
      )}
    </div>
  );
};

export default Catalogo;
