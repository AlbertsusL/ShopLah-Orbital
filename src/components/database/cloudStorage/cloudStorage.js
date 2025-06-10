import { S3, GetObjectCommand } from "@aws-sdk/client-s3";
import path from 'path';
import env from 'dotenv';

env.config();

const s3 = new S3({ 
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadToCloud = async (file) => {
    const fileExt = path.extname(file.originalname);
    const key = `upload/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
    }
};
export default uploadToCloud;