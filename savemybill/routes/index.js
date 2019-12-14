var express = require('express');
var multer = require('multer');
var path = require('path');
var router = express.Router();
var usermodule = require('../modules/users');
var categorydb = require('../modules/categorydb');
var billdb = require('../modules/billdb');
var bycrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
var getcategory = categorydb.find({});
var bills = billdb.find({});

router.use(express.static(__dirname+"./public/uploads"));

var Storage= multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
});

var upload = multer({
  storage:Storage
}).single('file');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function checkemail(req, res, next) {
  var email = req.body.email;
  var checkexisting = usermodule.findOne({
    Email: email
  });
  checkexisting.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return res.render('signup', {
        title: 'Save My Bill',
        msg: 'Email already registered'
      });
    }
    next();
  });
};

function checkusername(req, res, next) {
  var username = req.body.uname;
  var checkexistinguser = usermodule.findOne({
    Username: username
  });
  checkexistinguser.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return res.render('signup', {
        title: 'Save My Bill ',
        msg: 'Email already registered!!'
      });
    }
    next();
  });
};

function checkloginuser(req,res,next){
  var usertoken= localStorage.getItem('usertoken');
  try {
    var decoded = jwt.verify(usertoken, 'logintoken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}
router.get('/', function (req, res, next) {  
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard')
  }
  else{
  res.render('index', {
    title: 'Save My Bill', msg:''});
  }
});
router.post('/', function (req, res, next) {
  var username = req.body.uname;
  var password = req.body.password;
  var checkuser = usermodule.findOne({Username: username});
  checkuser.exec((err, data) => {
    if (err) throw err;
    var getuserID = data._id;
    var getpassword = data.Password;
    if(bycrypt.compareSync(password,getpassword)){
      var token = jwt.sign({ userID: getuserID }, 'logintoken');
      localStorage.setItem('usertoken', token);
      localStorage.setItem('loginUser', username);
      res.redirect('/dashboard');
       }
       else
       {
        res.render('index', {
          title: 'Save My Bill',
          msg: "invalid username or password"
        });
       }
  });
});

router.get('/dashboard', checkloginuser , function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  
  res.render('dashboard', {title: 'Save My Bill', loginUser:loginUser, msg: ''});
});

router.get('/signup', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard')
  }
  else{
  res.render('signup', {
    title: 'Save My Bill', msg:''});
  }
});

router.post('/signup', checkusername, checkemail, function (req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;
  console.log(email);
  if (password != confpassword) {
    res.render('signup', {
      title: 'Save My Bill',
      msg: 'Enter the same password'
    });
  }
   else{
     password=bycrypt.hashSync(req.body.password,15);
  var userdetails= new usermodule({
    Username:username,
    Email:email,
    Password:password
  });
  userdetails.save((err,doc)=>{
    if(err) throw err;
     res.render('signup', { title: 'Save My Bill', msg:'registerd successfully' });
   });
  }
});

router.get('/addnewcategory', checkloginuser, function (req, res, next) {
  res.render('addnewcategory', {
    title: 'Save My Bill', errors:'',success:''
  });
});
router.post('/addnewcategory', checkloginuser, [check('category','Enter a category name!').isLength({ min: 1 })] , function (req, res, next) {
const errors = validationResult(req);
if(!errors.isEmpty()){
  res.render('addnewcategory', {
    title: 'Save My Bill', errors:errors.mapped(),success:''
  });
}else{
  var category_name = req.body.category;
  var categorydetails = new categorydb({
    CategoryName: category_name
  });
  categorydetails.save((err,doc)=>{
    if(err) throw err;
    res.render('addnewcategory', {
      title: 'Save My Bill', errors:'',success:'Category added successfully!!'
    });
  })
}

});

router.get('/allcategories', checkloginuser , function (req, res, next) {
  getcategory.exec((err,data)=>{
    if(err) throw err;
  res.render('allcategories', {
    title: 'Save My Bill', record:data
   });
  });
});

