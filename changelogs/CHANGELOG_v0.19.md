# Changelog

## v0.19.0

### 🚀 Enhancements
- **consultation:** Allow selectable days (6a7b9ba8)
- **chat message activity:** Delete consultation if consultant (43e390f5)
- **consultation:** Limit selectable times (a69ebe2f)
- **consultation:** Disable button on condition (7bb4f22b)
- **consultation:** Preview dates in available day (32f35c00)
- **consultation:** Submit with proper date (806f0edd)
- **consultation:** Limit custom date range (72a5df72)
- **consultation:** Ensure date is within employee schedule (1e978307)
- **consultation:** Ensure role selection (6db228a8)
- **consultation:** Ensure consultation to create have bound schedule (a0e78d56)
- **consultation:** Give picture owner title (88f78579)
- **consultation:** Make list on left togglable (383e9f3f)
- **consultation:** Make button working (0ed1a072)

### 🩹 Fixes
- **model:** Correct the model of parent comment (06332680)
- **query:** Fix the path to query for comment (3b2ecc2d)
- **role:** Remove the access to data (941a2e8c)
- **role:** Explicitly set the `deletedAt` attribute (17d7655e)
- **factory:** Ensure minimum schedule end does not overlap (b4c23677)
- **front-end:** Correct first hour format (f5b106c8)
- **front-end:** Ensure proper 24 hour generation (ecfb1982)
- **consultation:** Fetch schedules on condition (eeca3930)
- **consultation:** Limit to 30 days (0d14c665)
- **server:** Lower minimum kind constraint (69488372)
- **consultation:** Listen on dynamic namespaces (9396edd2)
- **server:** Emit all received data (d67082f8)
- **consultation:** Listen on dynamic namespaces (2a37778a)
- **consultation:** Use `calc` (b0a20ba7)
- **consultation:** Accept null value (623a22e3)
- **consultation:** Use same value for properties (0771bfde)
- **consultation:** Use body classes external (03537723)
- **user:** Allow user with default password to update the password (c163db3b)
- **command:** Correct the units used for duration (d5d86b21)
- **post:** Use correct permissions to create a post (1641b6de)
- **post:** Use correct permissions to update a post (73877ea7)
- **server:** Sort by `index.get.ts` (b802aac5)

### 💅 Refactors
- **role:** Use switch to toggle confirmation (806786ee)
- **role:** Loop the selector flags (e910eb5d)
- **role:** Separate the creation of flag selector information (9f916a4b)
- **role:** Access model directly instead of proxy (f9a44ffe)
- **role:** Loop the flag selectors to create (79781bc7)
- **post:** Separate draft form (54a95630)
- **front-end:** Simplify time generation (a548610e)
- **consultation:** Separate the states of consultation (81c4702e)
- **component:** Make search state into toggle (d951220d)

### 🏡 Chore
- Rename imports (5fbe1113)
- Rearrange and remove unused imports (2d22171e)
- Rename data properly (b1086325)
- **consultation:** Add styling todos (c8f8d77f)
- Shorten function exposure (a32d1d93)
- **front-end:** ⚠️  Deprecate some class togglers (956afec1)
- **debug:** Alert on error (a690c178)
- **lint:** Apply lint rules (78a8b281)
- **lint:** Apply some lint rules (cc91e57c)
- Correct misspell (ad3db9b5)

### ✅ Tests
- **factory:** Make factory for comments (0fb64fda)
- **factory:** Add method to modify the password (b34c1049)
- **factory:** Make factory for post attachment (802860e1)
- **factory:** Add method to customize file type (4572c6f7)

### 🌊 Types
- **share:** Make document types for comment (65b242b0)
- **share:** Add rule constraint for checking within schedules (4279f481)
- **server:** ⚠️  Rename some constraint type (b852c834)
- **share:** ⚠️  Make property optional (5b2d4d85)
- **server:** Separate the authentication options (da414d9d)
- **server:** Make advance authentication options (39436db5)
- **share:** Add property to get posts (7c6b4555)
- **share:** Integrate department resource (29bb7b81)
- **share:** Make document type for post attachments (a6407ebd)
- **share:** Link post attachments to post (7b5c8c46)
- **back-end:** Make type for raw post attachment (777dbd01)

