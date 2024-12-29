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
        console.log('req.headers recieved', req.headers);
        if (!req.headers.authorization) {
            res.json({
                data: [],
                status: "error",
                error: "Login required"
            })
        }
        var decoded = jwt.verify(req.headers.authorization, secretKey);
        console.log('decoded', decoded);
        if (!decoded) {
            res.json({
                data: [],
                status: "error",
                error: "Login required"
            })
        }
        req.body.user = decoded;
        next();
    } catch (error) {
        res.json({
            data: [],
            status: "error",
            error: error
        })
    }
}























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


app.post('/experience/post',authVerify, async (req, res) => {
    try {
        console.log("data in api");
        console.log("token in backend",token);
        
        let newExperience = new Userexperience({
            
            id: req.body?.id,
            token: req.body?.token,
            title: req.body?.title,
            description: req.body?.description,
            image: req.body?.image,
        })
        let output = await newExperience.save();
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
app.get('/experince/get', async (req, res) => {
    try {
        console.log("data in api");
        let output = await Userexperience.find();
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
        let experience = await Userexperience.findOneAndDelete({_id:id});
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
        let experience = await Userexperience.findOneAndUpdate({_id:id}, req.body, {new: true})
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
                address: userFound.address
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