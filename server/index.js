require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {connectToMongoDB} = require("./database");

const app = express();

app.use(cors());    
app.use(express.json());


const router = require("./routes");
app.use("/api",router);

const port = process.env.PORT || 4000;

async function startServer()
{
    await connectToMongoDB();

    app.listen(port,()=>
        {
        console.log(`The server is running on http://localhost:${port}`)
        });
    
}
startServer();
