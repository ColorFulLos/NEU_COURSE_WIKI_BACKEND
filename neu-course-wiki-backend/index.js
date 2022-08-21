// connect up our database and data access objects and set up exception handling
import app from './server.js';
import mongodb from 'mongodb';
import dotenv from 'dotenv'; // used to read .env file
import ProjectsDAO from './dao/projectsDAO.js';
import InstructorsDAO from './dao/instructorsDAO.js';
import ReviewsDAO from './dao/reviewsDAO.js'
import CourseDAO from './dao/courseDAO.js'

async function main() {
    dotenv.config();
    const client = new mongodb.MongoClient(
        process.env.COURSEWIKI_DB_URI
    )
    const port =  process.env.PORT || 8000;

    try {
        // make connection
        await client.connect();

        // await MoviesDAO.injectDB(client); 
        await ReviewsDAO.injectDB(client);
        await InstructorsDAO.injectDB(client);
        await ProjectsDAO.injectDB(client);
        // await FavoritesDAO.injectDB(client);
        await CourseDAO.injectDB(client);


        app.listen(port, () => {
            console.log('Server is running on port: '+ port);
        })
    } catch (e) {
        console.error(e);
        process.exit(1); 
    }

}

main().catch(console.error);