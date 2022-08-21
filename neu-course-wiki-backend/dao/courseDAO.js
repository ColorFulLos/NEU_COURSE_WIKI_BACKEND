// import mongodb from "mongodb";

let course;

export default class CourseDAO {
    static async injectDB(conn) {
        if (course) {
            return;
        }
        try {
            course = await conn.db(process.env.COURSEWIKI_NS).collection('courses');
        } catch (e) {
            console.error(`Unable to establish connection handle in reviewsDA: ${e}`);
        }
    }

    static async addCourse(course_id, name, introduction, timeline) {
        try {
            const courseDoc = {
                course_id: course_id,
                name: name,
                introduction: introduction,
                timeline: timeline
            }
            return await course.insertOne(courseDoc);
        } catch (e) {
            console.error(`Unable to add course in DAO: ${e}`);
            return { error: e };
        }
    }

    static async updateCourse(course_id, name, introduction, timeline) {
        try {
            const filter = {
                course_id: course_id,
            }
            const courseDoc = {
                course_id: course_id,
                name: name,
                introduction: introduction,
                timeline: timeline
            }
            let res = await course.updateOne(filter, { $set: courseDoc });
            if (res.modifiedCount === 0) {
                throw new Error('Cannot find course!')
            }
            return res;
        }
        catch (e) {
            console.error(`Unable to update course: ${e}`)
            return { error: e };
        }
    }

    static async deleteCourse(course_id) {
        try {
            return await course.deleteOne(
                {
                    course_id: course_id,
                }
            );

        } catch (e) {
            console.error(`Unable to delete course in DAO: ${e}`);
            return { error: e };
        }
    }

    static async getCourseById(course_id) {
        try {
            console.log(course_id);
            return await course.aggregate([
                {
                    $match: {
                        course_id: course_id,
                    }
                },
                {
                    $lookup: {
                        from: 'course',
                        localField: 'course_id',
                        foreignField: 'course_id',
                        as: 'course',
                    }
                }
            ]).next();
        } catch (e) {
            console.error(`Something went wrong in getCourseById: ${e}`);
            throw e;
        }
    }
}