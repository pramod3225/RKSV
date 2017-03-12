var express = require('express');
var router = express.Router();
var customerModel = require('../Models/customer-model.js');



//1. addCustomer (For Adding A new Customer)
router.post('/addCustomer', function (req, res,next) {
    var customerData = req.body;
    customerModel.create(customerData, function (err, result) {
        if (err) {return next(err);  }
        res.send(result)
    })

});


//2. getCustomerById (For fetching a customer details by ID)
router.get('/getCustomerById/:id', function (req, res,next) {
    customerModel.find({"customer_id" : req.params.id}, function(err, customerData) {
        if (err) {return next(err);  }
        res.send(customerData);
    });

});


//3. addReferral (For Adding A Referral Under A Customer)


router.post('/addReferral', function (req, res,next) {
    var customerData = req.body;
    if (customerData && customerData.referral_id){
        customerModel.findOneAndUpdate({"customer_id" : customerData.referral_id},
            {$inc: { payback: 30} , $currentDate: { lastUpdated: true }},{new:true}, function(err, parCustomer){
            if (err) {return next(err);  }
            if (!parCustomer){
                var err1 = new Error('Did not find Referral Id ');
                err1.status = 404;
                return next(err1);
            }
            if (parCustomer && parCustomer.referral_id) {
                customerModel.update({"customer_id": parCustomer.referral_id, isAmbassador: true},
                    {$inc: {payback: 10}, $currentDate: {lastUpdated: true}}, function (err) {
                        if (err) {return next(err);  }
                    })
            }
            customerModel.create(customerData, function (err, cresult) {
                if (err) {return next(err);  }
                res.send(cresult)
            })
        })

    }
    else {
        var err = new Error('Referral Id is missing');
        err.status = 404;
        return next(err);
    }
});

//4. fetchAllChildren (Fetch All Children Under A Customer)
router.get('/fetchAllChildren/:id', function (req, res,next) {
    customerModel.find({"referral_id" : req.params.id}, function(err, customerData) {
        if (err) {return next(err);  }
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
        if (err) {return next(err);  }
        res.send(result)
    })

});

//7. convertCustomerToAmbassador (A customer can be converted to an Ambassador. But will get additional 10% only on the customers added under him after the time he got converted.)
router.post('/convertCustomerToAmbassador/:id', function (req, res,next) {
    customerModel.findOneAndUpdate({"customer_id" : req.params.id}, { isAmbassador: true },{new:true}, function(err, result){
        if (err) {return next(err);  }
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
            if (err) {return next(err);  }
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


module.exports = router;