router.get('/allcategories/delete/:id', checkloginuser , function (req, res, next) {
  var catid= req.params.id;
  var categorydelete = categorydb.findByIdAndDelete(catid);
  categorydelete.exec((err)=>{
    if(err) throw err;
  res.redirect('/allcategories');
  });
});

// router.get('/allcategories/edit/:id', checkloginuser , function (req, res, next) {
//   var catid= req.params.id;
//   var categoryupdate = categorydb.findById(catid);
//   categoryupdate.exec((err,data)=>{
//     if(err) throw err;
//   res.render('editcategory', {
//     title: 'Save My Bill', errors:'',success:'', record:data, id:catid
//    });
//   });
// });

// router.post('/allcategories/edit/', checkloginuser , function (req, res, next) {
//   var catid= req.body.id;
//   var category= req.body.category;
//   var categoryupdate = categorydb.findByIdAndUpdate(catid,{CategoryName:category})
//   categoryupdate.exec((err,doc)=>{
//     if(err) throw err;
//     res.redirect('/allcategories');
//   });
// });

router.get('/addnewbill', checkloginuser , function (req, res, next) {
  getcategory.exec(function(err,data){
  if (err) throw err;
  res.render('addbill', {
    title: 'Save My Bill', record:data, success:''
  });
  });
});

router.post('/addnewbill',checkloginuser , upload, function (req, res, next) {
  if (req.file){
    var category = req.body.Category;
  var detail = req.body.details;
  var Image = req.file.filename;
   var passDB = new billdb({
    CategoryName:category,
    BillDetails:detail,
    Image:Image
  });  passDB.save(function(err,doc){
    getcategory.exec(function(err,data){
    if (err) throw err;
    res.render('addbill', {
      title: 'Save My Bill', record:data, success:'Bill details added successfully!!'
    });
    });
  }); }
else{ 
  var category = req.body.Category;
  var detail = req.body.details;
  var passDB = new billdb({
    CategoryName:category,
    BillDetails:detail,

  });  passDB.save(function(err,doc){
    getcategory.exec(function(err,data){
    if (err) throw err;
    res.render('addbill', {
      title: 'Save My Bill', record:data, success:'Bill details added successfully!!'
    });
    });
  }); } 

});

router.get('/allbills', checkloginuser,upload , function (req, res, next) {
  bills.exec(function(err,data){
    if (err) throw err;
    res.render('allbills', {
      title: 'Save My Bill', record:data
    });
  });
});

// router.get('/allbills/edit/:id', checkloginuser,upload , function (req, res, next) {
//   var id = req.params.id;
//   var detailss = billdb.findById({_id:id});
//   detailss.exec(function(err,data){
//     if (err) throw err;
//     getcategory.exec(function(err,data1){
//     res.render('editbill', {
//       title: 'Save My Bill', record:data1 , success:'', records:data
//     });
//    });
//   });
// });

// router.post('/allbills/edit/:id', checkloginuser,upload ,function(){
//   var id= req.params.id;
//   if(req.file){
//     var datarecord={
//       CategoryName: req.body.category,
//       BillDetails: req.body.details,
//       Image: req.file.filename
//     }
//   }
//   else{
//     var datarecord={
//       CategoryName: req.body.category,
//       BillDetails: req.body.details
//     }
//   }
//   billdb.findByIdAndUpdate(id,{datarecord}).exec(function(err){
//     if (err) throw err;
//     var idupdate = billdb.findById({_id:id});
//     idupdate.exec(function(err,data){
//       if (err) throw err;
//       getcategory.exec(function(err,data1){
//         res.render('editbill', {
//           title: 'Save My Bill', record:data1 , success:'Bill Updated successfully', records:data
//         });
//       });
//   });
// });

router.get('/allbills/delete/:id', checkloginuser,upload , function (req, res, next) {
  var passcatid= req.params.id;
  var categorydelete = billdb.findByIdAndDelete(passcatid);
  categorydelete.exec((err)=>{
    if(err) throw err;
  res.redirect('/allbills');
  });
});



router.get('/logout', function (req, res, next) {
  localStorage.removeItem('usertoken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
  });
  
module.exports = router;
