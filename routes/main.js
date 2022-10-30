const router = require('express').Router();
const async = require('async');
const Gig = require('../models/gig');
const Order = require('../models/order')
const User = require('../models/user');
const Promocode = require('../models/promocode');
const multer = require('multer');
const passportConfig = require('../config/passport');
var multerS3 = require('multer-s3');
var  AWS = require('aws-sdk');
AWS.config.loadFromPath('./s3_config.json');
var s3 = new AWS.S3({params: {Bucket: 'useskillimages1'}});
var upload = multer({ storage: multer.memoryStorage({}) });
var categoryOptions = require('../constants/categories')
const fs = require('fs')
const algoliasearch = require('algoliasearch');
var client = algoliasearch("L3E3RMHJBU", "f5a7555c009dfcabf7e108808f1ff931");
var index = client.initIndex('GigSchema');
var _ = require('lodash');


router.get('/', (req, res, next) => {

    Gig.find({}, function(err, gigs) {
      var length = gigs.length;
      var gigsreviewed = _.filter(gigs,(gig) => {
        return (gig.rating > 2);
      });
      console.log('gigsreviewed',gigsreviewed);
      var gigLimited = _.slice(gigsreviewed,0,9);
      res.render('main/home', { gigs: gigLimited,numberOfSkills: length });
    })
});

router.get('/kanban/:id/tasks/:orderId',(req, res, next) => {

  Gig.find({ _id: req.params.id }, function(err, gig){
    console.log('gig',gig);
  res.render('agile/kanban', {gig:gig[0], orderId: req.params.orderId});
})
});

router.post('/kanban-init',(req, res, next) => {

  Order.findOne({ _id: req.body.orderId }, function(err, order){
  //  console.log('gig',gig);
  res.json({ order: order});
})
});
router.route('/rating/:id')
.get((req,res,next) => {
  res.render('rating/rate-seller');
})
.post((req,res,next) => {
  console.log('req.body&&*',req.body,'id',req.params.id);
  var inp = [
        req.body.star,
        req.body.time,
        req.body.communication
      ];
      var fuzzyis = require('fuzzyis');
      var system = new fuzzyis.FIS('rating system');
      var LV = fuzzyis.LinguisticVariable;
       var Term = fuzzyis.Term;
        var Rule = fuzzyis.Rule;
      var outputs = [
    new LV('rating for skill', [1, 5])
    ];
    var inputs = [
    new LV('star', [1, 5]),
    new LV('time', [1, 5]),
    new LV('communication', [1, 5]),
];
// take some shortcuts
var rating = outputs[0];
var star = inputs[0];
var time = inputs[1];
var communication = inputs[2];

star.addTerm(new Term('normal', 'gauss', [0, 1]));
star.addTerm(new Term('high', 'gauss', [2, 3]));
star.addTerm(new Term('very high', 'gauss', [4, 5]));

time.addTerm(new Term('normal', 'gauss', [0,1]));
time.addTerm(new Term('high', 'gauss', [2, 3]));
time.addTerm(new Term('very high', 'gauss', [4, 5]));
communication.addTerm(new Term('normal', 'gauss', [0,1]));
communication.addTerm(new Term('high', 'gauss', [2, 3]));
communication.addTerm(new Term('very high', 'gauss', [4, 5]));
rating.addTerm(new Term('low', 'triangle', [0, 1, 2]));
rating.addTerm(new Term('medium', 'triangle', [2, 2.5, 3]));
rating.addTerm(new Term('high', 'triangle', [4, 4.5, 5]));

system.inputs = inputs;
system.outputs = outputs;
system.rules = [
    new Rule(
        ['normal', 'normal','normal'],
        ['low'],
        'and'
    ),
    new Rule(
        ['normal', 'normal','high'],
        ['low'],
        'and'
    ),
    new Rule(
        ['normal', 'high','normal'],
        ['low'],
        'and'
    ),
    new Rule(
        ['normal', 'normal','very high'],
        ['medium'],
        'and'
    ),
    new Rule(
        ['normal', 'very high','very high'],
        ['high'],
        'and'
    ),
    new Rule(
        ['very high', 'normal','very high'],
        ['high'],
        'and'
    ),
    new Rule(
        ['very high', 'very high','normal'],
        ['high'],
        'and'
    ),
    new Rule(
        ['high', 'high','normal'],
        ['medium'],
        'and'
    ),
    new Rule(
        ['high', 'normal','high'],
        ['medium'],
        'and'
    ),
    new Rule(
        ['high', 'high','high'],
        ['medium'],
        'and'
    ),
    new Rule(
        ['normal', 'high','normal'],
        ['medium'],
        'and'
    ),
    new Rule(
        ['very high', 'very high','normal'],
        ['high'],
        'and'
    ),
    new Rule(
        ['very high', 'very high','very high'],
        ['high'],
        'and'
    )
];
console.log('inp',inp);
var output = _.round(system.getPreciseOutput([inp[0],inp[1],inp[2]]),1);
console.log('output',output);
Gig.findOne({_id: req.params.id}, function(err, gig){
  gig.rating = output;

gig.save(function(err){
  res.redirect('/my-gigs')
});
});

})
router.post('/kanban',(req, res, next) => {
  console.log('kanban***',req.body,'***',JSON.parse(req.body.todoList));
  Order.findOne({ _id: req.body.orderId }, function(err, order){
    order.todoList = JSON.parse(req.body.todoList);
    _.each(order.todoList,(todo) => {
      todo.isLoadedFromDb = true;
    });
  //  console.log('gig****',gig);
    order.save(function(err) {
      console.log('err',err);
      res.json({success:'success'});
    });
  });
});

