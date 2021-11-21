var express = require('express');
const {Category}  = require('../models/category');
var router = express.Router();
const {Product} = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = require('upload')

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type...!!');

    if(isValid){
      uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })




// const product = new Product();
/* GET users listing. */
// router.get('/', async (req, res)=> {

//   const productList = await Product.find().populate('category');

//   if(!productList){
//     res.status(500).json({success: false})
//   }
//   res.send(productList);
//   // res.send('respond with a Product');
//   console.log("Product Page Running.......")
// });


/* Filtering and Getting products by Category */
router.get('/', async (req, res)=> {

  let filter = {}
  if(req.query.categories){
    filter = {category : req.query.categories.split(',')}
  }
  const productList = await Product.find(filter).populate('category');

  if(!productList){
    res.status(500).json({success: false})
  }
  res.send(productList);
  // res.send('respond with a Product');
  console.log("Product Page Running.......")
});



//product with categories
router.get('/:id', async (req, res)=> {

  const product = await Product.findById(req.params.id).populate('category');

  if(!product){
    res.status(500).json({success: false})
  }
  res.send(product);
  // res.send('respond with a Product');
  console.log("Product Page Running.......")
});


/* Post users listing. */
router.post(`/`, uploadOptions.single('image'), async (req, res) =>{
  const category = await Category.findById(req.body.category);
  if(!category) return res.status(400).send('Invalid Category')

  const file = req.file;
  if(!file) return res.status(400).send('No image in the request')


  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get('host')}//`
  const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
  })

  product = await product.save();

  if(!product) 
  return res.status(500).send('The product cannot be created')

  res.send(product);
})

//update Products
router.put(`/:id`,async (req,res)=>{

  if(!mongoose.isValidObjectId(req.params.id)){
    res.status(400).send('Invalid Product Id')
  }

  const category = await Category.findById(req.body.category);
  if(!category) return res.status(400).send('Invalid Category')

  const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      {
          new: true
      }
  )
  if(!product){
      res.status(500).send('The Product cannot be Updated!')
  }
  res.send(product);
})

//Delete Products
router.delete('/:id',(req,res)=>{
  Product.findByIdAndRemove(req.params.id).then(product=>{
      if(product){
          return res.status(200).json({success:true, message:' The Product is Delete!'})
      }else{
          return res.status(404).json({success:false, message:' The Product is not found!'})
      }
  }).catch(err=>{
      return res.status(400).json({success: false, error: err})
  })
})

//Count Product List
router.get('/get/count', async (req, res)=> {

  const productCount = await Product.countDocuments()

  if(!productCount){
    res.status(500).json({success: false, message:'Counting Process Not Completed.....'})
  }
  res.send({
    productCount: productCount
  })
  // res.send('respond with a Product');
  console.log("Product Page Running.......")
});


//featured Product List
router.get('/get/featured', async (req, res)=> {

  const products = await Product.find({isFeatured: true})

  if(!products){
    res.status(500).json({success: false, message:'Featured product error.....'})
  }
  res.send(products);
  // res.send('respond with a Product');
  console.log("Product Page Running.......")
});

//featured count Product List
router.get('/get/featured/:count', async (req, res)=> {
  const count = req.params.count ? req.params.count : 0
  const products = await Product.find({isFeatured: true}).limit(+count)

  if(!products){
    res.status(500).json({success: false, message:'Featured product error.....'})
  }
  res.send(products);
  // res.send('respond with a Product');
  console.log("Product Page Running.......")
});

module.exports = router;
