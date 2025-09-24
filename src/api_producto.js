const expess = require('express');
const jwt = require('jsonwebtoken');
const bobyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = expess();
app.use(bobyParser.json());


const SECRET_KEY = 'clave_api_prueba';
let productos = [
    { id: 1, nombre: 'pc', precio: 1200, cantidad: 5, marca: 'asus' },
    { id: 2, nombre: 'mouse', precio: 800, cantidad: 10, marca: 'hp' },
    { id: 3, nombre: 'teclado', precio: 1500, cantidad: 3, marca: 'apple' }    
];

//Autenticacion
app.post("auth", (req, res) => {
    const { username, password } = req.body;
    if (username === 'ulises' && password === 'ulises123'){
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '10m' });
        return res.json({ token });   
    }
    res.status(401).json({ message: 'Credenciales inválidas' });
})
//verificacion del token
function verifyToken(req, res, next){
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403);
    const token = authHeader.split("")[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403);
        req.user = user;
        next();
    });
}

//listar productos
app.get('/productos', (req, res) => {
    res.json(productos);
}); 

//crear productos
app.get('/productos', verifyToken, (req, res) => {
    const { nombre, precio, cantidad, marca } = req.body;
    const nuevosProducto = {id: productos.length + 1, nombre, precio, cantidad, marca};
    productos.push(nuevosProducto);
    res.status(201).json(nuevosProducto);
}); 

//listar productos por id
app.get('/productos', verifyToken, (req, res) => {
    const { id } = req.params;
    const producto = productos.find(p => p.id === parseInt(id));
    if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }
}); 

//actualizar producto
app.put('/productos/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre, precio, cantidad, marca } = req.body;
    const producto = productos.find((p) => p.id === parseInt(id));
    if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
        producto.nombre = nombre;
        producto.precio = precio;
        producto.cantidad = cantidad;
        producto.marca = marca;
        res.json(producto);
    }
});
//eliminar producto
app.delete('/productos/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre, precio, cantidad, marca } = req.body;
    const producto = productos.find((p) => p.id === parseInt(id));
    res.json({ message: 'Producto eliminado' });
});
// ================== SWAGGER CONFIG ==================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Productos con JWT",
      version: "1.0.0",
      description: "API de ejemplo con autenticación JWT para prácticas",
    },
    servers: [
      {
        url: "https://api-productos-jwt.onrender.com", // 🔹 tu dominio de Render
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./api_producto.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// ================== INICIO SERVIDOR ==================
const PORT = process.env.PORT || 3000;
// Página de inicio con criterios del parcial
app.get("/", (req, res) => {
  res.send(`
    <h1>API de Productos con Auth (JWT)</h1>
    <p> Documentación interactiva (Swagger UI): <a href="https://api-productos-jwt.onrender.com/api-docs">https://api-productos-jwt.onrender.com/api-docs</a></p>
    <hr>
    <p>👉 Endpoints disponibles:</p>
    <ul>
      <li><code>POST /auth</code> → obtener token</li>
      <li><code>GET /products</code> → listar productos</li>
      <li><code>GET /products/:id</code> → detalle producto</li>
      <li><code>POST /products</code> → crear producto (requiere token)</li>
      <li><code>PUT /products/:id</code> → actualizar producto (requiere token)</li>
      <li><code>DELETE /products/:id</code> → eliminar producto (requiere token)</li>
    </ul>
    <hr>
    <p>ℹ️ Usa Postman para interactuar con la API. </p>
  `);
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));