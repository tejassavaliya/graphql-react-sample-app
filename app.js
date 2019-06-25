const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const events = [];
app.use(
    '/graphql',
    graphqlHttp({
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }
            
            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }
            type RootQuery {
                events: [Event!]!
            }
            
            type RootMutation {
                createEvent(eventInput: EventInput): Event
            }
            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            events: () => {
                return events;
            },
            createEvent: (args) => {
                const event = {
                    _id: Math.random().toString(),
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: args.eventInput.date
                };
                events.push(event);
                return event;
            }
        },
        graphiql: true
    })
);


app.listen(3000);


/**
 * createEvent : you can add data to your object
  mutation {
     createEvent(eventInput:{title: "A TEst", description: "this is desc", price: 5665.98, date: "25 june 2019"}) {
        title
        description
    }
  }
*/

/**
 * to see the query data
 * query {
      events {
        title
        description
      }
    }
 */
