const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true,'Name is required']
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, "Please enter a valid email"
    ]
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minLength: [6, "Password must be up to 6 characters"],
    // maxLength: [23, "Password must not be more than 23 characters"]
  },
  photo: {
    type: String,
    required: [true, 'Please add a password'],
    default: 'https://i.ibb.co/4pDNDk1/avatar.png'
  },
  phone: {
    type: String,
    default: '+63'
  },
  bio: {
    type: String,
    maxLength: [250, 'Bio must not be more than 250 characters'],
    default: 'bio'
  }
}, {
  timestamps: true,
})

//encrypt passpword before saving to DB
userSchema.pre("save", async function(next) {
  if(!this.isModified("password")) {
    return next();
  }


  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();

})

const User = mongoose.model('User', userSchema);

module.exports = User;