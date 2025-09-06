import React, { useState, useEffect } from 'react';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [name, setName] = useState(category ? category.name : '');

  useEffect(() => {
    setName(category ? category.name : '');
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...category, name });
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <div className="form-group">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la categoría"
          className="form-control"
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="save-btn">Guardar</button>
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

const DashboardCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const fetchCategorias = async () => {
    const data = await getCategorias();
    setCategorias(data);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSave = async (categoryData) => {
    try {
      if (editingCategory) {
        await updateCategoria(editingCategory.id, { name: categoryData.name }, user.id);
        toast.success('Categoría actualizada');
      } else {
        await createCategoria({ name: categoryData.name }, user.id);
        toast.success('Categoría creada');
      }
      fetchCategorias();
      setEditingCategory(null);
      setIsCreating(false);
    } catch {
      toast.error('Error al guardar la categoría');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await deleteCategoria(id, user.id);
        fetchCategorias();
        toast.success('Categoría eliminada');
      } catch {
        toast.error('Error al eliminar la categoría');
      }
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setIsCreating(false);
  };

  return (
    <div>
      <h3>Gestionar Categorías</h3>
      
      {(isCreating || editingCategory) ? (
        <CategoryForm category={editingCategory} onSave={handleSave} onCancel={handleCancel} />
      ) : (
        <button onClick={() => setIsCreating(true)}>Crear Nueva Categoría</button>
      )}

      {!(isCreating || editingCategory) && (
        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="product-actions">
                    <button className="edit-btn" onClick={() => setEditingCategory(c)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(c.id)}>Eliminar</button>
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

export default DashboardCategorias;
