const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const { Sequelize, DataTypes } = require("sequelize");

// Conexión a PostgreSQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  logging: false,
});

// Verificar conexión
sequelize
  .authenticate()
  .then(() => console.log("Conexión exitosa a PostgreSQL"))
  .catch((err) => console.error("Error al conectar a PostgreSQL:", err));

const app = express();

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  next();
});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

const upload = multer({ storage: storage });
const uploadMultiple = multer({ storage: storage }).array('images', 10); // Máximo 10 imágenes

/* ===========================
   MODELOS
=========================== */

// Usuario
const Usuario = sequelize.define("Usuario", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// Categoria
const Categoria = sequelize.define("Categoria", {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
});

// Producto
const Producto = sequelize.define("Producto", {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  description: DataTypes.TEXT,
  image: DataTypes.STRING, // Mantenemos para compatibilidad (será la imagen principal)
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
});

// ProductoImagen - Para múltiples imágenes
const ProductoImagen = sequelize.define("ProductoImagen", {
  url: { type: DataTypes.STRING, allowNull: false },
  orden: { type: DataTypes.INTEGER, defaultValue: 0 }, // Para ordenar las imágenes
  esPrincipal: { type: DataTypes.BOOLEAN, defaultValue: false }, // Marca la imagen principal
});

// Carrito
const Carrito = sequelize.define("Carrito", {});

// CarritoProducto (Tabla intermedia para la relación muchos a muchos)
const CarritoProducto = sequelize.define("CarritoProducto", {
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
});

// Asociaciones
Producto.belongsTo(Categoria, { as: 'Categoria', foreignKey: 'CategoriaId' });
Categoria.hasMany(Producto, { foreignKey: 'CategoriaId' });

// Asociaciones para múltiples imágenes
Producto.hasMany(ProductoImagen, { as: 'imagenes' });
ProductoImagen.belongsTo(Producto);

Usuario.hasOne(Carrito);
Carrito.belongsTo(Usuario);

Carrito.belongsToMany(Producto, { through: CarritoProducto });
Producto.belongsToMany(Carrito, { through: CarritoProducto });

// Sincronizar modelos con la base de datos
sequelize
  .sync({ alter: true })
  .then(() => console.log("Modelos sincronizados"))
  .catch((err) => console.error("Error al sincronizar modelos:", err));

/* ===========================
   MIDDLEWARE
=========================== */

// Middleware para verificar si el usuario es administrador
// Nota: Esta es una implementación simple. En una app real, se usarían tokens (JWT).
const isAdmin = async (req, res, next) => {
  const userId = req.header("X-User-ID"); // Asumimos que el ID del usuario viene en un header
  console.log('isAdmin middleware called with userId:', userId);
  
  if (!userId) {
    console.log('No user ID provided');
    return res.status(401).json({ message: "Acceso denegado. Falta ID de usuario." });
  }
  try {
    const usuario = await Usuario.findByPk(userId);
    console.log('User found:', usuario ? { id: usuario.id, email: usuario.email, isAdmin: usuario.isAdmin } : 'null');
    
    if (usuario && usuario.isAdmin) {
      console.log('User is admin, proceeding...');
      next();
    } else {
      console.log('User is not admin or not found');
      res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
    }
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({ message: "Error al verificar permisos", error });
  }
};

/* ===========================
   RUTAS DE AUTENTICACIÓN
=========================== */

// POST /registro → Registrar nuevo usuario
app.post("/registro", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const totalUsuarios = await Usuario.count();

    const nuevoUsuario = await Usuario.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: totalUsuarios === 0, // El primer usuario es admin
    });

    // Crear un carrito para el nuevo usuario
    await Carrito.create({ UsuarioId: nuevoUsuario.id });

    res.status(201).json({
      id: nuevoUsuario.id,
      name: nuevoUsuario.name,
      email: nuevoUsuario.email,
      isAdmin: nuevoUsuario.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
});

// POST /login → Iniciar sesión
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    res.json({
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      isAdmin: usuario.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
});

/* ===========================
   RUTAS DE USUARIOS (Admin)
=========================== */

// GET /usuarios → Obtener todos los usuarios
app.get("/usuarios", isAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ attributes: { exclude: ["password"] } });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
});

// GET /usuarios/:id → Obtener un usuario por ID
app.get("/usuarios/:id", isAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario", error: error.message });
  }
});

// POST /usuarios → Crear un nuevo usuario (admin)
app.post("/usuarios", isAdmin, async (req, res) => {
  try {
    const { name, email, password, isAdmin: newIsAdmin, isActive } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
    }
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await Usuario.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: newIsAdmin || false,
      isActive: isActive !== undefined ? isActive : true,
    });

    await Carrito.create({ UsuarioId: nuevoUsuario.id });

    res.status(201).json({
      id: nuevoUsuario.id,
      name: nuevoUsuario.name,
      email: nuevoUsuario.email,
      isAdmin: nuevoUsuario.isAdmin,
      isActive: nuevoUsuario.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error: error.message });
  }
});

