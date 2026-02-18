const express = require('express')
const Contact = require('./models/contact')

const morgan = require('morgan')
const app = express()

const cors = require('cors')
const path = require('path')


app.use(express.json())








//morgan.token('body2', function (req, res) {
   // console.log(res)
  //  return JSON.stringify(req["body"]) })

/*app.use(morgan(function (tokens, req, res) {

    const reqType=tokens.method(req, res);


    let postData= reqType ==="POST"? tokens.body(req, res):""

    return [
        tokens.method(req, res),
               tokens.url(req, res),
               tokens.status(req, res),
               tokens.res(req, res, 'content-length'), '-',
               tokens['response-time'](req, res), 'ms',
               postData
    ].join(' ')
}))

*/
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
})


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static(path.join(__dirname, 'dist')))

const PORT = process.env.PORT || 3001

let persons =[
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
{
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
},
{
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
},
{
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
},
{
    "id": "5",
    "name": "delendus",
    "number": "39-23-642002"
}

]

app.get('/', (request, response) => {
    response.send('<h1>Hello World! Phonebook.app</h1>')
})

app.get('/phoneindex', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})



app.get('/api/persons', (request, response) => {
    //response.json(persons)


    Contact.find({}).then(result => {
            response.json(result)
        })

})

app.get('/api/info', (request, response) => {
    Contact.countDocuments()
    .then((mycount) => {
        response.send(`
        <h1>Phonebook has info for ${mycount} ${mycount === 1 ? 'person' : 'people'}!</h1>
        <div>${new Date()}</div>
        `);
    })
    .catch((err) => {
        console.log(err);
        response.status(500).send('Error fetching count');
    });
});


app.get('/api/persons/:id', (request, response, next) => {
    const myid = request.params.id
    Contact.findById(myid)
    .then(person => {
        if (person) {
            response.json(person)

        }
        else {
            response.status(404).end()      }
            })
    .catch(error => next(error))

})


app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    const myid = request.params.id

    Contact.findById(myid)
    .then(p => {
        if (!p) {
            return response.status(404).end()
        }

        p.name = name
        p.number = number

        return p.save().then((updatedPerson) => {
            response.json(updatedPerson)
        })
    })
    .catch(error => next(error))
})






app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    // const person = persons.find(person => person.id === id)
    // if (person) {
    //     persons = persons.filter(person => person.id !== id)
    //     response.status(204).end()
    // } else {
    //     response.status(404).end()  }
    // .catch(error => next(error))

    Contact.findByIdAndDelete(id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))





})

app.post('/api/persons', (request, response,next) => {
    const person = request.body

    console.log("-------------------------------------------")

    //console.log(person)


 /*   if (!person.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    }
    else if (!person.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }
    else if (persons.some(p => p.name === person.name)) {
        return response.status(400).json({
            error: 'The name already exists in the phonebook'
        })
    }*/

    const a = persons.length
    const id = Math.floor(Math.random() * (1000 - a + 1)) + a

    const newperson = new Contact({"name":person.name, "number":person.number})

    newperson.save().then(savedContact => {
        response.json("added, ", savedContact)
    }).catch(error => next(error))


    //newperson.id = String(id)

    persons = persons.concat(newperson)

})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })

    }

    next(error)
}

app.use(errorHandler)



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
