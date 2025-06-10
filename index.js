import express from 'express';
import cors from 'cors';
import clientRoutes from "./src/components/database/Routers/products.js";

const app = express(); 
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api', clientRoutes);

app.listen(port, () => {
    console.log("listening on port 3000")
})
