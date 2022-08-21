import ReviewsDAO from "../dao/reviewsDAO.js";
import { GraphQLBoolean, 
    GraphQLString, GraphQLList,
    GraphQLInputObjectType, GraphQLNonNull,
    GraphQLSchema, GraphQLObjectType, GraphQLInt } from 'graphql';


export default class ReviewsController {
    
    static ReviewInputType = new GraphQLInputObjectType({
        name: "ReviewInput",
        fields: {
            course_id: {type: GraphQLString},
            user_id: {type: GraphQLString},
            content: {type: GraphQLString},
            difficultiness: {type: GraphQLInt}, 
            usefulness: {type: GraphQLInt},
            semester: {type: GraphQLString},
            instructor: {type: GraphQLString},
            isRecommended: {type: GraphQLInt}
        }
    });

    // database variable name
    static ReviewType = new GraphQLObjectType({
        name: "Review",
        fields: {
            course_id: {type: GraphQLString},
            user_id: {type: GraphQLString},
            content: {type: GraphQLString},
            creationDate: {type: GraphQLString},
            rating_difficultiness: {type: GraphQLInt}, 
            rating_usefulness: {type: GraphQLInt},
            semester: {type: GraphQLString},
            instructor: {type: GraphQLString},
            isRecommended: {type: GraphQLBoolean},
            upVotes: {type: GraphQLInt},
            downVotes: {type: GraphQLInt}
        }
    });

    static ReviewResultType = new GraphQLObjectType({
        name:"ReviewResult",
        fields: {
            reviewsList: {type: new GraphQLList(this.ReviewType)},
            totalReviews: {type: GraphQLInt}
        }
    });
    static StatusResultType = new GraphQLObjectType({
        name: "StatusResult",
        fields: {
            status: {type: GraphQLInt},
            message: {type: GraphQLString},
            reviews: {type: this.ReviewResultType}
        }
    })

