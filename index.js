const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6rml2ff.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();
    const featuresCollection = client.db("techDB").collection("featured");
    const trendingCollection = client.db("techDB").collection("trending");
    const userCollection = client.db("techDB").collection("users");
    const productCollection = client.db("techDB").collection("products");
    const reviewCollection = client.db("techDB").collection("reviews");

    //   get features items
    app.get("/features", async (req, res) => {
      const filter = req.query;
      // const query = {};
      // const options = {
      //   sort: { release_date: filter.sort === "new" ? 1 : -1 },
      // };
      const result = await featuresCollection.find().toArray();
      res.send(result);
      // console.log(result);
    });

    // update upvote for featured product
    app.patch("/features/:id", async (req, res) => {
      const id = req.params.id;
      const latestVote = req.body.upVote;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          up_vote: latestVote,
        },
      };
      const result = await featuresCollection.updateOne(filter, updateDoc);
      // console.log(result);
      res.send(result);
    });

    // get all trending products
    app.get("/trending", async (req, res) => {
      const filter = req.query;
      const query = {};
      const options = {
        sort: { up_vote: filter.query === "largest" ? 1 : -1 },
      };
      const result = await trendingCollection.find(query, options).toArray();
      res.send(result);
      // console.log(result);
    });
    // update upvote for trending product
    app.patch("/trending/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const latestVote = req.body.upVote;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          up_vote: latestVote,
        },
      };
      const result = await trendingCollection.updateOne(filter, updateDoc);
      // console.log(result);
      res.send(result);
    });
    // add users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const existUser = await userCollection.findOne(query);
      if (existUser) {
        return res.send({ message: "User already exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // get all products
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // update upvote for products product
    app.patch("/product/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const latestVote = req.body.upVote;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          up_vote: latestVote,
        },
      };
      const result = await productCollection.updateOne(filter, updateDoc);
      // console.log(result);
      res.send(result);
    });
    // post review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      // const user = req.body.userEmail;
      // // console.log(user);
      // const query = { userEmail: user };
      // const existUser = await reviewCollection.findOne(query);
      // if (existUser) {
      //   return res.send({ message: "User already exist" });
      // }
      const result = await reviewCollection.insertOne(review);
      // console.log(result);
      res.send(result);
    });

    // get all review
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tech world server is running");
});

app.listen(port, () => {
  console.log(`TECH is running on PORT ${port}`);
});
