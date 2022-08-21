let projects;

export default class ProjectsDAO {

    static async injectDB(conn){
        if (projects){
            return;
        }
        try{
            projects = await conn.db(process.env.COURSEWIKI_NS).collection('projects');
        }catch(e){
            console.error(`Unable to establish connection handle in projectsDAO: ${e}`);
        }
    }

    static async addProjects(course_id,semester,instructor,description,link){
        try{
            const projectDoc = {
                course_id:course_id,
                semester:semester,
                instructor:instructor,
                description:description,
                link:link
            }
            return await projects.insertOne(projectDoc);
        }
        catch(e){
            console.error(`Unable to post project: ${e}`)
            return {error: e};
        }
    }

    static async getProjectsByCourseId(course_id) {
        let cursor;
        try{
            cursor = await projects.find({
                course_id:course_id
            });
            const result = await cursor.toArray();
            return result;
        }catch(e){
            console.error(`Something went wrong in getProjectsByCourseId: ${e}`);
            throw e;
        }
    }

    static async getProjectsByInstructor(course_id,instructor) {
        let cursor;
        try{
            cursor = await projects.find({
                course_id:course_id,
                instructor:instructor
            });
            const result = await cursor.toArray();
            return result;
        }catch(e){
            console.error(`Something went wrong in getProjectsByInstructor: ${e}`);
            throw e;
        }
    }

    static async getProjectsBySemester(course_id,semester) {
        let cursor;
        try{
            cursor = await projects.find({
                course_id:course_id,
                semester:semester
            });
            const result = await cursor.toArray();
            return result;
        }catch(e){
            console.error(`Something went wrong in getProjectsBySemester: ${e}`);
            throw e;
        }
    }
}