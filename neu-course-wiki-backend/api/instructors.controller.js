import InstructorsDAO from '../dao/instructorsDAO.js';
import {GraphQLString, GraphQLList,
    GraphQLInputObjectType, GraphQLNonNull,
    GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLScalarType } from 'graphql';

export default class InstructorsController{

    static InstructorType = new GraphQLObjectType({
        name: "Instructor",
        fields: ()=>({
            _id:{type:GraphQLString},
            name: {type: GraphQLString},
            courses: {type: new GraphQLList(GraphQLString)},
        })
    });

    static InstructorInputType = new GraphQLInputObjectType({
        name: "InstructorInput",
        fields: {
            name: {type: GraphQLString},
            courses: {type: new GraphQLList(GraphQLString)},
        }
    });

    static InstructorUpdateInputType = new GraphQLInputObjectType({
        name: "InstructorUpdateInput",
        fields: {
            _id:{type:GraphQLString},
            name: {type: GraphQLString},
            courses: {type: new GraphQLList(GraphQLString)},
        }
    });

    static StatusResultType = new GraphQLObjectType({
        name: "StatusResult",
        fields: {
            status: {type: GraphQLInt},
            message: {type: GraphQLString},
            instructors: { type: new GraphQLList(this.InstructorType) }
        }
    })
    static schema = new GraphQLSchema({

        query: new GraphQLObjectType({
            name: 'Query',
            fields: {
                getAllInstrutors: {
                    type: this.StatusResultType,
                    resolve: (parent,context, info) => {
                        return this.apiGetAllInstructors();
                    }
                },
                getInstrutorsByCourseId: {
                    type: this.StatusResultType,
                    args:{
                        course_id:{type:GraphQLString},
                    },
                    resolve: (parent,args,context, info) => {
                        return this.apiGetInstructorByCourseId(args.course_id);
                    }
                }
            }
        }),
        
        mutation: new GraphQLObjectType({
            name: "Mutation",
            fields: {
                addInstructor: {
                    // return type for this mutation
                    type: this.StatusResultType,
                    args: {
                        input: {type: this.InstructorInputType}
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiPostInstructor(args.input);
                    }
                },
                updateInstructor: {
                    // return type for this mutation
                    type: this.StatusResultType,
                    args: {
                        input: { type: this.InstructorUpdateInputType }
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiUpdateInstructor(args.input);
                    }
                },

            }
        }) 
    })    

    static async apiPostInstructor(req){
        try{
            const name = req.name;
            const course = req.courses;
          
        const Response = await InstructorsDAO.addInstructor(
            name,
            course
        );
        var { error } = Response;
            if (error) {
                return {status: 500, message: "Error found: Unable to post instructor."};
            } else {
                return {status: 200, message: "success in posting instructor"};
            }

        } catch(e) {
            return {status: 500, message: `Error in preprocessing data: ${e.message}`};
        }
    }

    static async apiUpdateInstructor(input) {
        try {
            const course = input.courses;
            const name = input.name;
            const id = input._id;

            const Response = await InstructorsDAO.updateInstructor(
                id,
                name,
                course
                
            );
            var { error } = Response;
            console.log(error);
            if (error) {
                return { status: 500, message: "Error found: Unable to update instructor." };
            } else {
                return { status: 200, message: "success in updating instructor" };
            }
        } catch (e) {
            return {status: 500, message: `Error in preprocessing data: ${e.message}`};
        }
    }

    static async apiGetInstructorByCourseId(course_id) {
        try {
            let id = course_id || {}
            const response = await InstructorsDAO.getInstructorsByCourseId(id);
            let res;
            for (res in response){
                response[res]._id=String(response[res]._id)
          }
          
          return {
              status: 200, 
              message: "success in Get Instructor By Course Id",
              instructors: 
                  response
              
          };
        } catch (e) {
            return {status: 500, message: `Failed in api Get Instructors By Course Id: ${e.message}`};
        }
    }

    static async apiGetAllInstructors () {
        try {

            const response = await InstructorsDAO.getAllInstrutors();
            let res;
            for (res in response){
                  response[res]._id=String(response[res]._id)
            }
            console.log(response)
            return {
                status: 200, 
                message: "success in Get All Instructors",
                instructors: 
                    response
                
            };
        } catch (e) {
            return {status: 500, message: `Failed in api Get All Instructors: ${e.message}`};
        }
    }


}