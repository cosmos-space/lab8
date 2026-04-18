
// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });
module.exports = upload;

// In the product route:
// const upload = require('../middleware/uploadMiddleware');
// router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct); 