// services/productService.js
import { query } from '../../database.js'; // Adjust path as needed

export const productService = {
  // Get all products
  async getAllProducts(filters = {}) {
    try {
      const { category, search, limit = 50, offset = 0 } = filters;
      
      let queryText = `
        SELECT p.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', pi.id,
                     'image_url', pi.image_url,
                     'is_primary', pi.is_primary
                   ) ORDER BY pi.is_primary DESC, pi.id
                 ) FILTER (WHERE pi.id IS NOT NULL), 
                 '[]'
               ) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;

      if (category) {
        paramCount++;
        queryText += ` AND p.category = $${paramCount}`;
        params.push(category);
      }

      if (search) {
        paramCount++;
        queryText += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      queryText += `
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      
      params.push(parseInt(limit), parseInt(offset));

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product
  async getProductById(productId) {
    try {
      const queryText = `
        SELECT p.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', pi.id,
                     'image_url', pi.image_url,
                     'is_primary', pi.is_primary
                   ) ORDER BY pi.is_primary DESC, pi.id
                 ) FILTER (WHERE pi.id IS NOT NULL), 
                 '[]'
               ) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `;

      const result = await query(queryText, [productId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Add new product
  async addProduct(productData) {
    try {
      const { userId, name, description, price, category, stock, images = [] } = productData;
      
      // Start transaction
      await query('BEGIN');

      // Insert product
      const productQuery = `
        INSERT INTO products (userId, name, description, price, category, stock, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        RETURNING *
      `;
      
      const productResult = await query(productQuery, [
        userId, 
        name, 
        description, 
        parseFloat(price), 
        category, 
        parseInt(stock)
      ]);

      const product = productResult.rows[0];

      // Insert images if provided
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await query(
            `INSERT INTO product_images (product_id, image_url, is_primary, created_at) 
             VALUES ($1, $2, $3, NOW())`,
            [product.id, images[i], i === 0] // First image is primary
          );
        }
      }

      // Commit transaction
      await query('COMMIT');

      return product;
    } catch (error) {
      // Rollback on error
      await query('ROLLBACK');
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(productId, updates) {
    try {
      const { name, description, price, category, stock } = updates;
      
      const queryText = `
        UPDATE products 
        SET name = $1, description = $2, price = $3, category = $4, stock = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `;
      
      const result = await query(queryText, [
        name, 
        description, 
        parseFloat(price), 
        category, 
        parseInt(stock), 
        productId
      ]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId, userId) {
    try {
      await query('BEGIN');

      // Delete images first (due to foreign key constraint)
      await query('DELETE FROM product_images WHERE product_id = $1', [productId]);
      
      // Delete product (only if it belongs to the user)
      const result = await query(
        'DELETE FROM products WHERE id = $1 AND userId = $2 RETURNING *', 
        [productId, userId]
      );

      await query('COMMIT');

      return result.rows[0] || null;
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get products by user
  async getProductsByUser(userId) {
    try {
      const queryText = `
        SELECT p.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', pi.id,
                     'image_url', pi.image_url,
                     'is_primary', pi.is_primary
                   ) ORDER BY pi.is_primary DESC, pi.id
                 ) FILTER (WHERE pi.id IS NOT NULL), 
                 '[]'
               ) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.userId = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;

      const result = await query(queryText, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user products:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(searchTerm, filters = {}) {
    try {
      const { category, minPrice, maxPrice, limit = 20, offset = 0 } = filters;
      
      let queryText = `
        SELECT p.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', pi.id,
                     'image_url', pi.image_url,
                     'is_primary', pi.is_primary
                   ) ORDER BY pi.is_primary DESC, pi.id
                 ) FILTER (WHERE pi.id IS NOT NULL), 
                 '[]'
               ) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE (p.name ILIKE $1 OR p.description ILIKE $1)
      `;
      
      const params = [`%${searchTerm}%`];
      let paramCount = 1;

      if (category) {
        paramCount++;
        queryText += ` AND p.category = $${paramCount}`;
        params.push(category);
      }

      if (minPrice) {
        paramCount++;
        queryText += ` AND p.price >= $${paramCount}`;
        params.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        paramCount++;
        queryText += ` AND p.price <= $${paramCount}`;
        params.push(parseFloat(maxPrice));
      }

      queryText += `
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      
      params.push(parseInt(limit), parseInt(offset));

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};

export default productService;