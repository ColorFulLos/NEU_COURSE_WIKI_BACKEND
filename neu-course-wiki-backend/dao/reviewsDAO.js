import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let reviews;

export default class ReviewsDAO {

    static async injectDB(conn) {
        if (reviews) {
            return;
        }
        try {
            reviews = await conn.db(process.env.COURSEWIKI_NS).collection('reviews');
        } catch (e) {
            console.error(`Unable to establish connection handle in reviewsDA: ${e}`);
        }
    }

    static async addReview(course_id, user_id, content, creationDate, 
        rating_difficultiness, rating_usefulness, semester, instructor, isRecommended, upVotes, downVotes) {
            try {
                const reviewDoc = {course_id, user_id, content, creationDate, 
                    rating_difficultiness, rating_usefulness, semester, instructor, isRecommended, upVotes, downVotes}

                return await reviews.insertOne(reviewDoc);
            } catch(e) {
                console.error(`Unable to add review in DAO: ${e}`);
                return { error: e};
            }
    }

    static async updateReviewVotes(review_id, upVotes, downVotes) {
        try {
            return await reviews.updateOne(
                {_id: ObjectId(review_id)},
                {$set : {upVotes: upVotes, downVotes: downVotes}}
            );
        } catch(e) {
            console.error(`Unable to update review in DAO: ${e}`);
            return { error: e};
        }
    }

    // Only the author of the review can delete the review
    static async deleteReview( review_id,user_id) {
        try {
            return await reviews.deleteOne(
                {
                    _id: ObjectId(review_id),
                    user_id: user_id
                }
            );

        } catch(e) {
            console.error(`Unable to delete review in DAO: ${e}`);
            return { error: e};
        }
    }

    static async getReviewByFilter(filterNameArray, filterValArray, moviesPerPage, currentPage) {
        let cursor;
        let query = {};
        for (let i = 0; i < filterNameArray.length; i++) {
            const filterName = filterNameArray[i];
            const filterVal = filterValArray[i];
            query[filterName] = filterVal;
        }
        try {
            
            cursor = await reviews.find(query).sort({creationDate: -1}).limit(moviesPerPage)
                                    .skip(moviesPerPage * currentPage);
            const reviewsList = await cursor.toArray();
            reviewsList.forEach((review) => {
                review.creationDate = review.creationDate.toLocaleDateString();
            })
            const numReviews = await reviews.countDocuments(query);
            
            return {reviewsList, numReviews};
        } catch(e) {
            console.error(`Unable to get review by ${filterNameArray} in DAO: ${e}`);
            return { error: e};
        }
    }

    //course_id, user_id, semester, instructor
    static async getReviewsByCourse({
        course_id, moviesPerPage = 10, currentPage = 0
    }) {
        const filtersName = ["course_id"];
        const filtersVal = [course_id];
        return this.getReviewByFilter(filtersName, filtersVal, moviesPerPage, currentPage);
    }

    static async getReviewsByUser({
        user_id, moviesPerPage = 10, currentPage = 0
    }) {
        const filtersName = ["user_id"];
        const filtersVal = [user_id];
        return this.getReviewByFilter(filtersName, filtersVal, moviesPerPage, currentPage);

    }

    static async getReviewsBySemester({
        course_id, semester, moviesPerPage = 10, currentPage = 0
    }) {
        const filtersName = ["course_id", "semester"];
        const filtersVal = [course_id, semester];
        return this.getReviewByFilter(filtersName, filtersVal, moviesPerPage, currentPage);

    }

    static async getReviewsByInstructor({
        course_id, instructor, moviesPerPage = 10, currentPage = 0
    }) {

        const filtersName = ["course_id", "instructor"];
        const filtersVal = [course_id, instructor];
        return this.getReviewByFilter(filtersName, filtersVal, moviesPerPage, currentPage);

    }
}