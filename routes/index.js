var express = require('express');
var router = express.Router();
var customerModel = require('../Models/customer-model.js');

function raiseError(message, code){
    var err = new Error(message);
    err.status = code;
    return next(err);
}

//1. addCustomer (For Adding A new Customer)
router.post('/addCustomer', function (req, res,next) {
    var customerData = req.body;
    customerModel.create(customerData, function (err, result) {
        if (err) {next(err); return; }
        res.send(result)
    })

});


//2. getCustomerById (For fetching a customer details by ID)
router.get('/getCustomerById/:id', function (req, res,next) {
    customerModel.find({"customer_id" : req.params.id}, function(err, customerData) {
        if (err) {next(err); return; }
        res.send(customerData);
    });

});


//3. addReferral (For Adding A Referral Under A Customer)
router.post('/addReferral', function (req, res,next) {
    var customerData = req.body;
    if (customerData && customerData.referral_id){
        customerModel.update({"customer_id" : customerData.referral_id},
            {$inc: { payback: 30} , $currentDate: { lastUpdated: true }}, function(err, result){
            if (err) {next(err); return; }
            if (result.ok && !result.nModified){
                raiseError('Referral Id is missing',404);
            }
            customerModel.create(customerData, function (err, cresult) {
                if (err) {next(err); return; }
                res.send(cresult)
            })

        })
    }
    else {
        raiseError('Referral Id is missing',404);
    }
});

//4. fetchAllChildren (Fetch All Children Under A Customer)
router.get('/fetchAllChildren/:id', function (req, res,next) {
    customerModel.find({"referral_id" : req.params.id}, function(err, customerData) {
        if (err) {next(err); return; }
        res.send(customerData);
    });

});

//5. fetchAllCustomersWithReferram0lCount (Fetch all customers with the number of childrens referred by them in ascending or descending order)
router.get('/fetchAllCustomersWithReferram0lCount', function (req, res,next) {
    customerModel.aggregate([
        { $match : { referral_id : {$ne:null} } },
        { $group : {_id : "$referral_id" ,count: { $sum: 1 }}}
    ]).exec()
        .then(function(groupData){
            return groupData.map(function(item){return item['_id']});
        })
        .then(function(custList){
            customerModel.find({"customer_id" : {$in: custList}}).exec()
                .then(function(custData){
                    res.send(custData);
                })
        })
        .catch(function(err){
            next(err);
        });
});



//6. addAmbassador(For Adding A new ambassador)
router.post('/addAmbassador', function (req, res,next) {
    var customerData = req.body;
    customerData.isAmbassador = true;
    customerModel.create(customerData, function (err, result) {
        if (err) {next(err); return; }
        res.send(result)
    })

});

//7. convertCustomerToAmbassador (A customer can be converted to an Ambassador. But will get additional 10% only on the customers added under him after the time he got converted.)
router.post('/convertCustomerToAmbassador/:id', function (req, res,next) {
    customerModel.findOneAndUpdate({"customer_id" : req.params.id}, { isAmbassador: true },{new:true}, function(err, result){
        if (err) {next(err); return; }
        res.send(result)
    })

});

//8. fetchAllAmbassadorChildren (Fetch All Children of an Ambassador)
//9. fetchChildrenAtNthLevel (Fetch all ambassador children at nth level)
router.get('/fetchChildrenAtNthLevel/:n', function (req, res,next) {
    var n =req.params.n;
    var refIds =[null];
    function getCustdataN(n,refIds){
        customerModel.find({"referral_id" : refIds}, function(err, customersData) {
            if (err) {next(err); return; }
            var custIdArray = customersData.map(function(item){return item.customer_id});
            if(--n>=0){
                return getCustdataN(n,custIdArray)
            }
            else {
                res.send(customersData);
            }
        });
    }
    getCustdataN(n , refIds);
});





//customer_id : 2
//email : 'pramod3225@gmail.com'
//referral_id :null
//payback:0
//isAmbassador : false
//joiningDate : null
//lastUpdated : null
////});

module.exports = router;