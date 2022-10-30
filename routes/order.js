const router = require('express').Router();
const async = require('async');
const stripe = require('stripe')('sk_test_r51HwKjb8vIz54ianB1f1EMJ')
const Gig = require('../models/gig');
const Order = require('../models/order');
const User = require('../models/user');
var _ = require('lodash');

const fee = 10.15;

router.get('/checkout/single_package/:id', (req, res, next) => {
  if(req.user) {
  Gig.findOne({ _id: req.params.id }, function(err, gig) {
    var totalPrice = gig.price + fee;
    req.session.gig = gig;
    req.session.price = totalPrice;
    res.render('checkout/single_package', { gig: gig, totalPrice: totalPrice });
  });
}
else {
  res.redirect('/signup');
}
});

router.get('/checkout/process_cart', (req, res, next) => {
  if(req.user) {
  User.findOne({ _id: req.user._id })
    .populate('cart')
    .exec(function(err, user) {
      var price = 0;
      var cartIsEmpty = true;
      if (user.cart.length > 0) {
        user.cart.map(function(item) {
          price += item.price;
        });
        var totalPrice = price + fee;
        totalPrice = (totalPrice).toFixed(2);
      } else {
        cartIsEmpty = false;
      }

      req.session.price = totalPrice;
       req.session.gig = user.cart;
      res.render('order/cart', { foundUser: user, totalPrice: totalPrice, sub_total: price,
        cartIsEmpty: cartIsEmpty});
    });
  }
  else  {
    res.redirect('/signup');
  }
});

  router.route('/payment')
    .get((req, res, next) => {
      res.render('checkout/payment');
    })
    .post((req, res, next) => {
      var gig = req.session.gig;
      var price = req.session.price;
      price *= 100;
      stripe.customers.create({
        email: req.user.email
      }).then(function(customer){
        return stripe.customers.createSource(customer.id, {
          source: req.body.stripeToken
        });
      }).then(function(source) {
        return stripe.charges.create({
          amount: price,
          currency: 'inr',
          customer: source.customer
        });
      }).then(function(charge) {
        // DO SOMETHING
        var order = new Order();
        order.buyer = req.user._id;
        order.seller = gig.owner;
        order.gig = gig._id;
        order.save(function(err) {
          req.session.gig = null;
          req.session.price = null;
          res.redirect('/users/' + req.user._id + '/orders/' + order._id);
        });
      }).catch(function(err) {
        // Deal with an error
      });
    });


    router.route('/payment/cart')
      .get((req, res, next) => {
        res.render('checkout/payment');
      })
      .post((req, res, next) => {
        var gigs = req.session.gig;
        var price = req.session.price;
        price *= 100;
        stripe.customers.create({
          email: req.user.email
        }).then(function(customer){
          return stripe.customers.createSource(customer.id, {
            source: req.body.stripeToken
          });
        }).then(function(source) {
          return stripe.charges.create({
            amount: price,
            currency: 'inr',
            customer: source.customer
          });
        }).then(function(charge) {
          // DO SOMETHING
          gigs.map(function(gig) {
            var order = new Order();
            order.buyer = req.user._id;
            order.seller = gig.owner;
            order.gig = gig._id;
            order.save(function(err) {
              req.session.gig = null;
              req.session.price = null;
            });
          });
          User.update({ _id: req.user._id }, { $set: { cart: []}}, function(err, updated) {
            if (updated) {
              res.redirect('/users/' + req.user._id + '/orders');
            }
          });
        }).catch(function(err) {
          // Deal with an error
        });
      });



//CHAT PAGE
router.get('/users/:userId/orders/:orderId', (req, res, next) => {
  req.session.orderId = req.params.orderId;
  Order.findOne({ _id: req.params.orderId })
    .populate('buyer')
    .populate('seller')
    .populate('gig')
    .deepPopulate('messages.owner')
    .exec(function(err, order) {
      console.log(order);
      //  order.gig['image'] = new Buffer(order.gig.picture.data).toString('base64');
      res.render('order/order-room', { layout: 'chat_layout', order: order, helpers: {
        if_equals: function(a, b, opts) {
          if (a.equals(b)) {
            return opts.fn(this);
          } else {
            return opts.inverse(this);
          }
        }
      }});
    });
});

router.get('/users/:id/manage_orders', (req, res, next) => {
  Order.find({ seller: req.user._id })
  .populate('buyer')
  .populate('seller')
  .populate('gig')
  .exec(function(err, orders) {

    res.render('order/order-seller', { orders: orders });
  });
});

router.get('/users/:id/orders', (req, res, next) => {
  Order.find({ buyer: req.user._id })
  .populate('buyer')
  .populate('seller')
  .populate('gig')
  .exec(function(err, orders) {
    res.render('order/order-buyer', { orders: orders });
  });
});


router.post('/add-to-cart', (req, res, next) => {
  const gigId = req.body.gig_id;
  if(req.user) {
  User.update(
    {
      _id: req.user._id
    },
    {
      $push: { cart: gigId }
    }, function(err, count) {
      res.json("Added to cart");
    }
  );
}
else {
  res.json("Please signup or login to continue");
}
});


router.post('/remove-item', (req, res, next) => {
  const gigId = req.body.gig_id;
  async.waterfall([
    function(callback) {
      Gig.findOne({ _id: gigId }, function(err, gig) {
        callback(err, gig);
      })

    },

    function(gig, callback) {
      User.update(
        {
          _id: req.user._id
        },
        {
          $pull: { cart: gigId }
        }, function(err, count) {
          //console.log('here',req.session.price,gig.price);
          req.session.price = req.session.price - gig.price;
          var totalPrice = req.session.price;
          //console.log('totalPrice',totalPrice);
          res.json({ totalPrice: totalPrice, price: gig.price });
        }
      );
    }
  ]);
});


module.exports = router;
