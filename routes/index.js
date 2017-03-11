var express = require('express');
var router = express.Router();
var customerModel = require('../Models/customer-model.js');



//1. addCustomer (For Adding A new Customer)
router.post('/addCustomer', function (req, res) {
    var customerData = req.body;
    customerModel.create(customerData, function (err, result) {
        if (err) {console.log(err);return err;}
        res.send(result)
    })

});


//2. getCustomerById (For fetching a customer details by ID)
router.get('/getCustomerById/:id', function (req, res) {
    customerModel.find({"customer_id" : req.params.id}, function(err, customerData) {
        if (err) {console.log(err);return}
        res.send(customerData);
    });

});


//3. addReferral (For Adding A Referral Under A Customer)
router.post('/addReferral', function (req, res) {
    var customerData = req.body;
    customerModel.create(customerData, function (err, result) {
        if (err) {console.log(err);return err;}
        res.send(result)
    })

});

//4. fetchAllChildren (Fetch All Children Under A Customer)
//5. fetchAllCustomersWithReferralCount (Fetch all customers with the number of childrens referred by them in ascending or descending order)


//6. addAmbassador(For Adding A new ambassador)
router.post('/addAmbassador', function (req, res) {
    var customerData = req.body;
    customerData.isAmbassador = true;
    customerModel.create(customerData, function (err, result) {
        if (err) {console.log(err);return err;}
        res.send(result)
    })

});

//7. convertCustomerToAmbassador (A customer can be converted to an Ambassador. But will get additional 10% only on the customers added under him after the time he got converted.)
router.post('/convertCustomerToAmbassador/:id', function (req, res) {
    customerModel.findOneAndUpdate({"customer_id" : req.params.id}, { isAmbassador: true },{new:true}, function(err, result){
        if (err) {console.log(err);return err;}
        res.send(result)
    })

});

//8. fetchAllAmbassadorChildren (Fetch All Children of an Ambassador)
//9. fetchChildrenAtNthLEvel (Fetch all ambassador children at nth level)





//customer_id : 2
//email : 'pramod3225@gmail.com'
//referral_id :null
//payback:0
//isAmbassador : false
//joiningDate : null
//lastUpdated : null
////});

module.exports = router;