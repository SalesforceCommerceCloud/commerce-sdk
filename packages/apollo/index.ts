import { ApolloServer } from "apollo-server";
import { importSchema } from "graphql-import";
import { validate } from "graphql/validation";
import { GraphQLSchema, GraphQLError } from "graphql";

try {
  let typeDefs = importSchema(
    "../generator/renderedTemplates/schema.gql",
    {},
    { out: "GraphQLSchema" }
  );
} catch (e) {
  console.log("Something went wrong.");
}

// Console.log(typeDefs);
// Const results = validate(typeDefs, ast);

// const server = new ApolloServer({ typeDefs });

// server.listen().then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`);
// });
