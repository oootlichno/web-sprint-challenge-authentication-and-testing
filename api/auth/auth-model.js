const router = require("express").Router();
const db = require('../../data/dbConfig');

async function find() {
    try {
        return await db("users").select("id", "username"); 
    } catch (error) {
        throw new Error("Unable to retrieve users");
    }
}

async function findBy(filter) {
    try {
        const users = await db("users")
            .select("id", "username", "password")
            .where(filter);
        return users[0] || null;
    } catch (error) {
        throw new Error("Unable to find user");
    }
  }

function findById(id) {
  return db("users")
  .select("id", "username")
  .where("users.id", id)
  .first()
 
}

async function add(user) {
  try {
      const [id] = await db("users").insert(user); 
      return findBy({ id }); 
  } catch (error) {
      console.error("Error adding user:", error); 
      throw new Error("Unable to add user");
  }
}

module.exports = {
    find,
    findBy,
    findById,
    add
};