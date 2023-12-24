const cloudinary = require('cloudinary');

cloudinary.v2.config({
    cloud_name: 'diclpyd0r',
    api_key: '495311959154177',
    api_secret: 'bP16NhhJEoFsIrvOELvglvZLTtE',
    secure: true,
});

module.exports = cloudinary;