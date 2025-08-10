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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la categoría"
        required
      />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
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
    } catch (error) {
      toast.error('Error al guardar la categoría');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await deleteCategoria(id, user.id);
        fetchCategorias();
        toast.success('Categoría eliminada');
      } catch (error) {
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

      <ul>
        {categorias.map(c => (
          <li key={c.id}>
            {c.name}
            <button onClick={() => setEditingCategory(c)}>Editar</button>
            <button onClick={() => handleDelete(c.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardCategorias;
