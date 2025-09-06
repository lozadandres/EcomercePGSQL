import React, { useState, useEffect, useCallback } from 'react';
import defaultProductImage from '../assets/default-product.jpg';
import { getUsuarios, updateUsuario, deleteUsuario, createUsuario } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const UserForm = ({ user, onSave, onCancel, isCreating }) => {
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" required />
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      {isCreating && (
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required />
      )}
      <label>
        <input name="isAdmin" type="checkbox" checked={formData.isAdmin} onChange={handleChange} />
        Es Administrador
      </label>
      <label>
        <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} />
        Usuario Activo
      </label>
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
};

const DashboardUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchUsuarios = useCallback(async () => {
    if (currentUser && currentUser.isAdmin) {
      try {
        const data = await getUsuarios(currentUser.id);
        setUsuarios(data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        await updateUsuario(editingUser.id, { 
          name: userData.name, 
          email: userData.email, 
          isAdmin: userData.isAdmin,
          isActive: userData.isActive 
        }, currentUser.id);
        toast.success('Usuario actualizado');
      } else {
        await createUsuario(userData, currentUser.id);
        toast.success('Usuario creado');
      }
      fetchUsuarios();
      setEditingUser(null);
      setIsCreating(false);
    } catch {
      toast.error(`Error al ${editingUser ? 'actualizar' : 'crear'} el usuario`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUsuario(id, currentUser.id);
        fetchUsuarios();
        toast.success('Usuario eliminado');
      } catch {
        toast.error('Error al eliminar el usuario');
      }
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setIsCreating(false);
  };

  return (
    <div>
      <h3>Gestionar Usuarios</h3>
      
      {!isCreating && !editingUser && (
        <button
          onClick={() => setIsCreating(true)}
        >
          AGREGAR USUARIO
        </button>
      )}

      {(editingUser || isCreating) && (
        <UserForm 
          user={editingUser || { name: '', email: '', password: '', isAdmin: false, isActive: true }} 
          onSave={handleSave} 
          onCancel={handleCancel} 
          isCreating={isCreating}
        />
      )}

      {!(editingUser || isCreating) && (
        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>IMAGEN</th>
                <th>NOMBRE</th>
                <th>EMAIL</th>
                <th>TIPO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td className="product-image">
                    {/* Si tienes imagen de usuario, reemplaza src por la propiedad correspondiente */}
                    <img
                      src={u.image ? `http://localhost:5000${u.image}` : defaultProductImage}
                      alt={u.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid rgba(255,69,0,0.5)' }}
                    />
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.isAdmin ? 'Admin' : 'Usuario'}</td>
                  <td>
                    <span className={`status ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="product-actions">
                    <button className="edit-btn" onClick={() => setEditingUser(u)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(u.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardUsuarios;
