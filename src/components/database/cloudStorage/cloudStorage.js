const AWS = require('aws-sdk');
const path = require('path');

AWS.config.update({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:process.env.AWS_REGION
})

const s3 = new AWS.S3;

exports.uploadToCloud = async (file) => {
    const fileExt = path.extname(file.originalname);
    const key = `upload/${Date.now()} - ${Math.round(Math.random() * 1E9)}${fileExt}`

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key, 
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        const data = await s3.upload(params).promise();
        return data.Location;
    } catch (error) {
        console.error('S3 upload error:', err);
        throw err;
    }
}