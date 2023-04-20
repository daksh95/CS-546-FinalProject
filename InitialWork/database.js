const users= { // buyers and sellers
    _id: new ObjectId(),
    name: String,
    Phone: String,
    emailId: String,
    Government_id: {
      typeOfId: String,
      Id: String,
    },
    DOB: String,
    gender: String,
    approved:Boolean,
    rating:{   
        totalRating: Number,
        count: Number,
    },
    land:[// Changes here. Id key is nested in Land.
        {
            _id: ObjectId(),
        },
    ]
}

const land ={
    _id: new ObjectId(),
    dimensions:{
        length: Number,
        breadth: Number,
    },
    type: String,
    restrictions: [String],
    sale: Boolean,
    Address: String,//Change here. there was no address field.
    price: Number, //this will be shown if and only if sale: true
    approved: Boolean,
}

const intermediary ={
    _id: new ObjectId(),
    name: String,
    type: String,
    contactInfo: String,//phone number
    emailId: String,
    Website: String,
    license: String, 
    approved:Boolean, 
}

const transaction ={
    _id: new ObjectId(), 
    land: ObjectId(),
    buyer: { // change in this structure
      _id:  ObjectId(),
      bid: Number,
    },
    sellerId: ObjectId(),//change in name
    priceSoldFor: Number,
    surveyor: {
        _id:  ObjectId(),
        status: Boolean,
        Comment: String,
    },
    titleCompany: {
        _id:  ObjectId(),
        status: Boolean,
        Comment: String,
    },
    government: {
        _id:  ObjectId(),
        status: Boolean,
        Comment: String,
    },
    admin: {
        _id:  ObjectId(),
        status: Boolean,
        Comment: String,
    }, 
}


const credentials ={
    _id: new ObjectId(),
    typeOfUser: String,
    emailId: String,
    password: String,
}