### 🎨 Styles
- **button:** Add styles for disabled variant (6251943e)
- **consultation:** Add some styles (93b0598a)
- **consultation:** Style the text box (480e1bc0)
- **consultation:** Reorganize stylings (1de0c6bd)
- **page shell:** Make the dropdown relative (dc2afbd9)
- **page shell:** Put some styles to dropdown (e463ca0e)
- **consultation:** Ensure to cover all contents (64b51146)
- **consultation:** Unset some of properties (7ee3aad1)
- **consultation:** Remove some unncessary styles (c2a52ed6)
- **consultation:** Dedicate showing of dropdown (a9c954f8)
- **consultation:** Apply third-party CSS styles (86ac8450)
- Use `@apply` directive (dd6fde09)
- **consultation:** Adjust some styles (07017bc5)
- **consultation:** Adjust some styles (81ab879d)
- **consultation:** Add dark mode styles (20c01535)

### 🤖 CI
- Set the timezone for time-sensitive tests (bb8e52fb)
- Increase the timeout minutes of back-end unit tests (ead8a118)

### 👓 Reformed Templates
- **consultation:** Make warning about no schedule (24cd8ac8)
- **consultation:** Move some elements (a0dc8886)
- **consultation:** Move to `list` component (27f179cc)
- **consultation:** Re-design chat entry UI (37f18c71)
- **consultation:** Copy elements from `list` (dc752fc1)

