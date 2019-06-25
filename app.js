const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');
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
                return Event.find()
                .then(events  => {
                    return events.map( event => {
                        return { ...event._doc, _id: event._doc._id.toString() };
                    });
                }).catch(err => {
                    throw err;
                });
            },
            createEvent: args => {
                const event = new Event({
                    title:  args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)
                });
                return event
                    .save()
                    .then(result => {
                        return { ...result._doc };
                    })
                    .catch(err => {
                        console.log("====ERR=====");
                        throw err;
                    });
            }
        },
        graphiql: true
    })
);

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
        process.env.MONGO_PASSWORD
    }@cluster0-flcwu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
).then(() => {
    app.listen(3000);
}).catch(err => {
    console.log("=====ERROR======", err);
});




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
