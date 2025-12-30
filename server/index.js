require("dotenv").config();
const express = require("express");

const {connectToMongoDB} = require("./database");




const app = express();
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
