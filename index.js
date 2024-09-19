import express, { json, response } from "express";
const app = express();
const port = process.env.PORT || 5000;
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

import dotenv from "dotenv";
dotenv.config();

const M_userName = process.env.Mongo_User_Name;
const M_password = process.env.Mongo_User_Password;

// for file reading
import fs from "fs";
// import { resolveMx } from "dns";

// middleWare
app.use(cors());
app.use(express.json());



//************************************************** */

const uri = `mongodb+srv://${M_userName}:${M_password}@sweethome.gfjhoj6.mongodb.net/?retryWrites=true&w=majority&appName=SweetHome`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dataInjection = async (collectionName) => {
  try {
    const injectCakeData = JSON.parse(
      fs.readFileSync("./Data/FevCakeData.json", "utf8")
    );

    const result = await collectionName.insertMany(injectCakeData);
    console.log("this is the result", result);
  } catch (error) {
    console.log("functional error", error);
  }
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const SweetHomeDB = client.db("SweetHome");

    // all the collection of the data base down

    const allCakeCollection = SweetHomeDB.collection("allCakeCollection");
    const allCustomerCollection = SweetHomeDB.collection(
      "allCustomerCollection"
    );
    const allBakerCollection = SweetHomeDB.collection("allBakerCollection");
    const allShopCollection = SweetHomeDB.collection("allShopCollection");
    const allOrderCollection = SweetHomeDB.collection("allOrderCollection");
    const allFevouriteCollection = SweetHomeDB.collection(
      "allFavouriteCollection"
    );

    // all the collection of the data base up

    // await dataInjection(allFevouriteCollection)

    // server test
    app.get("/", (req,res)=>{
      res.send({message:"i am working"})
    })
     // server test

    // all cake collection for market place down
    app.get("/api/v2/home", async (req, res) => {
      try {
        const result = await allCakeCollection
          .find({
            $or: [{ deleted: { $exists: false } }, { deleted: false }],
          })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Failed to fetch data");
      }
    });
    // all cake collection for market place up

    // find a single cake
    app.get("/api/v2/findASingleCake/:cakeId", async (req, res) => {
      const { cakeId } = req.params;
      // console.log("server",cakeId)
      try {
        const result = await allCakeCollection.findOne({
          _id: new ObjectId(cakeId),
        });
        if (result) {
          res.send(result);
        } else {
          res.send({ message: "fetch Worked but no result" });
        }
      } catch (error) {
        res.send({ message: "fetch didnt worked" }, error);
      }
    });
    // find a single cake

    // all shop collection for market place down
    app.get("/api/v2/allShopCollection", async (req, res) => {
      const result = await allShopCollection.find().toArray();
      console.log(result);
      res.send(result);
    });
    // all shop collection for market place up

    //all customer related apis are here down...........

    // create a customer
    app.post("/api/v2/signUpPage/customerSignUp", async (req, res) => {
      const customer = req.body;
      const result = await allCustomerCollection.insertOne(customer);
      res.send(result);
    });

    //login A customer
    app.get("/api/v2/customerSignIn/:email/:password", async (req, res) => {
      const { email, password } = req.params;
      try {
        const result = await allCustomerCollection.findOne({
          email: email,
          password: password,
        });

        console.log(result);

        if (result) {
          res.send(result);
        } else {
          // Log and respond if no user is found
          console.log("User not found");
          res.send({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error occurred:", error);
        res.send({ message: "Internal server error", error });
      }
    });

    // find a single customer
    app.get("/api/v2/findSingleCustomer/:customerId", async (req, res) => {
      const { customerId } = req.params;
      try {
        const result = await allCustomerCollection.findOne({
          _id: new ObjectId(customerId),
        });

        console.log(result);

        if (result) {
          res.send(result);
        } else {
          // Log and respond if no user is found
          console.log("User not found");
          res.send({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error occurred:", error);
        res.send({ message: "Internal server error", error });
      }
    });

    //place an order
    app.post("/api/v2/customer/createAnOrder", async (req, res) => {
      const orderData = req.body;
      // console.log("placed order",orderData)
      try {
        const placedOrder = await allOrderCollection.insertOne(orderData);
        res.send(placedOrder);
      } catch (error) {
        res.send({ message: "sarver Data insertion Failed", error });
      }
    });

    //Gather All Order of the Customer
    app.get("/api/v2/customerAllOrderCollection/:customerId", async (req, res) => {
      const { customerId } = req.params;
      // console.log("i am the shio pi",customerId)

      try {
        const result = await allOrderCollection
          .find({ customer_id: customerId })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log("error occared at cke fetching", error);
        res.send({ message: "server error cake collection fetching", error });
      }
    });

    // find fev cake list
    app.get("/api/v2/customerFaveCakeList/:customerId", async (req, res) => {
      const { customerId } = req.params;

      try {
        const request = await allFevouriteCollection.findOne({
          customerId: customerId,
        });
        // console.log(request)
        res.send(request);
      } catch (error) {
        // console.log("error on server",error)
        res.send({ message: "something went wrong in server", error });
      }
    });

    //add cake to favourite list
    app.post(
      "/api/v2/addCakeToThefavouriteList/:customerId/:cakeId",
      async (req, res) => {
        const fevCakeAndCustomer = req.body;
        const customerId = fevCakeAndCustomer.customerId;
        const cakeId = fevCakeAndCustomer.favouriteCake;

        try {
          const targetCustomerFevlist = await allFevouriteCollection.findOne({
            customerId: customerId,
          });

          if (targetCustomerFevlist) {
            if (targetCustomerFevlist.fevCakeList.includes(cakeId)) {
              const result = await allFevouriteCollection.updateOne(
                { customerId: customerId },
                { $pull: { fevCakeList: cakeId } }
              );
              res.send({ message: "cake removed to fevourite list", result });
            } else {
              const result = await allFevouriteCollection.updateOne(
                { customerId: customerId },
                { $addToSet: { fevCakeList: cakeId } }
              );
              res.send({ message: "cake added to fevourite list", result });
            }
          } else {
            const result = await allFevouriteCollection.insertOne({
              customerId: customerId,
              fevCakeList: [cakeId],
            });
            res.send({ message: "cake added to fevourite list", result });
          }
        } catch (error) {
          res.send({ message: "sarver section code problem", error });
        }
      }
    );

    // find a customer for password reset
    app.post("/api/v2/customer/passworReset", async(req,res)=>{
      const {email, mobileNo}= req.body
      console.log(email,mobileNo)
      try
      {
        const request = await allCustomerCollection.findOne({
          email:email,
          $or:[
            {mob:mobileNo},
            {mobAlt:mobileNo}

          ]
        })

        res.send(request)
      }
      catch(error)
      {
        res.send({message:"something went wrong"}, error)
      }
    })

    // change customer password
    app.put("/api/v2/customer/changePassword", async(req,res)=>{
      const {id, newPassword} = req.body
      console.log("server", id,newPassword)
      try
      {
        const result = await allCustomerCollection.updateOne(
          {  _id: new ObjectId(id)}, 
          {
            $set: {                   
              password:newPassword,
              reInterPassword:newPassword

            }
          },
          {
            upsert:true
          }
        );
        res.send(result)
      }
      catch(error)
      {
        res.send({message:"something went wrong", error})
      }
  })

    //all customer related apis are here up.............

    // all baker related apis are here down...........

    // create a bacer****
    app.post("/api/v2/signUpPage/bakerSignUp", async (req, res) => {
      const baker = req.body;
      const result = await allBakerCollection.insertOne(baker);
      res.send(result);
    });

    // find singleShop
    app.get("/api/v2/baker/findSingleShop/:shopId", async (req, res) => {
      const { shopId } = req.params;
      // console.log("shopId",shopId)
      try {
        const shopData = await allShopCollection.findOne({
          _id: new ObjectId(shopId),
        });
        // console.log(shopData)
        res.send(shopData);
      } catch (error) {
        res.send({
          message: "something went wrong fetching single Shop",
          error,
        });
      }
    });

    //create a shop***
    app.post("/api/v2/signUpPage/bakerSignUp/createShop", async (req, res) => {
      const shop = req.body;
      const result = await allShopCollection.insertOne(shop);
      res.send(result);
    });

    //log in a baker
    app.get("/api/v2/bakerSignIn/:email/:password", async (req, res) => {
      const { email, password } = req.params;
      console.log("server", email, password);
      try {
        const result = await allBakerCollection.findOne({
          email: email,
          password: password,
        });

        console.log(result);

        if (result) {
          const ownerId = result._id.toString();
          const findShopId = await allShopCollection.findOne({
            shopOwnerId: ownerId,
          });
          // console.log("foundShop",findShopId)

          const bakerDataWithShopId = { ...result, shopId: findShopId._id };
          // console.log( "final output",bakerDataWithShopId)

          res.send(bakerDataWithShopId);
        } else {
          // Log and respond if no user is found
          console.log("User not found");
          res.send({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error occurred:", error);
        res.send({ message: "Internal server error", error });
      }
    });

    //Gather Allcake of the Baker
    app.get("/api/v2/bakerAllCakeCollection/:shopId", async (req, res) => {
      const { shopId } = req.params;
      // console.log("i am the shio pi",shopId)

      try {
        const result = await allCakeCollection
          .find({
            shop_id: shopId,
            $or: [{ deleted: { $exists: false } }, { deleted: false }],
          })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log("error occared at cke fetching", error);
        res.send({ message: "server error cake collection fetching", error });
      }
    });

    // add new cake from the baker
    app.post("/api/v2/baker/addnewcake", async (req, res) => {
      const cakeData = req.body;
      // console.log(cakeData)
      try {
        const result = await allCakeCollection.insertOne(cakeData);
        res.send(result);
      } catch (error) {
        res.send({ message: "failed to insert in cake colletion", error });
      }
    });

    // updateCake
    app.put("/api/v2/baker/UpdateACake/:cakeId", async (req, res) => {
      const { cakeId } = req.params;
      const updateCake = req.body;
      // console.log(cakeId,updateCake)

      try {
        const result = await allCakeCollection.updateOne(
          { _id: new ObjectId(cakeId) },
          { $set: updateCake },
          { upsert: true }
        );
        res.send(result);
      } catch (error) {
        res.send({ message: "coudnt update cake", error });
      }
    });

    // delete a cake
    app.put("/api/v2/baker/deleteCake/:shopId/:cakeId", async (req, res) => {
      const { shopId, cakeId } = req.params;
      const update = req.body;
      // console.log("shop",shopId,"cake",cakeId,"upa", update)

      try {
        const result = await allCakeCollection.updateOne(
          { _id: new ObjectId(cakeId), shop_id: shopId },
          { $set: update },
          { upsert: true }
        );

        res.send(result);
      } catch (error) {
        console.log({ message: "something went wrong", error });
        res.send({ message: "something went wrong", error });
      }
    });

    //Gather All Order of the Baker
    app.get("/api/v2/bakerAllOrderCollection/:shopId", async (req, res) => {
      const { shopId } = req.params;
      // console.log("i am the shio pi",shopId)

      try {
        const result = await allOrderCollection
          .find({ shop_id: shopId })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log("error occared at cke fetching", error);
        res.send({ message: "server error cake collection fetching", error });
      }
    });

    // find single order of the baker
    app.get("/api/v2/bakerFindSingleOrder/:orderId", async (req, res) => {
      const { orderId } = req.params;
      // console.log("i am the shio pi",orderId)

      try {
        const result = await allOrderCollection.findOne({
          _id: new ObjectId(orderId),
        });

        console.log(result);
        res.send(result);
      } catch (error) {
        console.log("error occared at cke fetching", error);
        res.send({ message: "server error cake collection fetching", error });
      }
    });

    // update order state
    app.put("/api/v2/baker/updateOrderState/:orderId", async (req, res) => {
      const { orderId } = req.params;
      const newData = req.body;
      console.log(orderId, newData);

      try {
        const request = await allOrderCollection.updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              status: newData,
            },
          },
          { upsert: true }
        );
        // console.log(request)
        res.send(request);
      } catch (error) {
        // console.log("somwthing went wrong to update orderState")
        res.send({ message: "failed to update the state =>server", error });
      }
    });

    // find a Baker for password reset
    app.post("/api/v2/baker/passworReset", async(req,res)=>{
      const {email, mobileNo}= req.body
      console.log(email,mobileNo)
      try
      {
        const request = await allBakerCollection.findOne({
          email:email,
          $or:[
            {mob:mobileNo},
            {mobAlt:mobileNo}

          ]
        })

        res.send(request)
      }
      catch(error)
      {
        res.send({message:"something went wrong"}, error)
      }
    })

    // change baker password
    app.put("/api/v2/baker/changePassword", async(req,res)=>{
        const {id, newPassword} = req.body
        try
        {
          const result = await allBakerCollection.updateOne(
            {  _id: new ObjectId(id)}, 
            {
              $set: {                   
                password:newPassword,
                reInterPassword:newPassword
  
              }
            },
            {
              upsert:true
            }
          );
          res.send(result)
        }
        catch(error)
        {
          res.send({message:"something went wrong", error})
        }
    })

    // all baker related apis are here up.....
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


