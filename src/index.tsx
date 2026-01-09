import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const db = new Database("data.db");
db.run(
    "CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, message TEXT)",
);

const app = new Hono();
app.use("/assets/*", serveStatic({}));

app.use("*", async (c, next) => {
    c.setRenderer((content) => {
        return c.html(
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                    />
                    <meta name="color-scheme" content="light dark" />
                    <link rel="stylesheet" href="/assets/pico.classless.css" />
                    <title>DevSecOps project test</title>
                </head>
                <body>{content}</body>
            </html>,
        );
    });
    await next();
});

app.post("/posts", async (c) => {
    const body = await c.req.formData();
    const message = body.get("message");

    if (!message || typeof message !== "string") {
        return c.json({ error: "Empty message is not allowed" }, 400);
    }

    db.run("INSERT INTO posts (message) VALUES (?)", [message]);

    return c.redirect("/");
});

app.get("/", (c) => {
    const posts = db.query("SELECT * FROM posts").all() as {
        id: number;
        message: string;
    }[];
    return c.render(
        <main class="container">
            <h1>Hello, Advanced Networking class!!!!!</h1>
            <p>
                This is a <b>working</b> test page to demonstrate DevSecOps
                functionality with Jenkins, Semgrep and OWASP ZAP!
            </p>
            <h2>Posts</h2>
            <ol>
                {posts.map((post) => (
                    <li>{post.message}</li>
                ))}
            </ol>
            <form method="post" action="/posts">
                <fieldset role="group">
                    <input
                        type="text"
                        name="message"
                        placeholder="Write something..."
                        required
                    />
                    <button type="submit">Post</button>
                </fieldset>
            </form>
        </main>,
    );
});

export default app;
