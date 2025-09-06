const formatNumber = (number) => {
  if (number === null || number === undefined || number === '') return '';
  return new Intl.NumberFormat('es-CO').format(Number(number));
};
import React, { useState, useEffect } from 'react';
import { getCarrito, removeFromCarrito, clearCarrito, updateCarrito } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import defaultProductImage from '../assets/default-product.jpg';

const CarritoCompra = () => {
  const [carrito, setCarrito] = useState({ Productos: [] });
  const { user } = useAuth();

  const fetchCarrito = async () => {
    if (user) {
      try {
        const data = await getCarrito(user.id);
        setCarrito(data || { Productos: [] });
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
      }
    }
  };

  useEffect(() => {
    fetchCarrito();
  }, [user]);

  const handleRemove = async (productoId) => {
    try {
      await removeFromCarrito(user.id, productoId);
      fetchCarrito(); // Recargar el carrito
      toast.success("Producto eliminado del carrito");
    } catch {
      toast.error("Error al eliminar el producto del carrito");
    }
  };

  const handleClear = async () => {
    try {
      await clearCarrito(user.id);
      fetchCarrito(); // Recargar el carrito
      toast.success("Carrito vaciado");
    } catch {
      toast.error("Error al vaciar el carrito");
    }
  };

  const handleQuantityChange = async (productoId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCarrito(user.id, productoId, quantity);
      fetchCarrito();
      toast.info("Cantidad actualizada");
    } catch {
      toast.error("Error al actualizar la cantidad");
    }
  };

  const calculateTotal = () => {
    if (!carrito.Productos) return 0;
    return carrito.Productos.reduce((total, item) => {
      return total + item.price * item.CarritoProducto.quantity;
    }, 0).toFixed(2);
  };

  if (!user) {
    return <h2>Por favor, inicia sesión para ver tu carrito.</h2>;
  }
  
  return (
    <div>
      <h2>Carrito de Compras</h2>
      {carrito.Productos && carrito.Productos.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul>
            {carrito.Productos && carrito.Productos.map(item => (
              <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <img 
                  src={item.image ? `http://localhost:5000${item.image}` : defaultProductImage} 
                  alt={item.name} 
                  style={{ width: '50px', height: '50px', marginRight: '10px' }} 
                />
                <span>{item.name} - ${formatNumber(item.price)}</span>
                <input 
                  type="number" 
                  value={item.CarritoProducto.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                  min="1"
                  style={{ width: '80px', margin: '0 10px' }}
                />
                <span>Subtotal: ${formatNumber(item.price * item.CarritoProducto.quantity)}</span>
                <button onClick={() => handleRemove(item.id)} style={{ marginLeft: '10px' }}>Eliminar</button>
              </li>
            ))}
          </ul>
          <h3>Total: ${formatNumber(calculateTotal())}</h3>
          <button onClick={handleClear}>Vaciar Carrito</button>
          <button>Proceder al Pago</button>
        </>
      )}
    </div>
  );
};

export default CarritoCompra;
