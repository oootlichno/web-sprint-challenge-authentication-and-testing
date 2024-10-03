/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('users').truncate()
  await knex('users').insert([
    {username: 'Tom', password: '12345'},
    {username: 'Alice', password: '12345'},
    
  ]);
};
