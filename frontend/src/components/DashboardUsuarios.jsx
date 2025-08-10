import React, { useState, useEffect } from 'react';
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

  const fetchUsuarios = async () => {
    if (currentUser && currentUser.isAdmin) {
      try {
        const data = await getUsuarios(currentUser.id);
        setUsuarios(data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [currentUser]);

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
    } catch (error) {
      toast.error(`Error al ${editingUser ? 'actualizar' : 'crear'} el usuario`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUsuario(id, currentUser.id);
        fetchUsuarios();
        toast.success('Usuario eliminado');
      } catch (error) {
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
      
      {!isCreating && <button onClick={() => setIsCreating(true)}>Agregar Usuario</button>}

      {(editingUser || isCreating) && (
        <UserForm 
          user={editingUser || { name: '', email: '', password: '', isAdmin: false, isActive: true }} 
          onSave={handleSave} 
          onCancel={handleCancel} 
          isCreating={isCreating}
        />
      )}

      <table className="usuarios-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.isAdmin ? 'Admin' : 'Usuario'}</td>
              <td>
                <span className={`status ${u.isActive ? 'active' : 'inactive'}`}>
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <button onClick={() => setEditingUser(u)}>Editar</button>
                <button onClick={() => handleDelete(u.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardUsuarios;
