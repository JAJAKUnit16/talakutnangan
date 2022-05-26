# Talakutnangan
A capstone project aim to create a consultation chat platform for MCC.

## Installation

### Prerequisites
- [Node.js and NPM]. LTS version is recommended
- [Docker]

### General Development Instruction
1. Run `npm install`
2. Copy *.env.example* file as *.env* to *root*. Values may change according to your chosen
   database.
3. Choose the database to be used:
   - SQLite (using memory) [fastest to set]
     - Change the `DATABASE_TYPE` variable in your *.env* to `memoried_sqlite`
   - SQLite (using SQL file)
     - Change the `DATABASE_TYPE` variable in your *.env* to `filed_sqlite`
     - Create an empty file named *sqlite.sql* in *database*
     - Change the `DATABASE_PATH` variable in your *.env* to `database/sqlite.sql`
   - MySQL (container)
     - Change the `DATABASE_TYPE` variable in your *.env* to `mysql`
     - Run `docker-compose up -d --build`
       - It will run too long for the first build only. Subsequent builds will be fast. This will
         create the database server.
     - **Note**: Re-run `docker-compose up -d --build` every time you change one of the following variables in your *.env*:
       - `DATABASE_PASSWORD`
       - `DATABASE_PORT`
       - `DATABASE_NAME`
   - PostgreSQL (deployment) [slowest to set]
     - Change the `DATABASE_TYPE` variable in your *.env* to `pgsql`
     - Change the `DATABASE_URL` variable in your *.env* to URL provided by your host
4. Run `npm run dev`
5. Visit http://localhost:16000

### Contributors
- Angelo Magtoto
- Jarlem Red De Peralta
- Kenneth Trecy Tobias

[Node.js and NPM]: https://nodejs.org/en/
[Docker]: https://www.docker.com/get-started/

## Conventional Commits

The purpose of this documentation is to guide collaborators of this project on commiting according to the type of change.

### Primary types
* feat:
- This commit focuses on the project's enhancement by implementing a new feature

* fix:
- This focuses on debugging and solving problems in features.

* test:
- This focuses on any kinds of test scripts.

* config:
- This focuses on changes in the configuration files of the project.

* docs:
- this focuses on additions or changes in any of the documentation files.

* chore:
- Any other commits that are still uncategorized falls into this commit.

### Scoped types
If a commit type has multiple types, it is possible to nest it under a primary type. For instance, a "Test" commit can be classified as either unit or integration. To further specify the type of commit, one can use "fix(unit):" or "fix(integration):"

### Guidelines
When specifying scopes, complete spelling of the type is a must.
