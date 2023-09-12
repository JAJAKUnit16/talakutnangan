# Talakutnangan
A capstone project aim to create a consultation chat platform for MCC.

## Publication Notes
Initially, this repository was developed from lemredd/talakutnangan. For better collaboration
experience among capstone members, the development was resumed in this repository.

This repository is only for educational purposes. Most commits from the authors are signed with
GPG keys for proof of integrity. The authors permit resumption of the development history in hopes
to improve the current state of the system.

## Keywords
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT",
"RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as
described in [BCP 14] \[[RFC2119]\] \[[RFC8174]\] when, and only when, they appear in all capitals,
as shown here.

## Installation

### Prerequisites
- [Node.js and NPM]. LTS version is recommended
- [Docker]
- [DB Browser for SQLite] if `filed_sqlite` is preferred.
- [PostgreSQL]. [v14.3] is recommended.
- [Python v3 or higher].
- [Visual Studio Build Tools (v2017 or higher)] with desktop development with C++

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
     - **Note**: Re-run `docker-compose up -d --build` every time you change one of the following
       variables in your *.env*:
       - `DATABASE_PASSWORD`
       - `DATABASE_PORT`
       - `DATABASE_NAME`
   - PostgreSQL (local)
     - Change the `DATABASE_TYPE` variable in your *.env* to `pgsql`
     - Download the [installer] for the latest version.
     - Install and just click next. You may customize the installation and data directory. Stack
       Builder is not required. Default port should be 5432. Remember your password. If you want to
       use the password the same as to the example, use *root* password.
     - Wait for the installation to complete.
     - Search using keyword *pgAdmin 4* and run the matched application. Its purpose is similar to MySQL
       workbench and MongoDB Compass. This may be needed for troubleshooting.
   - PostgreSQL (deployment) [slowest to set]
     - Change the `DATABASE_TYPE` variable in your *.env* to `pgsql`
     - Change the `DATABASE_URL` variable in your *.env* to URL provided by your host
4. Run `./execute -database -initialize` if it is the database server is newly installed; and chosen
   database is `mysql` or `pgsql` or `./execute -database -upgrade` (if there are no breaking
   changes in database migrations) or `./execute -database -reset` (if there are breaking changes in
   database migrations).
5. Run `npm run seed:up:all` (if there are no breaking changes in database migrations) or `npm run
   seed:redo:all` (if there are breaking changes in database migrations).
6. Set the empty email variables. They may vary depending on per team.
   - `EMAIL_USER`. This e-mail address will be used to log in to the SMTP server and will be the
     sender of e-mail messages in the app (i.e. e-mail verification).
   - `EMAIL_PASS`. This is the password of e-mail address above and will be used to log in to the
     SMTP server. It is recommended to use an app password.
7. Run `npm run dev`
8. Visit http://localhost:16000

## Conventional Commits
Visit [this detailed instructions](./dx/CONVENTIONAL_COMMITS.md) for more details

## Development
Visit [this detailed instructions](./dx/DEVELOPMENT.md) for more details

## Notes

### Contributors
- Angelo Magtoto
- Ardrin Gregorio
- Jarlem Red De Peralta
- John Jerome Pertez
- Kenneth Trecy Tobias

[BCP 14]: https://www.rfc-editor.org/info/bcp14
[RFC2119]: https://datatracker.ietf.org/doc/html/rfc2119
[RFC8174]: https://datatracker.ietf.org/doc/html/rfc8174
[Node.js and NPM]: https://nodejs.org/en/
[Docker]: https://www.docker.com/get-started/
[DB Browser for SQLite]: https://www.w.co
[PostgreSQL]: https://www.postgresql.org/download/windows/
[v14.3]: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
[Python v3 or higher]: https://www.python.org/downloads/
[Visual Studio Build Tools (v2017 or higher)]: https://visualstudio.microsoft.com/downloads/
[installer]: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