// PUT /usuarios/:id → Actualizar datos del usuario
app.put("/usuarios/:id", isAdmin, async (req, res) => {
    try {
        const { name, email, isAdmin: newIsAdmin, isActive } = req.body;
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        usuario.name = name ?? usuario.name;
        usuario.email = email ?? usuario.email;
        usuario.isAdmin = newIsAdmin ?? usuario.isAdmin;
        usuario.isActive = isActive ?? usuario.isActive;
        await usuario.save();
        res.json({
            id: usuario.id,
            name: usuario.name,
            email: usuario.email,
            isAdmin: usuario.isAdmin,
            isActive: usuario.isActive,
        });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
});

// DELETE /usuarios/:id → Eliminar usuario
app.delete("/usuarios/:id", isAdmin, async (req, res) => {
    try {
        const deleted = await Usuario.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
    }
});


/* ===========================
   RUTAS DE PRODUCTOS
=========================== */

// GET /productos → Listar todos los productos
app.get("/productos", async (req, res) => {
  try {
    const productos = await Producto.findAll({ 
      include: [
        { model: Categoria, as: 'Categoria' },
        { model: ProductoImagen, as: 'imagenes', order: [['orden', 'ASC']] }
      ]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error: error.message });
  }
});

// GET /productos/:id → Obtener producto por ID
app.get("/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, { 
      include: [
        { model: Categoria, as: 'Categoria' },
        { model: ProductoImagen, as: 'imagenes', order: [['orden', 'ASC']] }
      ]
    });
    if (producto) {
      res.json(producto);
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener producto", error: error.message });
  }
});

// POST /productos → Crear nuevo producto (admin)
app.post("/productos", [uploadMultiple, isAdmin], async (req, res) => {
  console.log('POST /productos called');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  console.log('User ID from header:', req.header("X-User-ID"));
  
  try {
    const { name, price, description, stock, CategoriaId } = req.body;
    
    // Crear el producto primero
    const nuevoProducto = await Producto.create({
        name,
        price,
        description,
        stock,
        CategoriaId
    });
    
    // Procesar las imágenes si existen
    if (req.files && req.files.length > 0) {
      const imagenesData = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        orden: index,
        esPrincipal: index === 0, // La primera imagen es la principal
        ProductoId: nuevoProducto.id
      }));
      
      await ProductoImagen.bulkCreate(imagenesData);
      
      // Actualizar el campo image del producto con la primera imagen (compatibilidad)
      await nuevoProducto.update({ image: imagenesData[0].url });
    }
    
    // Obtener el producto completo con sus imágenes
    const productoCompleto = await Producto.findByPk(nuevoProducto.id, {
      include: [
        { model: Categoria, as: 'Categoria' },
        { model: ProductoImagen, as: 'imagenes', order: [['orden', 'ASC']] }
      ]
    });
    
    console.log('Product created successfully:', productoCompleto.toJSON());
    res.status(201).json(productoCompleto);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: "Error al crear producto", error: error.message });
  }
});

// PUT /productos/:id → Editar producto (admin)
app.put("/productos/:id", [uploadMultiple, isAdmin], async (req, res) => {
  try {
    const { name, price, description, stock, CategoriaId } = req.body;
    const updateData = { name, price, description, stock, CategoriaId };

    // Actualizar datos básicos del producto
    const [updated] = await Producto.update(updateData, { where: { id: req.params.id } });
    
    if (!updated) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Si hay nuevas imágenes, reemplazar todas las existentes
    if (req.files && req.files.length > 0) {
      // Eliminar imágenes existentes
      await ProductoImagen.destroy({ where: { ProductoId: req.params.id } });
      
      // Crear nuevas imágenes
      const imagenesData = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        orden: index,
        esPrincipal: index === 0,
        ProductoId: req.params.id
      }));
      
      await ProductoImagen.bulkCreate(imagenesData);
      
      // Actualizar el campo image del producto con la primera imagen (compatibilidad)
      await Producto.update(
        { image: imagenesData[0].url }, 
        { where: { id: req.params.id } }
      );
    }

    // Obtener el producto actualizado con sus imágenes
    const updatedProducto = await Producto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'Categoria' },
        { model: ProductoImagen, as: 'imagenes', order: [['orden', 'ASC']] }
      ]
    });
    
    res.json(updatedProducto);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar producto", error: error.message });
  }
});

