import * as clientService from "../Services/clientServices.js";

export const getProduct = async (req, res) => {
    try {
        const clients = await clientService.getClients();
        res.status(200).json(clients);
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

export const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await clientService.createClient(productData);
        res.status(200).json(clients);
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}