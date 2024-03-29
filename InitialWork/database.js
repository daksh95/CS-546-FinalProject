const users = {
  // buyers and sellers
  _id: new ObjectId(),
  name: String,
  phone: String,
  emailId: String,
  governmentId: {
    typeOfId: String,
    Id: String,
  },
  dob: String,
  gender: String,
  approved:   String("pending, approved, rejected"), // to be discussed.
  rating: {
    totalRating: Number,
    count: Number,
  },
  land: [
    // Changes here. Id key is nested in Land.
    {
      _id: ObjectId(),
    },
  ],
};

const land = {
  _id: new ObjectId(),
  dimensions: {
    length: Number,
    breadth: Number,
  },
  type: String,
  restrictions: [String],
  sale: {
    onSale: Boolean,
    price: Number, // this will be shown if and only if sale:true
    dateOfListing: Date, // this will be shown if and only if sale:true
  },
  area: String, //Length*Breadth
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipCode: String,
  }, //Change here. there was no address field.
  status: String("pending, approved, rejected"),
};

const entity = {
  _id: new ObjectId(),
  name: String,
  role: String,
  contactInfo: String, //phone number
  emailId: String,
  Website: String,
  license: String,
  transactions: Array,
  approved: String("pending, approved, rejected"),
};

const transaction = {
  _id: new ObjectId(),
  land: ObjectId(),
  buyer: {
    // change in this structure
    _id: ObjectId(),
    bid: Number,
  },
  seller: {
    _id: ObjectId(),
    status: String("pending, approved, rejected"),
  }, //change in structure
  priceSoldFor: Number,
  surveyor: {
    _id: ObjectId(),
    status: String("pending, approved, rejected"),
    Comment: String,
  },
  titleCompany: {
    _id: ObjectId(),
    status: String("pending, approved, rejected"),
    Comment: String,
  },
  government: {
    _id: ObjectId(),
    status: String("pending, approved, rejected"),
    Comment: String,
  },
  admin: {
    _id: ObjectId(),
    status: Boolean,
    Comment: String,
  },
  status: String("pending, approved, rejected"),
};

const credentials = {
  _id: new ObjectId(),
  typeOfUser: String,
  emailId: String,
  password: String,
  previousPassword: [String],
  profileSetUpDone: Boolean,
  isApproved: Boolean,
};