### 🔩 Internals
- **migration:** Make migration for comment (77862c2f)
- **model:** Make model for comment (45abb306)
- **front-end:** Apply windi css (82b6bb86)
- **front-end:** Apply windi css (d0becfea)
- **model:** Improve the typing of relation to other model (7d6e416d)
- **model:** Rename the identifier for parent comment (58cdae24)
- **model:** Link comment to post model (950808ce)
- **model:** Link comment to itself (7505f5a8)
- **transformer:** Make transformer for comment (0718780e)
- **query:** Make query pipe to include commenter info (2bcb0db8)
- **database:** Add comment model in source (28ce50b8)
- **manager:** Make manager for comment (8505e96c)
- **manager:** Include the pipeline for listing comments (485d1921)
- **role:** Pass attributes to reduce traversal (8b34b491)
- **post:** Remove outdated title field (74de2cba)
- **post:** Replace "description" to "content" (1afae9ce)
- **post:** Return the form data to parent component (0da0a2ab)
- **front-end:** Make method helper (942c3ad8)
- **front-end:** Make variable constant (fc121d78)
- **post:** The whole deserialized post document (979e7a29)
- **front-end:** Make method helper (50ede802)
- **front-end:** Relocate helpers (264f25ce)
- **post:** Add other details in form (d36488b7)
- **front-end:** Make method helper (1738f801)
- **fetcher:** Make method to create post with attachments (a07a8a03)
- **front-end:** Make method helper (bb7a4b07)
- **post:** Make component to display post form (8f379749)
- **post:** Utilize create post form (6cecb960)
- **front-end:** Make method helper (6e6733fb)
- **front-end:** Capitalize constant (da5a83e5)
- **manager:** Make method to get existing consultation IDs (1cc68d7b)
- **front-end:** Generate time with limitations (50b4f01b)
- **front-end:** Make method helper (410a2e5e)
- **front-end:** Return times in minutes instead (e50b4ab3)
- **consultation:** Show current date (69d21844)
- **manager:** Add method if a schedule is within schedule (c8c3dd15)
- **consultation:** Generate time properly (e7166581)
- **validator:** Make validator to check if a date is within schedules (1a715513)
- **route:** Create post for post (67286af3)
- **route:** Restore patch for post (c54752b1)
- **front-end:** Convert date to working format (267045cb)
- **front-end:** Jump to next month (a96eecb5)
- **route:** Update patch for post (2e2b20c3)
- **route:** Add role and user relationship for posts (f0dfa12b)
- **rule set:** Change the signature of ID-based filter (669a28d5)
- **rule set:** Retain original for multi-ID based filter by default (35dc4b6e)
- **profile picture:** Generalize type guard (9e6410f7)
- **consultation:** Load file contents directly (cdca1b32)
- **external:** Make body CSS classes manager (efc166ac)
- **consultation:** Get unique profile pictures (0828303f)
- **external:** Add method to lighten or darken the theme (5b8240d0)
- **external:** Make method to toggle scroll (4eb32d58)
- **front-end:** Utilize provided key (afc96d37)
- **consultation:** Use the dropdown to hide other settings (953c0a2c)
- **route:** Archive delete for post (88ecf853)
- **route:** Add archive route in the router (369b2af5)
- **policy:** Check if the current user has default password (d7ca48b5)
- **policy:** ⚠️  Change the signature of permission-based policy (396ded4c)
- **policy:** Update the passing of extra checks in server (ffaa757a)
- **user:** Update the passing of extra checks in user routes (34a5b759)
- **policy:** ⚠️  Change the constructor signature of scope-based policy (ca9a8abd)
- **policy:** Allow changing the requirement of change password (3cc7f37f)
- **server base:** Put some operations in asynchronous mode (5ee4caf3)
- **router:** Wait for all routes to be registered (8889c13b)
- **server base:** ⚠️  Wait for route information to be registered (7f7157af)
- **server:** Wait for route information to be registered (a00d156c)
- **server base:** Wait for all registrations to resolve (e70e101a)
- **server:** Track the duration of listing the routes (f5213526)
- **server:** Change the mechanism to use on registering routes (8ec11b5b)
- **consultation:** Accept user directly (73af8888)
- **database:** Rephrase creation message (b5826ea2)
- **server:** Rephrase update message (651a923d)
- **forum:** Preload the posts (f30f0628)
- **post:** Use JSON controller to upload post (1748330e)
- **migration:** Add department ID to posts (46cd9acb)
- **component:** Use helper function (5951a2cc)
- **user:** Renamed class (0a50aeee)
- **model:** Link department to post (d98daea7)
- **component:** Pass state through props (cf9de071)
- **manager:** Make manager for attached role (57dc7335)
- **model:** Add the foreign key to department for post (b763a3ad)
- **manager:** Make method to create post with resource (d7deddd8)
- **transformer:** Link department transformer to post (f2ab8223)
- **migration:** Correct the name of migration (602c4c43)
- **migration:** Make migration for post attachments (2ae75cc7)
- **migration:** Change the parent table of post attachments (72144bfc)
- **migration:** Allow post attachment to have no parent (0d933500)
- **model:** Make model for post attachment (c2aeddfc)
- **transformer:** Allow whitelisting other attributes for file-like (f6bad5f0)
- **transformer:** Whitelist other attributes of post attachments (8f530c55)
- **transformer:** Link post attachment transformer to post (4efe990a)
- **database:** Change the identifier for file type (a9d6a091)
- **model:** Link post attachments to post (62fce92c)
- **manager:** Make manager for post attachment (34d05bd3)

### 🌐 Shareables
- **constant:** Share interval constant (9c094661)
- Make identity uniqueness helper (4a53d49c)

