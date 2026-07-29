/* About Page should include:
    1. What is this website and what can I do with it?
    2. only appear if user is logged out
    3. provide list of top 10 movies in theaters
    4. list of top movies of all time
    5. sample (real) user (atm: IMDB) reviews
*/

import { useEffect, useState } from "react";
import "../css/index.css";

console.log("About Page");

export default function AboutPage() {
    console.log("About Page export");

    return (
        <>
            <h1>About Us!</h1>
            <section className="about-site" role="alert">
                <h2 className="h4 alert-heading">We are an online space for you to log your watched movies, look for recommendations, and search for movies.</h2>
                <div>
                    
                    <p className="mb-0">
                    </p>
                </div>
            </section>
        </>
    );
}