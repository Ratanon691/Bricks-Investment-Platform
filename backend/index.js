require('dotenv').config();
const db = require('./models/index')
const express = require('express')
const app = express()
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const userRoutes = require('./routes/user')
const propertyRoutes = require('./routes/property')
const propertyImageRoutes = require('./routes/propertyImage')
const transactionRoutes = require('./routes/transaction')
const portfolioRoutes = require('./routes/portfolio')
const sharesRoutes = require('./routes/shares') 

app.use(cors({
  origin: 'http://localhost:3000' 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
})

app.use('/users', userRoutes)
app.use('/properties', propertyRoutes)
app.use('/transactions', transactionRoutes)
app.use('/propertyImage', propertyImageRoutes)
app.use('/portfolio', portfolioRoutes)
app.use('/shares', sharesRoutes) 
app.use('/uploads', express.static('uploads'))

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An error occurred',
    error: err.message
  });
});

db.sequelize.sync({force: false}).then(() => {
    app.listen(8000, () => {
        console.log('Server is running at port 8000')
    })
})

module.exports = app