    static schema = new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: {
              getReviewsByCourse: {
                type: this.StatusResultType,
                args: {
                    course_id: {type: GraphQLString},
                    moviesPerPage: {type: GraphQLInt},
                    currentPage: {type: GraphQLInt}
                },
                resolve: (parent, args, context, info) => {
                    return this.apiGetReviewByCourse(args.course_id, args.moviesPerPage, args.currentPage);
                }
              },
              getReviewsByUser: {
                type: this.StatusResultType,
                args: {
                    user_id: {type: GraphQLString},
                    moviesPerPage: {type: GraphQLInt},
                    currentPage: {type: GraphQLInt}
                },
                resolve: (parent, args, context, info) => {
                    return this.apiGetReviewByUser(args.user_id, args.moviesPerPage, args.currentPage);
                }
              },
              // By course first, then by instructor
              getReviewsByInstructor: {
                type: this.StatusResultType,
                args: {
                    course_id: {type: GraphQLString},
                    instructor: {type: GraphQLString},
                    moviesPerPage: {type: GraphQLInt},
                    currentPage: {type: GraphQLInt}
                },
                resolve: (parent, args, context, info) => {
                    return this.apiGetReviewByInstructor(args.course_id, args.instructor, args.moviesPerPage, args.currentPage);
                }
              },
              getReviewsBySemester: {
                type: this.StatusResultType,
                args: {
                    course_id: {type: GraphQLString},
                    semester: {type: GraphQLString},
                    moviesPerPage: {type: GraphQLInt},
                    currentPage: {type: GraphQLInt}
                },
                resolve: (parent, args, context, info) => {
                    return this.apiGetReviewBySemester(args.course_id, args.semester, args.moviesPerPage, args.currentPage);
                }
              }
            }
          }),
        mutation: new GraphQLObjectType({
            name: "Mutation",
            fields: {
                addReview: {
                    // return type for this mutation
                    type: this.StatusResultType,
                    args: {
                        input: {type: this.ReviewInputType}
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiPostReview(args.input);
                    }
                },
                updateReviewVotes: {
                    type: this.StatusResultType,
                    args: {
                        review_id: {type : new GraphQLNonNull(GraphQLString)},
                        upVotes: {type: GraphQLInt},
                        downVotes: {type: GraphQLInt}
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiUpdateReviewVotes(args.review_id, args.upVotes, args.downVotes);
                    }
                },
                deleteReview: {
                    type: this.StatusResultType,
                    args: {
                        user_id: {type : new GraphQLNonNull(GraphQLString)},
                        review_id: {type : new GraphQLNonNull(GraphQLString)}
                    },
                    resolve: (parent, args, context, info) => {
                        return this.apiDeleteReview(args.user_id, args.review_id);
                    }
                }
            }
        }) 
    })    

    static async apiPostReview(input) {
        try {
            // preprocessing data from variables
            const course_id = input.course_id;
            const user_id = input.user_id;
            const content = input.content;
            const date = new Date();
            const difficultiness = input.difficultiness;
            const usefulness = input.usefulness;
            const semester = input.semester;
            const instructor = input.instructor;
            const isRecommended = input.isRecommended == 0? false: true;
            const upVotes = 0;
            const downVotes = 0;

            const reviewResponse = await ReviewsDAO.addReview(
                course_id, 
                user_id, 
                content, 
                date, 
                difficultiness, 
                usefulness, 
                semester, 
                instructor, 
                isRecommended,
                upVotes,
                downVotes
            )

            var { error } = reviewResponse;
            if (error) {
                return {status: 500, message: "Error found: Unable to post review."};
            } else {
                return {status: 200, message: "success in posting review"};
            }

        } catch(e) {
            return {status: 500, message: `Error in preprocessing data: ${e.message}`};
        }
    }

    static async apiUpdateReviewVotes(review_id, upVotes, downVotes) {
        try {
            const modifiedReview = await ReviewsDAO.updateReviewVotes(
                review_id, 
                upVotes,
                downVotes
            )

            var { modifiedCount } = modifiedReview;

            if (modifiedCount != 1) {
                return {status: 500, message: "Error found: Unable to update review."};
            } else {
                return {status: 200, message: "success in updating review"};
            }
        } catch(e) {
            return {status: 500, message: `Failed in apiUpdateReviewVotes: ${e.message}`};
        }
    }

    static async apiDeleteReview(user_id, review_id) {
        try {
            const deletedReview = await ReviewsDAO.deleteReview(
                review_id,
                user_id
            )
            var { deletedCount } = deletedReview;

            if (deletedCount != 1) {
                return {status: 500, message: "Error found: Unable to delete review."};
            } else {
                return {status: 200, message: "success in deleting review"};
            }
            
        }  catch(e) {
            return {status: 500, message: `Failed in apiDeleteReview: ${e.message}`};
        }
    }

    static async apiGetReviewByCourse(course_id, moviesPerPage, currentPage) {
        try {

            const { reviewsList, numReviews } = await ReviewsDAO.getReviewsByCourse({ 
                course_id, moviesPerPage, currentPage
             });
             return {
                status: 200, 
                message: "sucess in getting review by course",
                reviews: {
                    reviewsList, 
                    numReviews
                }
            };
        } catch(e) {
            return {status: 500, message: `Failed in apiGetReviewByCourse: ${e.message}`};
        }
    }

    static async apiGetReviewByUser(user_id, moviesPerPage, currentPage) {
        try {

            const { reviewsList, numReviews } = await ReviewsDAO.getReviewsByUser({ 
                user_id, moviesPerPage, currentPage
             });
             return {
                status: 200, 
                message: "sucess in getting review by user",
                reviews: {
                    reviewsList, 
                    numReviews
                }
            };
        } catch(e) {
            return {status: 500, message: `Failed in apiGetReviewByUser: ${e.message}`};
        }
    }

    static async apiGetReviewBySemester(course_id, semester, moviesPerPage, currentPage) {
        try {

            const { reviewsList, numReviews } = await ReviewsDAO.getReviewsBySemester({ 
                course_id, semester, moviesPerPage, currentPage
             });
             return {
                status: 200, 
                message: "sucess in getting review by semester",
                reviews: {
                    reviewsList, 
                    numReviews
                }
            };
        } catch(e) {
            return {status: 500, message: `Failed in apiGetReviewBySemester: ${e.message}`};
        }
    }

    static async apiGetReviewByInstructor(course_id, instructor, moviesPerPage, currentPage) {
        try {
            const { reviewsList, numReviews } = await ReviewsDAO.getReviewsByInstructor({ 
                course_id, instructor, moviesPerPage, currentPage
             });
             return {
                status: 200, 
                message: "sucess in getting review by instructor",
                reviews: {
                    reviewsList, 
                    numReviews
                }
            };
        } catch(e) {
            return {status: 500, message: `Failed in apiGetReviewByInstructor: ${e.message}`};
        }
    }
}