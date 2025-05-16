const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, ".env")});
const { MongoClient, ServerApiVersion } = require("mongodb");

const portNumber = 5000;
app.listen(portNumber, () => {console.log(`Server running on port ${portNumber}`);});
console.log(`Web server started and running at http://localhost:${portNumber}`);
process.stdout.write("Type stop to shutdown the server: ");
process.stdin.setEncoding("utf8");

process.stdin.on("readable", () => {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "stop") {
            async () => { await client.close(); }
            console.log("Shutting down the server");
            process.exit(0);
        } else {
            console.log(`Invalid command: ${command}`);
        }
    }

    process.stdout.write("Stop to shutdown the server: ");
    process.stdin.resume();
});

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname));

let client;
let collection;
const databaseName = "CMSC335DB";
const collectionName = "financeData";

(async () => {
    const uri = process.env.MONGO_CONNECTION_STRING;
    client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        const database = client.db(databaseName);
        collection = database.collection(collectionName);

        const transactions = require("./routes/transactions")(collection);
        app.use("/", transactions);
    } catch (e) {
        console.error(e);
    }
})();