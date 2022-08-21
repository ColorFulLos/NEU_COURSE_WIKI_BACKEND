import ProjectsDAO from '../dao/projectsDAO.js';
import { GraphQLBoolean, 
    GraphQLString, GraphQLList,
    GraphQLInputObjectType, GraphQLNonNull,
    GraphQLSchema, GraphQLObjectType, GraphQLInt } from 'graphql';

export default class ProjectsController{

    static ProjectsType = new GraphQLObjectType({
        name: "Project",
        fields: {
            course_id: {type: GraphQLString},
            semester: {type: GraphQLString},
            instructor: {type: GraphQLString},
            description: {type: GraphQLString},
            link: {type: GraphQLString}
        }
    });

    static InputprojectsType = new GraphQLInputObjectType({
        name: "ProjectInput",
        fields: {
            course_id: {type: GraphQLString},
            semester: {type: GraphQLString},
            instructor: {type: GraphQLString},
            description: {type: GraphQLString},
            link: {type: GraphQLString}
        }
    });


    static StatusResultType = new GraphQLObjectType({
        name: "StatusResult",
        fields: {
            status: {type: GraphQLInt},
            message: {type: GraphQLString},
            projects: {type: new GraphQLList(this.ProjectsType)}
        }
    })

    static schema = new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: {

                getProjectsByCourseId: {
                type: this.StatusResultType,
                args: {
                    course_id: {type: GraphQLString},
                },
                resolve: (parent, args, context, info) => {
                    return this.apiGetProjectsByCourseId(args.course_id);
                }
              },
              getProjectsBySemester: {
                type: this.StatusResultType,
                args: {
                    course_id: {type: GraphQLString},
                    semester: {type: GraphQLString}
                },
                resolve: (parent, args, context, info) => {
                    return this.apiGetProjectsBySemester(args.course_id,args.semester);
                }
              },
              getProjectsByInstructor: {
                type: this.StatusResultType,
                args: {
                    course_id: {type: GraphQLString},
                    instructor: {type: GraphQLString}
                },
                resolve: (parent, args, context, info) => {
                    return this.apiGetProjectsByInstructor(args.course_id,args.instructor);
                }
              }
            }
          }),
        mutation: new GraphQLObjectType({
            name: "Mutation",
            fields: {
                addProject: {
                    // return type for this mutation
                    type: this.StatusResultType,
                    args: {
                        input: {type: this.InputprojectsType}
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiPostProjects(args.input);
                    }
                }
            }
        }) 
    }) 

    static async apiPostProjects(req){
        try{

           const ProjectsResponse = await ProjectsDAO.addProjects(
                req.course_id,
                req.semester,
                req.instructor,
                req.description,
                req.link
            )

            var { error } = ProjectsResponse;
            if (error) {
                return {status: 500, message: "Error found: Unable to post projects."};
            } else {
                return {status: 200, message: "success in posting projects"};
            }
        }catch(e) {
            return {status: 500, message: `Error in preprocessing data: ${e.message}`};
        }

    }

    static async apiGetProjectsByCourseId(id){
        try{
            let result = await ProjectsDAO.getProjectsByCourseId(id);
            console.log(result)
            return {
                status: 200, 
                message: "success in getting projects by course Id",
                projects: 
                    result
                };
        }catch(e){
            return {status: 500, message: `Failed in apiGetProjectsByCourseId: ${e.message}`};
        }

    }

    static async apiGetProjectsBySemester(id,semester){
        try{
            let result = await ProjectsDAO.getProjectsBySemester(id,semester);
            return {
                status: 200, 
                message: "success in getting projects by semester",
                projects:result
            };
        }catch(e){
            return {status: 500, message: `Failed in apiGetProjectsBySemester: ${e.message}`};
        }

    }

    static async apiGetProjectsByInstructor(id,instructor){
        try{
            let result = await ProjectsDAO.getProjectsByInstructor(id,instructor);
          console.log(result)
            return {
                status: 200, 
                message: "success in getting projects by instructor",
                projects: result
                
            };
        }catch(e){
            return {status: 500, message: `Failed in apiGetProjectsByInstructor: ${e.message}`};
        }

    }
}