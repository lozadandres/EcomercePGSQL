import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductos } from '../services/api';
import defaultProductImage from '../assets/default-product.jpg';

const Home = () => {
  const [productos, setProductos] = useState([]);

  // Función para obtener la imagen de portada
  const getCoverImage = (producto) => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      // Buscar la imagen principal o usar la primera
      const principalImage = producto.imagenes.find(img => img.esPrincipal);
      return principalImage ? principalImage.url : producto.imagenes[0].url;
    }
    return producto.image || null;
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // Fetch all products and show a selection, e.g., the first 4
        const allProductos = await getProductos();
        setProductos(allProductos.slice(0, 4)); 
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
      }
    };
    fetchProductos();
  }, []);

  return (
    <div>
      <div style={{ textAlign: 'center', margin: '2rem' }}>
        <h1>Bienvenidos a EpicPlay Store</h1>
        <p>Tu tienda de confianza para juegos y más.</p>
      </div>

      <h2>Productos Destacados</h2>
      <div className="product-list">
        {productos.map(p => {
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
              <p className="product-price">${p.price}</p>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', margin: '2rem' }}>
        <Link to="/catalogo">Ver todos los productos</Link>
      </div>
    </div>
  );
};

export default Home;