router.route('/search')
  .get((req, res, next) => {
    if (req.query.q) {
      index.search(req.query.q, function(err, content) {
        // var hits = _.map(content.hits, (hit) => {
        //   console.log('hi______________________________--',hit);
        // Gig.find({ owner: hit.owner._id }, function(err, gigs) {
        //   console.log('gigs(())',gigs);
        //    _.forEach(gigs,(gig) => {
        //     hit['image'] = new Buffer(gig.picture.data).toString('base64');
        //     console.log('hit*888*',hit.image);
        //   });
        // });
        //   return hit;
        // });
        res.render('main/search_results', { content: content, search_result: req.query.q });
      });
    }
  })
  .post((req, res, next) => {
    res.redirect('/search/?q=' + req.body.search_input);
  });

router.get('/my-gigs', (req, res, next) => {

  Gig.find({ owner: req.user._id }, function(err, gigs) {
    //var gigOptions = _.cloneDeep(gigs);
    // var modifiedGigs = _.map(gigOptions,(gig) => {
    //   gig['image'] = new Buffer(gig.picture.data).toString('base64');
    //   return gig;
    // });
    res.render('main/my-gigs', { gigs: gigs });
  })
});

router.route('/generate-cert')
.get(passportConfig.isAuthenticated, (req, res, next) => {
  async.waterfall([
    function(callback) {
      Gig.find({ owner: req.user._id }, function(err, gigs) {
          callback(err,gigs);
      })
},
function(gigs,callback) {
  Order.find({ seller: req.user._id })
  .populate('buyer')
  .populate('seller')
  .populate('gig')
  .exec(function(err, orders) {
    var price =0;
    var count =0 ;
    var overall_rating = 0;
    if(!_.isEmpty(gigs) &&  !_.isEmpty(orders)) {
    gigs[0].orders = orders;
    _.each(gigs,(gig) => {
      price += gig.price;
      overall_rating += gig.rating;
      count++;
    });
  }
    console.log('overall**',overall_rating);
    if(overall_rating) overall_rating = overall_rating/count;
    res.render('certificate/cert.hbs', { orders: orders ,gigs:gigs,price: price,overall_rating: overall_rating });
  });
}
]);


  // .get(passportConfig.isAuthenticated, (req, res, next) => {
  //   res.render('accounts/profile', { message: req.flash('success') });
  // })
});

