let instructors;
import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId


export default class InstructorsDAO{

    static async injectDB(conn){
        if (instructors){
            return;
        }
        try{
            instructors = await conn.db(process.env.COURSEWIKI_NS).collection('instructors');
        }catch(e){
            console.error(`Unable to establish connection handle in instructorsDAO: ${e}`);
        }
    }

    static async addInstructor(name,course){
        try{
            const instructorDoc = {
                name: name,
                courses:course
            }
            return await instructors.insertOne(instructorDoc);
        }
        catch(e){
            console.error(`Unable to post instructor: ${e}`)
            return {error: e};
        }
    }

    static async updateInstructor(instructor_id, name, course) {
        try {
            const filter = {
                _id: ObjectId(instructor_id)
                
            }
            const courseDoc = {
                name: name,
                courses:course
            }
            return await instructors.updateOne(filter, { $set: courseDoc });
        }
        catch (e) {
            console.error(`Unable to update instructor: ${e}`)
            return { error: e };
        }
    }

    static async getAllInstrutors(){
        let cursor;
        try{
            cursor = await instructors.find();
            const response = await cursor.toArray();
            return response;
        }catch(e) {
            console.error(`Unable to get All Instrutors: ${e}`)
            return { error: e };
    }
    }

    static async getInstructorsByCourseId(course_id){
        let cursor;
        try{
            let filter;
            filter={'courses':{'$elemMatch':{$eq:course_id}}}
            cursor = await instructors.find(filter);
            const response = await cursor.toArray();
            return response;
        }catch(e) {
            console.error(`Unable to get Instructors By CourseId ${course_id}: ${e}`)
            return { error: e };
    }
}
}
