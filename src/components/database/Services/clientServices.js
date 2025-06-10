import {query} from '../../../../database.js';

export const getClients = async() => {
    const{rows} = await query('SELECT * FROM products;');
    return rows;
}