router.route('/edit-gig/:id')
.get((req, res, next) => {
    Gig.find({ _id: req.params.id }, function(err, gig){
    res.render('main/edit-gig', {categories : categoryOptions.categories, gig:gig[0]});
  })
})
.post(upload.single('myimages'),(req, res, next) => {
  //console.log('req',req.file);
  if(!_.isEmpty(req.file.originalname)) {
    async.waterfall([
      function(callback) {
      s3.putObject({
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: 'public-read', // your permisions
    }, (err) => {
      if (err) return res.status(400).send(err);
      var url = 'https://s3.amazonaws.com/useskillimages1/'+req.file.originalname;
      callback(err,url);
});
},

      function(url,callback) {
        Gig.findOne({ _id: req.params.id }, function(err, gig){
          console.log('req',req.body);
          gig.owner = req.user._id;
          if(req.body.gig_title)gig.title = req.body.gig_title;
          if(req.body.gig_category)gig.category = req.body.gig_category;
          if(!_.isEmpty(req.body.gig_sub_category))gig.subcategory.data = req.body.gig_sub_category;
          if(!_.isEmpty(req.body.gig_level))gig.subcategory.level = req.body.gig_level;
          if(!_.isEmpty(url))  gig.picture = url;
        if( req.body.gig_about)  gig.about = req.body.gig_about;
        if( req.body.gig_price)  gig.price = req.body.gig_price;
      //  console.log('gig****',gig);
          gig.save(function(err) {
            console.log('err',err);
            res.redirect('/my-gigs');
          });
        });
      }
    ]);
  }
  else {
Gig.findOne({ _id: req.params.id }, function(err, gig){
  console.log('req',req.body);
  gig.owner = req.user._id;
  if(req.body.gig_title)gig.title = req.body.gig_title;
  if(req.body.gig_category)gig.category = req.body.gig_category;
  if(!_.isEmpty(req.body.gig_sub_category))gig.subcategory.data = req.body.gig_sub_category;
  if(!_.isEmpty(req.body.gig_level))gig.subcategory.level = req.body.gig_level;
if( req.body.gig_about)  gig.about = req.body.gig_about;
if( req.body.gig_price)  gig.price = req.body.gig_price;
  gig.save(function(err) {
    console.log('err',err);
    res.redirect('/my-gigs');
  });
});
}

});


router.route('/add-new-gig')
  .get((req, res, next) => {
    res.render('main/add-new-gig', {categories : categoryOptions.categories});
  })
  .post(upload.single('myimage'),(req, res, next) => {
  //  console.log('req##',req.file);
    async.waterfall([
      function(callback) {
      s3.putObject({
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: 'public-read', // your permisions
    }, (err) => {
      if (err) return res.status(400).send(err);
      var url = 'https://s3.amazonaws.com/useskillimages1/'+req.file.originalname;
      callback(err,url);
});
},

      function(url,callback) {
        var gig = new Gig();
        gig.owner = req.user._id;
        gig.title = req.body.gig_title;
        gig.category = req.body.gig_category;
        gig.subcategory.data = req.body.gig_sub_category;
        gig.subcategory.level = req.body.gig_level;
        gig.picture = url;
        gig.about = req.body.gig_about;
        gig.price = req.body.gig_price;
        gig.save(function(err) {
          console.log('err',err);
          callback(err, gig);
        });
      },

      function(gig, callback) {
        User.update(
          {
            _id: req.user._id
          },{
            $push: { gigs: gig._id }
          }, function(err, count) {
            res.redirect('/my-gigs');
          }
        )
      }
    ]);
  });

router.get('/service_detail/:id', (req, res, next) => {
  Gig.findOne({ _id: req.params.id })
    .populate('owner')
    .exec(function(err, gig) {
      res.render('main/service_detail', { gig: gig,user: req.user,helpers: {
        if_equals: function(a, b, opts) {
          if (a.equals(b)) {
            return opts.fn(this);
          } else {
            return opts.inverse(this);
          }
        }
      } });
    });
});

router.get('/remove-skills/:id', (req, res, next) => {
  Gig.remove({ _id: req.params.id })
    .exec(function(err, gig) {
      User.update(
        {
          _id: req.user._id
        },{
          $pull: {gigs:gig._id}
        }, function(err, count) {
          res.redirect('/my-gigs');
        }
      )

    });

});

router.get('/api/add-promocode', (req, res, next) => {
  var promocode = new Promocode();
  console.log('here',promocode);
  promocode.name = "testcoupon";
  promocode.discount = 0.4;
  promocode.save(function(err) {
    res.json("Successful");
  });
});

router.post('/promocode', (req, res, next) => {
  var promocode = req.body.promocode;
  var totalPrice = req.session.price;
  Promocode.findOne({ name: promocode }, function(err, foundCode) {
    if (foundCode) {
      var newPrice = foundCode.discount * totalPrice;
      newPrice = totalPrice - newPrice;
      req.session.price = newPrice;
      res.json(newPrice);
    } else {
      res.json(0);
    }
  });
});

module.exports = router;