### 🦠 Unit Tests
- **consultation:** Ensure schedule existence (0a0ecf15)
- **manager:** Prepare test for manager of comment (e8128cc2)
- **role:** Ensure affecting of other permissions works (2a23150b)
- **consultation:** Ensure selectable days (7cb1f187)
- **fetcher:** Ensure post fetcher works properly (4529fc57)
- **consultation:** Ensure time selection (3f291389)
- **manager:** Prepare unit tests to read existing consultation IDs (35d32f26)
- **front-end:** Ensure other returnable values (4ae3b4c0)
- **front-end:** Document some purposes (8ba0365e)
- **front-end:** Ensure last hour (d5f21d7c)
- **front-end:** Ensure noon time (41c808d2)
- **consultation:** Ensure selectable times length (f53b6ff4)
- **manager:** Prepare test to check if a time is within a schedule (f6938586)
- **manager:** Add test to check for slip-offs in current time zone (bd588b70)
- **consultation:** Ensure actual date values (7c8c562a)
- **consultation:** Ensure complete submission (497d86c5)
- **validator:** Prepare test to validation of consultation schedule (c8464908)
- **consultation:** Ensure valid custom date (3e1d2138)
- **consultation:** Ensure bound consultation schedule (850766b2)
- **route:** Ensure create for post works (c4bcc3eb)
- **post:** Ensure restore patch for post works (e5bba648)
- **consultation:** Test incomplete information (f5f728d6)
- **test:** Ensure update patch for post (097e13d3)
- **router:** Router for posts (040a698c)
- **consultation:** Ensure button disabling (e1c646e4)
- **consultation:** Ensure creation of consultation have valid schedule (b275fefa)
- **validator:** Change the schedule end to prevent conflict with others (325326ac)
- **profile picture:** Unuse factories (27a436b6)
- **external):** Prepare test to lighten or darken the body theme (d0785439)
- **external:** Prepare unit test toggling scroll (58366882)
- **consultation:** Ensure unique pictures (c4a5dc0d)
- **route:** Ensure archive delete works (1c063430)
- **component:** Ensure functionalities (29cdcfe0)
- **consultation:** Ensure with proper provision (90c62d7c)
- **policy:** Require password to be changed (29715c86)
- **policy:** Correct the test code (880252a7)
- **policy:** Update the test of affected policies (1926796d)
- **policy:** Expect extra checks to be in object (aa9f5c21)
- **component:** Mock emit (6eda2939)
- **consultation:** Ensure add button (3e8b63da)
- **consultation:** Find with proper selector (9242f182)
- **policy:** Ensure guest user can access despite conflict (b7f9363e)
- **server:** Correct the state of authentication (9a870c4f)
- **chat message:** Ensure user is a reachable employee (abae409c)
- **chat message:** Ensure user has metadata (4df3c8e1)
- **role:** Ensure user has metadata (f237b619)
- **consultation:** Ensure new chat entry format (a50ee76d)
- **consultation:** Ensure status message owner (0a84d360)
- **consultation:** Ensure send button works (c8b3b08e)
- **consultation:** Ensure search bar toggling (31fcdcef)
- **consultation:** Ensure emission (50a593b4)
- **manager:** Prepare to test attached role manager (04d5a950)
- **consultation:** Ensure toggling of list (b889541a)

### 🕷 Integration Tests
- **policy:** Improve the readability of tests (e8996321)
- **chat message activity:** Expect consultation to be deleted (b49791c7)
- **consultation:** Ensure bound consultation schedule (2aab2496)
- **consultation:** Ensure date is within employee schedule (9e502cf2)
- **user:** Ensure default password can be changed (edc1af83)
- Ensure users are student with student number or reachable employee (c6c52b4c)
- **chat message activity:** Correct the association of student detail (82a3eb68)
- **policy:** Associate student detail (3bb83f03)

#### ⚠️  Breaking Changes
- **front-end:** ⚠️  Deprecate some class togglers (956afec1)
- **server:** ⚠️  Rename some constraint type (b852c834)
- **share:** ⚠️  Make property optional (5b2d4d85)
- **policy:** ⚠️  Change the signature of permission-based policy (396ded4c)
- **policy:** ⚠️  Change the constructor signature of scope-based policy (ca9a8abd)
- **server base:** ⚠️  Wait for route information to be registered (7f7157af)

### ❤️  Contributors
- Ardrin
- Ardrin Gregorio
- Arukane
- Jarlem Red De Peralta
- Kenneth Trecy Tobias
