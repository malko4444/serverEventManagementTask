const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var cors = require('cors')
var jwt = require('jsonwebtoken');
const bcrypt = require( 'bcrypt' );
const app = express();
// const port = 6000;
const connectDB = async () => {
    try {
        // Replace the connection string with your MongoDB URI
        const dbURI = "mongodb+srv://itxzubair45:JSw2SEE8JjTGiwaF@cluster0.gxseg.mongodb.net/kisanDost";
        await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB Connected…in 6000w');
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit the process with failure
    }
};
connectDB();
//verification

const secretKey = 'lkasdfjlkasdsadasdsafssdfsdfsdf#sadfs$@%JSDFsdf';
const authVerify = (req, res, next) => {
    try {
        console.log('Headers received:', req.headers);

        // Check if the Authorization header exists
        if (!req.headers.authorization) {
            return res.json({
                data: [],
                status: "error",
                error: "Login required"
            });
        }

        // Extract the token from the Authorization header
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.json({
                data: [],
                status: "error",
                error: "Invalid token"
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, secretKey);
        console.log('Decoded token:', decoded);

        if (!decoded) {
            return res.json({
                data: [],
                status: "error",
                error: "Login required"
            });
        }

        // Attach user data to the request body
        req.body.user = decoded;

        // Proceed to the next middleware or route
        next();
    } catch (error) {
        console.error('Error in authVerify:', error);
        return res.json({
            data: [],
            status: "error",
            error: error.message || "Authentication error"
        });
    }
};























const KisanDost = mongoose.model(
    'AgricultureLoans', // Logical name in your code
    new mongoose.Schema({}, { strict: false }), // No enforced schema
    'agriculture_loans' // Exact name of the collection in MongoDB
);
app.use(cors());

app.use(bodyParser.json({limit : "20mb"})); // Parse application/json
app.use(bodyParser.urlencoded({ extended: true,limit:"20mb" })); // Parse application/x-www-form-urlencoded

// Custom middleware to log details
app.use((req, res, next) => {
    console.log("Date:", Date.now());
    console.log("Request Headers:", req.headers);
    console.log("Request Details -> Method:", req.method, ", Params:", req.params, ", Query:", req.query);
    next(); // Pass control to the next middleware or route handler
});

app.listen(7000, () => {
    console.log("server started at 7000")
})

app.get('/data', async (req, res) => {
    try {
        const Data = await KisanDost.find();
        res.json({
            data: Data
        })
    } catch (error) {

    }
})

app.post('/data/add' , async (req, res) => {
    try {
        console.log("data in api");


        const newData = new KisanDost(req.body);
        console.log(newData);

        let storedData = await newData.save();
        res.json(storedData)



    } catch (error) {
        res.json({
            error: error,
            data: []
        })
    }
})














//New collection of users for post 

const Userexperience = mongoose.model(
    'experience', // Logical name in your code
    new mongoose.Schema({}, { strict: false }), // No enforced schema
    'experience' // Exact name of the collection in MongoDB
);




// Define the schema for the events collection
const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    token:{type: String, required:true},
    location: { type: String, required: true },
    category: { type: String, required: true },
    eventDate: { type: Date, required: true },
}, { timestamps: true }); // Timestamps will auto-include createdAt and updatedAt

// Create a new model for events
const Event = mongoose.model('Event', EventSchema, 'events'); // 'events' is the collection name in MongoDB




app.post('/experience/post', authVerify, async (req, res) => {
    try {
        console.log("data in API");
        console.log("token in backend", req.body.token); // Fix token reference

        // Create a new event with the fields sent from the frontend
        let newEvent = new Event({
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            token:req.body.token,
            location: req.body.location, // New field for location
            category: req.body.category, // New field for category
            eventDate: req.body.eventDate // New field for event date
        });

        // Save the event data to the events collection in the database
        let savedEvent = await newEvent.save();

        // Send success response with saved event data
        res.json({
            data: savedEvent,
            status: "success"
        });

    } catch (error) {
        // Handle errors and send failure response
        console.error("Error:", error);
        res.json({
            error: error.message,
            data: []
        });
    }
});
app.get('/experince/get', async (req, res) => {
    try {
        console.log("data in api");
        let output = await Event.find();
        res.json({
            data: output,
            status: "success"
        })
    } catch (error) {
        res.json({
            error: error,
            data: []
        })
    }
})

app.delete('/experience/delete/:id', async (req, res) => {
    try {
        let id = req.params?.id;
        let experience = await Event.findOneAndDelete({_id:id});
        res.json({
            data:experience,
            status: "success"
        })
        
    } catch (error) {
        res.json({ 
            data:[],
            status: "error",
            error: error
        })
    }
})

app.put('/experience/update/:id', async (req, res) => {
    try {
        let id = req.params?.id;
        let experience = await Event.findOneAndUpdate({_id:id}, req.body, {new: true})
        res.json({
            data: experience,
            status: "success"
            })

} catch (error) {
    res.json({
        data: [],
        status: "error",
        error: error
        })
        
    }
})










//sigin signup messages 


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    email: {
        type: String,
        unique:true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contact :{
        type:String,
        required:true

    }
});

const User = mongoose.model('Users', userSchema);

app.post('/auth/signup', async (req, res) => {
    try {
        console.log('req.body recieved', req.body);
        if (!req.body?.password) {
            res.json({
                data: [],
                status: "error",
                error: "password is required"
            })
        }
        var hash = bcrypt.hashSync(req.body.password, 8);
        console.log('hash', hash);
        let newUser = new User({
            name: req.body?.name,
            email: req.body?.email,
            password: hash,
            contact: req.body?.contact
        })

        let output = await newUser.save();
        res.json({
            data:output,
            status: "success"
        })

    } catch (error) {
        res.json({
            data: [],
            status: "error",
            error: error
        })
    }
})


app.post('/auth/login', async (req, res) => {
    try {
        if (!req.body?.email) {
            res.json({
                data: [],
                status: "error",
                error: "email is required"
            })
            
        }
        if (!req.body?.password) {
            res.json({
                data: [],
                status: "error",
                error: "password is required"
            })
        }

        const userFound = await User.findOne({ email: req.body.email });

        if (!userFound) {
            res.json({
                data: [],
                status: "error",
                error: "user not found"
            })
        }

        console.log("userFound", userFound);
        
        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            userFound.password
        );

        if (!passwordIsValid) {
            res.json({
                data: [],
                status: "error",
                error: "password is invalid"
            })
        }

        var token = jwt.sign({_id:userFound._id, email:  userFound.email, name:userFound.name }, secretKey);
        console.log('token', token);

        res.json({
            data: {
                token:token,
                email: userFound.email,
                name: userFound.name,
                address: userFound.contact
            },
            status: "success"
        })

    } catch (error) {
        res.json({
            data: [],
            status: "error",
            error: error
        })
    }
})  