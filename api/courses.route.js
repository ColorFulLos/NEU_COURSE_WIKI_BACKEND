import express from 'express';
import ReviewsController from './reviews.controller.js';
import { graphqlHTTP } from 'express-graphql';
import InstructorsController from './instructors.controller.js';
import ProjectsController from './projects.controller.js';
import CourseController from './course.controller.js';


const router = express.Router();

router.use("/review", graphqlHTTP({
    schema: ReviewsController.schema,
    graphiql: true
}));
router.use("/instructors", graphqlHTTP({
    schema: InstructorsController.schema,
    graphiql: true
}));
router.use("/projects", graphqlHTTP({
    schema: ProjectsController.schema,
    graphiql: true
}));

router.use("/course", graphqlHTTP({
    schema: CourseController.schema,
    graphiql: true
}));


export default router;