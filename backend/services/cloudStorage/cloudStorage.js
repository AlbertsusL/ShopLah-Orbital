import { S3, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3({ 
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadToCloud = async (file) => {
    try {
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.S3_BUCKET_NAME || !process.env.AWS_REGION) {
            throw new Error('Missing AWS credentials');
        }

        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const key = `products/${fileName}`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        console.log(`📤 Uploading to S3: ${key}`);
        const command = new PutObjectCommand(params);
        await s3.send(command);
        
        const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        console.log(`Image uploaded successfully: ${imageUrl}`);
        
        return imageUrl;
    } catch (error) {
        console.error('Image upload error:', error);
        
        // Some error messages
        if (error.name === 'CredentialsError') {
            throw new Error('Credentials are invalid');
        } else if (error.name === 'NoSuchBucket') {
            throw new Error(`Bucket does not exist`);
        } else if (error.name === 'AccessDenied') {
            throw new Error('Access denied');
        } else if (error.name === 'AccessControlListNotSupported') {
            throw new Error('S3 bucket does not support ACLs');
        }
        
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

export const deleteFromCloud = async (imageUrl) => {
    try {
        const urlParts = imageUrl.split('/');
        const key = urlParts.slice(-2).join('/');
        
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        };

        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        
        console.log(`Image deleted successfully: ${imageUrl}`);
        return true;
    } catch (error) {
        console.error('Delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

export default uploadToCloud;