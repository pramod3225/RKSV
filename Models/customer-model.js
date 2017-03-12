var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , db = require('./db');

var CounterSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
var counter = db.model('counter', CounterSchema);


var customerSchema = new Schema({
    customer_id : Number,
    email : String,
    referral_id :{type: Number, default: null},
    payback: {type: Number, default: 0},
    isAmbassador : {type: Boolean, default: false},
    joiningDate : {type: Date,  default: Date.now},
    lastUpdated : {type: Date,  default: Date.now}
});

customerSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'customer'}, {$inc: { seq: 1} }, { upsert: true}, function(error, count)   {
        if(error)
            return next(error);
        doc.customer_id = count.seq;
        next();
    });
});

// we need to create a model using above schema
var customerModel = db.model('customer', customerSchema);

// make this available to our users in our Node applications
module.exports = customerModel;