import CourseDAO from "../dao/courseDAO.js";
import {
    GraphQLString, GraphQLInputObjectType, GraphQLNonNull,
    GraphQLSchema, GraphQLObjectType, GraphQLInt
} from 'graphql';


export default class CourseController {

    static CourseInputType = new GraphQLInputObjectType({
        name: "CourseInput",
        fields: {
            course_id: { type: GraphQLString },
            name: { type: GraphQLString },
            introduction: { type: GraphQLString },
            timeline: { type: GraphQLString }
        }
    });

    // database variable name
    static CourseType = new GraphQLObjectType({
        name: "Course",
        fields: {
            course_id: { type: GraphQLString },
            name: { type: GraphQLString },
            introduction: { type: GraphQLString },
            timeline: { type: GraphQLString }
        }
    });


    static StatusResultType = new GraphQLObjectType({
        name: "StatusResult",
        fields: {
            status: { type: GraphQLInt },
            message: { type: GraphQLString },
            course: { type: this.CourseType }
        }
    })

    static schema = new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: {
                getCourseById: {
                    type: this.StatusResultType,
                    args: {
                        course_id: { type: GraphQLString },
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiGetCourseById(args.course_id);
                    }
                }
            }
        }),
        mutation: new GraphQLObjectType({
            name: "Mutation",
            fields: {
                addCourse: {
                    // return type for this mutation
                    type: this.StatusResultType,
                    args: {
                        input: { type: this.CourseInputType }
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiPostCourse(args.input);
                    }
                },
                updateCourse: {
                    // return type for this mutation
                    type: this.StatusResultType,
                    args: {
                        input: { type: this.CourseInputType }
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiUpdateCourse(args.input);
                    }
                },
                deleteCourse: {
                    type: this.StatusResultType,
                    args: {
                        course_id: { type: new GraphQLNonNull(GraphQLString) },
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiDeleteCourse(args.course_id);
                    }
                }
            }
        })
    })
    static async apiPostCourse(input) {
        try {
            const courseId = input.course_id;
            const name = input.name;
            const introduction = input.introduction;
            const timeline = input.timeline;

            const courseResponse = await CourseDAO.addCourse(
                courseId,
                name,
                introduction,
                timeline
            );

            var { error } = courseResponse;
            console.log(error);
            if (error) {
                return { status: 500, message: "Error found: Unable to post course." };
            } else {
                return { status: 200, message: "success in posting course" };
            }
        } catch (e) {
            return { status: 500, message: `Error in preprocessing data: ${e.message}` };
        }
    }

    static async apiUpdateCourse(input) {
        try {
            const courseId = input.course_id;
            const newName = input.name;
            const newIntroduction = input.introduction;
            const newTimeline = input.timeline;

            const courseResponse = await CourseDAO.updateCourse(
                courseId,
                newName,
                newIntroduction,
                newTimeline
            );

            var { error } = courseResponse;
            console.log(error);
            if (error) {
                return { status: 500, message: "Error found: Unable to update course." };
            } else {
                return { status: 200, message: "success in updating course" };
            }
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async apiDeleteCourse(course_id) {
        try {
            const deletedCourse = await CourseDAO.deleteCourse(
                course_id
            )
            var { deletedCount } = deletedCourse;

            if (deletedCount != 1) {
                return { status: 500, message: "Error found: Unable to delete course." };
            } else {
                return { status: 200, message: "success in deleting course" };
            }
        } catch (e) {
            return { status: 500, message: `Failed in apiDeleteCourse: ${e.message}` };
        }
    }

    static async apiGetCourseById(course_id) {
        try {
            let id = course_id || {}
            let course = await CourseDAO.getCourseById(id);

            return {
                status: 200,
                message: "sucess in getting course by course id",
                course: {
                    course_id: course.course_id,
                    name: course.name,
                    introduction: course.introduction,
                    timeline: course.timeline
                }
            };
        } catch (e) {
            return { status: 500, message: `Failed in apiGetCourseById: ${e.message}` };
        }
    }
}