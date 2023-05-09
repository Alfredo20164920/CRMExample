const mongoose = require('mongoose');

const OrdersSchema = mongoose.Schema({
    order: {
        type: Array,
        require: true,
    },
    total: {
        type: Number,
        require: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        require: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    status: {
        type: String,
        default: "PENDING"
    },
    created: {
        type: Date,
        default: Date.now(),
    }

})


module.exports = mongoose.model('Order', OrdersSchema);