// DELETE /productos/:id → Eliminar producto (admin)
app.delete("/productos/:id", isAdmin, async (req, res) => {
  try {
    const deleted = await Producto.destroy({ where: { id: req.params.id } });
    if (deleted) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto", error: error.message });
  }
});

/* ===========================
   RUTAS DE CATEGORÍAS
=========================== */

// GET /categorias → Listar categorías
app.get("/categorias", async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener categorías", error: error.message });
    }
});

// GET /categorias/:id → Obtener productos por categoría
app.get("/categorias/:id", async (req, res) => {
    try {
        const productos = await Producto.findAll({ where: { CategoriaId: req.params.id } });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos por categoría", error: error.message });
    }
});

// POST /categorias → Crear categoría (admin)
app.post("/categorias", isAdmin, async (req, res) => {
    try {
        const nuevaCategoria = await Categoria.create(req.body);
        res.status(201).json(nuevaCategoria);
    } catch (error) {
        res.status(500).json({ message: "Error al crear categoría", error: error.message });
    }
});

// PUT /categorias/:id → Editar categoría (admin)
app.put("/categorias/:id", isAdmin, async (req, res) => {
    try {
        const [updated] = await Categoria.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedCategoria = await Categoria.findByPk(req.params.id);
            res.json(updatedCategoria);
        } else {
            res.status(404).json({ message: "Categoría no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar categoría", error: error.message });
    }
});

// DELETE /categorias/:id → Eliminar categoría (admin)
app.delete("/categorias/:id", isAdmin, async (req, res) => {
    try {
        const deleted = await Categoria.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Categoría no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar categoría", error: error.message });
    }
});

/* ===========================
   RUTAS DEL CARRITO
=========================== */

// GET /carrito/:usuarioId → Obtener carrito de un usuario
app.get("/carrito/:usuarioId", async (req, res) => {
    try {
        const carrito = await Carrito.findOne({
            where: { UsuarioId: req.params.usuarioId },
            include: [{ model: Producto, through: { attributes: ['quantity'] } }]
        });
        if (carrito) {
            res.json(carrito);
        } else {
            res.status(404).json({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el carrito", error: error.message });
    }
});

// POST /carrito/:usuarioId → Agregar producto al carrito
app.post("/carrito/:usuarioId", async (req, res) => {
    try {
        const { productoId, quantity } = req.body;
        const carrito = await Carrito.findOne({ where: { UsuarioId: req.params.usuarioId } });
        const producto = await Producto.findByPk(productoId);

        if (!carrito || !producto) {
            return res.status(404).json({ message: "Carrito o Producto no encontrado" });
        }

        const [carritoProducto, created] = await CarritoProducto.findOrCreate({
            where: { CarritoId: carrito.id, ProductoId: producto.id },
            defaults: { quantity: quantity || 1 }
        });

        if (!created) {
            carritoProducto.quantity += (quantity || 1);
            await carritoProducto.save();
        }

        res.status(201).json(carritoProducto);
    } catch (error) {
        res.status(500).json({ message: "Error al agregar producto al carrito", error: error.message });
    }
});

// PUT /carrito/:usuarioId → Actualizar cantidad de un producto
app.put("/carrito/:usuarioId", async (req, res) => {
    try {
        const { productoId, quantity } = req.body;
        const carrito = await Carrito.findOne({ where: { UsuarioId: req.params.usuarioId } });
        
        if (!carrito) return res.status(404).json({ message: "Carrito no encontrado" });

        const item = await CarritoProducto.findOne({ where: { CarritoId: carrito.id, ProductoId: productoId } });

        if (item) {
            item.quantity = quantity;
            await item.save();
            res.json(item);
        } else {
            res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el carrito", error: error.message });
    }
});

// DELETE /carrito/:usuarioId/:prodId → Eliminar un producto del carrito
app.delete("/carrito/:usuarioId/:prodId", async (req, res) => {
    try {
        const { usuarioId, prodId } = req.params;
        const carrito = await Carrito.findOne({ where: { UsuarioId: usuarioId } });

        if (!carrito) return res.status(404).json({ message: "Carrito no encontrado" });

        const deleted = await CarritoProducto.destroy({ where: { CarritoId: carrito.id, ProductoId: prodId } });
        
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar producto del carrito", error: error.message });
    }
});

// DELETE /carrito/:usuarioId → Vaciar carrito
app.delete("/carrito/:usuarioId", async (req, res) => {
    try {
        const carrito = await Carrito.findOne({ where: { UsuarioId: req.params.usuarioId } });
        if (!carrito) return res.status(404).json({ message: "Carrito no encontrado" });
        await CarritoProducto.destroy({ where: { CarritoId: carrito.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error al vaciar el carrito", error: error.message });
    }
});


// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
