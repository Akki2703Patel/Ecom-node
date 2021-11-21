const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

//GET Order
router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name')
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}
        });

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
    console.log("Orders Page Running.......")
})

//GET One Order
router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id).populate('user', 'name').populate({path: 'orderItems', populate: 'product'});

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
    console.log("Orders Page Running.......")
})

//POST Order
router.post('/', async (req,res)=>{

    const orderItemsIds =Promise.all( req.body.orderItems.map( async orderItem=> {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save()

        return newOrderItem._id;
    }))
    const orderItemIdsResolved = await orderItemsIds;
    // console.log(orderItemIdsResolved)

    const totalPrices =await Promise.all(orderItemIdsResolved.map(async (orderItemId)=>{
        const orderItem= await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity; 
        return totalPrice; 
    }))
    const totalPrice = totalPrices.reduce((a,b)=>a +b,0)
    console.log(totalPrice); 

    let order = new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        Zip: req.body.Zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
        // dateO rdered: req.body.dateOrdered,

    })
    order = await order.save();

    if(!order)
    return res.status(400).send('the Order cannot be created!')

    res.send(order);
})

//Update Orders
router.put('/:id',async (req, res)=> {
    const order  = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be created!')

    res.send(order);
})

//DELETE Orders
router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem =>{
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the Order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err})    
    })
})

router.get('/get/totalsales', async (req, res)=>{
    const totalSales = await Order.aggregate([
        { $group: {_id: null, totalsales: {$sum: '$totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(400).send('The Order Sales can not be generated')
    }
    
    res.send({totalsales: totalSales})
})

//Count Product List
router.get('/get/count', async (req, res)=> {

    const orderCount = await Order.countDocuments()
  
    if(!orderCount){
      res.status(500).json({success: false, message:'Counting Process Not Completed.....'})
    }
    res.send({
        orderCount: orderCount
    })
    // res.send('respond with a Product');
    console.log("Order Count Page Running.......")
  });

  //GET Order History
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find().populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}
        });

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
    console.log("Orders History Page Running.......")
})

module.exports =router;