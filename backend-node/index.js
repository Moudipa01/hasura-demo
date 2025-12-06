import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const client = axios.create({
  url: process.env.HASURA_URL,
  method: "post",
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
  }
});

async function runGraphQL(query, variables = {}) {
  const res = await axios.post(
    process.env.HASURA_URL,
    { query, variables },
    { headers: { "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET } }
  );
  console.log(JSON.stringify(res.data, null, 2));
}

runGraphQL(`
mutation MyInsert($title: String!) {
  insert_tasks_one(object: {title: $title}) {
    id
    title
  }
}
`, { title: "Task from Node.js" });
