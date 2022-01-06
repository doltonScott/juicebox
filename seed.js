const { Client } = require("pg"); // imports the pg module

// supply the db name and location of the database
const client = new Client("postgres://localhost:5432/juicebox-dev");

module.exports = {
  client,
};

const { client } = require("./index");

async function testDB() {
  try {
    // connect the client to the database, finally
    client.connect();

    // queries are promises, so we can await them
    const result = await client.query(`SELECT * FROM users;`);

    // for now, logging is a fine way to see what's up
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    // it's important to close out the client connection
    client.end();
  }
}

testDB();