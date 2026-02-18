const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url, { family: 4 })

.then(result => {
    console.log('connected to MongoDB')
})
.catch(error => {
    console.log('error connecting to MongoDB:', error.message)
})

const contactSchema = new mongoose.Schema({
    name: {    type: String,    minLength: 3,    required: true  },
    number: {
    type: String,
    minLength: 8,
    validate: {validator: function(v) {
        // Must be 2-3 digits, hyphen, 5-6 digits
        return /^\d{2,3}-\d+$/.test(v);
    },
        message: props => `${props.value} Phone number must be in format XX-XXXXX or XXX-XXXXXX!`
    },
    required: [true, 'User phone number required']
}
})


contactSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('Contact', contactSchema)
