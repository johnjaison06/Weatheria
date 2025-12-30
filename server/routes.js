const express = require("express");
const router = express.Router();
const {ObjectId} = require("mongodb")

const {getConnectedClient} = require("./database")

const getCollection = ()=>{
    const client = getConnectedClient();
    const collection = client.db("weatheriadb").collection("weatherdata");
    return collection;  
}


router.get("/weather", async (req,res)=>{

    const collection = getCollection();
    const weather = await collection.find({}).toArray();
    res.status(200).json(weather);
});


router.post("/weather",async (req,res)=>{

    const collection = getCollection();
    const weather = req.body;
    if(!weather)
    {
        res.status(400).json({mssg:"Error no data "})
    }
    console.log(weather);
    const newWeather = await collection.insertOne(weather);
    res.status(200).json({weather,_id:newWeather.insertedId});

    
});



// router.put("/weather/:id", async (req,res)=>{
//     const collection = getCollection();
//      const _id  = new ObjectId(req.params.id);
//     const weather = req.body;
//       const updatedWeather = await collection.updateOne({_id},{$set:{weather:weather}});
//     res.status(200).json({});
// });


router.delete("/weather/:id", async (req,res)=>{
      const collection = getCollection();
        const _id  = new ObjectId(req.params.id);

        const deletedWeather= await collection.deleteOne({_id});
        res.status(201).json(deletedWeather)
});


module.exports = router;