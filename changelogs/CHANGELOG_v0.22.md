# Changelog

## v0.22.0

### 🚀 Enhancements
- **consultation:** Make page for report route (10698b9c)
- **department:** Make page for editing (e8079499)
- **consultation:** Display pre-loaded data (38af7e57)
- **page:** Redirect to current page (80fa5a86)
- **user:** Load attached department (95ad5591)
- **post:** Add field to comment for a post (bd3a0a23)
- **comment:** Make comment routes available (e92bce1b)
- **comment:** Show the profile picture of commenter (c8d4f9ef)
- **comment:** Hide the menu if there is no permitted content (21d32c38)
- **comment:** Clear the field after submitting the comment (0ba285b2)
- **comment:** Make route to list comments (81f59740)
- **server:** ⚠️  Remove routes to read consultation as PDF (b0d479b0)
- **chat:** Show file repo (fc990655)
- **chat:** Separate file and picture preview (f9dc106e)
- **user:** Make selectable radio component (2e79a1c0)
- **page:** Watch existence (e0a768a5)
- **consultation:** Inform the client about the updated consultation (4baf2ccd)
- **consultation:** Make weekly report page (914167ad)
- **consultation:** ⚠️  Nest the report pages (a6b59da8)
- **consultation:** Make route to read time sum for consolidation (4beaec85)
- **listener:** Listen for incoming consutlations (344c0945)
- **consultation:** Make page to show consolidated info (dd835840)
- **chat:** Show errors (ebce5cdb)
- **department:** Show errors (9948310a)
- **chat:** View image preview in file repo (7063aa61)
- **chat:** Load previous chat messages (fcbc0c8b)
- **chat:** Load previous chat messages (8b60b07e)

### 🔥 Performance
- **server:** Optimize top level routers (4c710189)
- **server:** Optimize user routers (a8b3c7eb)
- **server:** Optimize role router (3fb6f659)
- **server:** Optimize department router (9f1a8291)
- **server:** Optimize employee schedule router (ad6dea0b)
- **server:** Optimize consultation routers (5d9c8bd2)
- **server:** Optimize developer routes (ff64dc46)
- **server:** Optimize registration of consultation related controllers (7b647d16)
- **server:** Optimize registration of user related controllers (98458080)
- **server:** Optimize registration of core controllers (eab475bc)
- **server:** Optimize registration of forum-related controllers (6b994baa)
- **server:** Optimize registration of miscellaneous controllers (28a0591e)
- **server:** Optimize registration of API controllers (2d78089d)
- **server:** Optimize registration of user page middlewares (f286e673)
- **server:** Optimize registration of role page middlewares (0f7c5b00)
- **server:** Optimize registration of post page middlewares (25cec310)
- **server:** Optimize registration of forum page middlewares (7154facc)
- **server:** Optimize registration of department page middlewares (caa98909)
- **server:** Optimize registration of consultation page middlewares (88122571)
- **server:** Optimize registration of settings page middlewares (344f129d)
- **server:** Optimize registration of page middlewares (7961744c)
- **server:** Optimize registration of comment vote controllers (8a047d1c)
- **server:** Separate initialization of singletons (e2c6aee4)
- **server:** Initialize singletons asynchronously (33e482ba)
- **server:** Register routes asynchronously (8a29630c)
- **server:** Wait for dependent process to register global middlewares (2e6fc4d5)
- **server:** Register third-party router asynchronously (ddcefd8b)
- **server:** Defer initialization of web socket server (57354866)

### 🩹 Fixes
- **server:** Pre-load consultations by `userID` (6b32e361)
- **manager:** Match consulters' activities (7fcf53f2)
- **manager:** Include consultations (1872a41f)
- **manager:** Correct the column being checked (b040efd3)
- **post:** Correct the order of permissions (20eb3b97)
- **model:** Correct the relationship to post (4c03732f)
- **query:** Add specific name what to treat to included comment (264b25e8)
- **manager:** Correct the inherited pipeline (188a0a78)
- **post:** Use the department of post for comparison (f23b5470)
- **comment:** Correct the relationship name for parent comment (fb01b927)
- **component:** Un-destructure props (633e8799)
- **comment:** Emit proper event to create comment (b01af832)
- **comment:** Include the information about the related IDs (94e273cc)
- **user:** Sleep for 1 second after every update (c79a88f4)
- **comment:** Ensure comment will be submitted (2e0f845d)
- **comment:** Ensure comment can be submitted explicitly (0a200080)
- **post:** Add missing import (d6b03dd4)
- **server:** Pass request on other managers (9b70af0d)
- **page:** Rename extra property (25699f3a)
- **role:** Access data of resource (cc4837fd)
- **consultation:** Get time part absolute (82dfe1e1)
- **comment vote:** Include the foreign IDs (7ea895a3)
- **comment vote:** Correct the type of comment (2f315424)
- **comment vote:** Remove the relationships in comment vote (b89145ee)
- **comment vote:** Correct the permission to create the vote (5f950f71)
- **user:** Mock the response for loading other data (c2359ad7)
- **manager:** Include the user data properly (85421aa5)
- **server:** Handle userID from `request.params` (ed633d20)
- **manager:** Handle error in reattacher (5743e686)
- **comment vote:** Correct the permission of other routes (3ad40995)
- **manager:** Ensure user IDs only appear once (01ea0d45)
- **consultation:** Fix the property to get total time consumed (02320c9e)
- **consultation:** Use the participants (221dc64b)
- **comment:** Correct the quantity of quotation (ea765b99)
- **middleware:** Allow setting extra parameters (c7c13d15)
- **post:** Allow commenting always on public posts (4d2c3183)
- **user:** Correct the body classes to use (d76f5b5c)
- **consultation:** Limit the starting of consultation to employee (355e73b3)
- **chat message:** Include missing paths (1454236b)
- **consultation:** Ensure received message at is not empty (93701baf)
- **consultation:** Ensure consultation does not exist by index (efa717aa)
- **manager:** Correct the created schedule (d9741827)
- **server:** Redirect to `list.page` (c4fd08c3)
- **server:** Direct user dynamically (810da737)
- **server:** Direct user dynamically (df1198c5)
- **chat message:** Use the correct manager to validate consultation IDs (e57c5b6c)
- **validator:** Correct the error message (2e825147)
- **server:** Correct the path to initialize properly (6cf91bf8)
- **server:** Make second parameter to be optional (890d1bb6)
- **user:** Correct the permission for importing users (39dfb7d4)
- **consultation:** Correct the path to received errors (4d2b3c0b)

### 💅 Refactors
- **manager:** Loop through consultations (46a511e5)
- **manager:** Reuse map functions for readability (28d3b0d9)
- **post:** Separate the loading of posts (a3a516e0)
- **post:** Use existing instance of post (b5ce40c1)
- **comment:** Utilize general field (2e5f63cc)
- **consultation:** Separate `file_overlay` (3e1a5f2b)
- **chat:** Refactor classes (3db14188)
- **user:** Use the existing fetcher instance (5974357e)
- **consultation:** Remove the separate initialization of fetchers (ce0b5079)
- **consultation:** Get the chat activity of current consultation (511a550d)
- **validator:** Use the default list limit (3f1b15ce)
- **department:** Utilize a component for checkbox (b52ff5fe)

### 🏡 Chore
- **page:** Remove dynamic routing (099c7dc2)
- **server:** Rename route (5eab3655)
- **query:** Correct an import (c4182f8c)
- **page:** Rename methods (9953dbe7)
- **back-end:** Make the code tidy (ff258a74)
- **component:** Remove unused destructured data (f508662f)
- **chat message:** Make code tidy (1ea85c06)
- **front-end:** Make the description more clear (3c5ea441)
- Remove integrated style (5c310852)
- **server:** ⚠️  Remove router classes (c5243e24)
- **page:** Initiate fetcher on create (e316cbbe)
- **role:** Make code tidy (c1945e3e)
- **validator:** Remove exessive quotation (6446dfca)
- **lint:** Adhere to rules (4b6ab544)
- **user:** Make code tidy (2264cef3)
- **route:** Fix route (784b472e)
- **component:** Re-order option (8f4f11f7)
- **component:** Style minor dropdown (393cd04b)
- **route:** Remove console test (5d2b7b1f)
- Replacing proper location (b563921a)
- Correct import (b587a867)
- Uncomment a line (1079eb1c)
- Move component to proper folder (e425f872)
- Correct import locations (9e229e08)
- Rename file (db2bf567)
- Correct import locations (4a684e35)
- Ensure error (0a47e19b)
- Mark the problem encountered (56f8b85e)
- Correct import (d2cd1b29)

### ✅ Tests
- **factory:** Wait for results (bedcc10c)
- **factory:** Remove method to generate parent comment (bcbb4d0d)

### 🌊 Types
- **consultation:** Add type for consultations (d2951d65)
- **share:** Define additional `pageProps` type (5a8c8831)
- **share:** Ensure no relationships when updating comments (471a106d)
- **share:** Add comments in page props (37e8333d)
- **share:** Separate the page offset (66ef83ac)
- **share:** Ensure other types were attached (a5b2f987)
- **share:** ⚠️  Correct the relationships of comment (9cea55ed)
- **front-end:** Make status for field (2025bcee)
- **component:** Make field status limited to components (1dd1bd31)
- **front-end:** Add new textual field statuses (d61dee04)
- **share:** Make type for post filter for comment query parameter (be15393f)
- **share:** ⚠️  Change name of special user list (69f8ca05)
- **share:** Make type to structure consolidated summed time (808231df)
- **server:** Add property to allow dynamic values (471ecc0e)
- **share:** Remove relationships to itself (dde36594)
- **share:** Add property for summed time for consolidation (61d097d7)
- **share:** Separate the common properties (38c6189a)
- **server:** Allow specifying redirect URL (1c36e894)
- **server:** Rename the property for failed redirect URL (c75e4fe8)

### 🎨 Styles
- **comment:** Re-style the comment (cf4471ad)
- **component:** Re-style minor dropdown (f5ebef03)
- **component:** Re-style minor dropdown for medium screens (99a50f0d)
- **component:** Add background to identify (5510c205)
- **comment:** Make comment menu item flat (7a4d4a8e)
- **comment:** Show menu in calculated icon (26cb32fb)
- **post:** Remove deprecated styles (913db651)
- **comment:** Style the comment field (bbed415a)
- **component:** Fix the style of minor dropdown (80831d78)
- **post:** Style the read post page (7527bf30)
- Make style for icon buttons (e7bcafba)
- **component:** Apply icon button style (810d9359)
- **field:** Apply icon button style (224479d0)
- **component:** Make icon button (b8633274)
- **component:** Reduce the space consumed by the buttons (80e0e04c)
- **comment:** Correct the placement of actions (1127ceae)
- **chat:** Style the file repo (f0962d5d)
- **chat:** Style component (093acfbc)
- **page:** Style on department (035baa34)
- **page:** Adjust position on buttons (d43e93e7)
- **component:** Remove border (8cb49433)
- **component:** Remove padding (81896c31)
- **component:** Pad the bottom of controls (115b2db2)
- **chat:** Adjust some style (669661be)
- Structure class chains (22b9a6de)
- Ensure overlay (2f8ba82e)
- **chat:** Adjust some styles (dc9d6031)
- **chat:** Style for mobile viewport (61a6aedf)
- **chat:** Highlight active image file (4847f80f)
- **chat:** Make image preview scrollable (a7a4a76c)
- **chat:** Remove unused styles (a92c296e)

### 🗒️ Configurations
- Add another variable to make other servers optionally run (968f9b67)
- Add another variable to optionally connect to email server (c1e9b6f5)

### 👓 Reformed Templates
- **page:** Use proper class selectors (5c060662)
- **component:** Use proper class selectors (70127b4e)
- **component:** Give proper class (1eb83e22)
- **component:** Provide link to edit a resource (1d377df5)
- **component:** Give proper class selector (46e605f1)
- **page:** Remove doubled components (c70404b8)
- **consultation:** Display user of sum entry (04b5d60d)
- **consultation:** Give proper selector (7966075b)
- **component:** Use selectable radio (193e1bf6)
- **department:** Show error (de69c445)
- **component:** Decompose separately (52e71263)
- **component:** Add slot for additional controls (a324d393)
- **page:** Add import button (86e714cb)
- **page:** Give link to extra button (3f732210)
- **page:** Remove tabs header (42c7c2e6)
- **page:** Allow user to go back to `list.page` (34af44e0)
- **role:** Direct to resource creation page (53ef5fc0)
- **component:** Decompose into component (52a36034)
- **component:** Use `list_redirector` (fc6a689c)
- **component:** Revert to old state (e559baf6)
- **component:** Revert decomposed state (49a42200)
- **chat:** Use component (d02701d5)
- **chat:** Ensure close (5c5539d2)
- **component:** Remove unnecessary header (5d2942a6)
- **chat:** Separate file lists (422debed)
- **chat:** Use proper list parent element (a653288c)

### 🔩 Internals
- **server:** Make report route (91bb41c8)
- **route:** Archive delete for consultation (abc23dcb)
- **route:** Restore patch for consultation (7b7017cf)
- **server:** Make route for editing (fb8887dc)
- **manager:** Return with consultations (746f3716)
- **manager:** Return consultations in weekly sum (f1eaf384)
- **server:** Set fix `dateTimeRange` (b4b765cb)
- **fetcher:** Associate relationships for creation (b7128d7c)
- **comment:** Make comment menu (9ba317dd)
- **database:** Make `notEqual` condition (c31fe6cc)
- **comment:** Make comment to view and edit the component (33fe6c0b)
- **server:** ⚠️  Remove chat router due to deprecation (f49cdd6b)
- **server:** ⚠️  Remove chat router due to deprecation (928a4dfc)
- **server:** Ensure consultation belongs to user (fa5c72f1)
- **server:** Register read route for user (9983779e)
- **post:** Make router to read post (52216f50)
- **post:** Make post enhancer router available (2dcdd689)
- **post:** Prepare page to show the post and its comments (429455ac)
- **comment:** Make multiviewer for comments (e62edd7f)
- **comment:** Modify the page for viewing comments (79569395)
- **page:** Pre-load and fetch roles (a3190fdc)
- **manager:** Include the defaults when reading a post (c261396c)
- **server:** Get the first error found in error bag (eba60234)
- **validator:** Remove the excess double quotation (a6056f14)
- **query:** Make department optionally included (dbd99eaf)
- **transformer:** Include deleted timestamp (e90d08c9)
- **post:** Include department to one of the required relationships (ff27272b)
- **post:** Look on the availability of department (d7ce8502)
- **post:** ⚠️  Remove the requirement of post ID (9dee36be)
- **post:** ⚠️  Add new required relationship to view post (8fb22ce8)
- **field:** Add mechanism to optionally save implicitly (7382e60e)
- **server:** Pre-load departments (f96afd07)
- **comment:** Make component to create comment (fc1af2b3)
- **comment:** Save the comment implicitly (b998859c)
- **page:** Rely on type inference (0c780701)
- **user:** Separate updating of relationships (15cc083b)
- **user:** Reload after updating (6f54c416)
- **post:** Allow commenting if possible and permitted (ca2a7414)
- **comment:** Make the general component for field (5a2ca06f)
- **field:** ⚠️  Compress the statuses into one prop (80115e18)
- **comment:** Use field status to control the comment (e7c4e6e4)
- **role:** Control field status of name (3591a852)
- **user:** Control field status of email (708296f4)
- **field:** Re-emit save event for locked (bc00fe6f)
- **user:** Update the email directly (bdbe7cca)
- **user:** Delegate the field status (aaa5d183)
- **user:** Delegate the name field status (3e25296d)
- **authentication:** Remove token in log in form (56d05f77)
- **field:** Allow inputs to be cancelable (dffe874f)
- **comment:** ⚠️  Remove extra send buttons (f58133a5)
- **component:** Make minor dropdown (567cf4ce)
- **field:** Make unlabeled text field (1e45feac)
- **comment:** Unlabeled text field for comment field (87369c65)
- **component:** Apply icon button to minor dropdown (1fe36cf6)
- **component:** Explicitly state icon button is a button (29f09fd8)
- **component:** Utilize button icon for unlabeled text (c8a81a97)
- **component:** Prevent the submission of form (03adf50e)
- **post:** Push the newly-created comments (146143f0)
- **component:** Expect component to focus out (440d0ef2)
- **manager:** Integrate comment query parameter to manager (0536c7bd)
- **fetcher:** Integrate comment query parameter to fetcher (16c4d850)
- **manager:** Sift the comments by post through list pipeline (799755dd)
- **query:** Make filter to get comments by post (0b43ac08)
- **server:** Make function instantiate simultaneously (fb9439d3)
- **server:** Generalize simple simultaneous instantiation (c664d1ef)
- **database:** Add delete at in department transformer (6b7570e8)
- **route:** Add friendly name in body rule generator (f9835a7a)
- **server:** Include user of consumed time (33034d4d)
- **page:** Use proper type (75932eae)
- **user:** Load other possible roles (f6d210e6)
- **user:** Load other department for the user (9dd17cc3)
- **server:** Log the current authorization place (0096c344)
- **comment vote:** Correct the permission to update the vote (454294fe)
- **consultation:** Remove inappropriate type (797efdc3)
- **manager:** Ensure that comment vote is unique (f083067d)
- **fetcher:** Ensure user and comment relationship are present (0b7e571a)
- **component:** Make existence filter data (88994f6c)
- **component:** Make reactive (ed16d3fb)
- **page:** Filter by existence (c9a972e2)
- **resource management:** Make function to load remaining departments (a5138b9f)
- **role:** Utilize the function to load remaining departments (81bfe0e3)
- **resource management:** Make function load remaining roles (80f91df5)
- **user:** Load all roles and departments first (2c5401a2)
- **user:** Watch after all resources has been loaded (d6fc893a)
- **consultation:** Make page middleware to preload weekly consultation (c30160a0)
- **consultation:** ⚠️  Align the name of the variables (f845a143)
- **manager:** Sum time for consolidation (ea7aa5d1)
- **listener:** Listen for incoming consultations (02cfa319)
- **listener:** Pass `userProfile.id` (321d0411)
- **server:** Make web socket server and peer server optional (72aa8143)
- **server:** Ensure server is enabled (4bd2fa23)
- **front-end:** Clear all listeners (dadc6108)
- **server:** Make email server run optionally (bf8c4b64)
- **listener:** Pass consultations (fa42618b)
- **web socket:** Log the emission of events (dbb6a47c)
- **validator:** Allow `one-of` validator to use submitted values (9c50543b)
- **consultation:** Ensure consultant is one of the participants (f2dbd25e)
- **migration:** Remove comment ID (5e3017a0)
- **model:** Remove self-reference to model (236c22fb)
- **transformer:** Remove self-reference to transformer (b680d40c)
- **manager:** Remove unused column (4ddee9ab)
- **query:** Remove inclusion of comment itself (fdfa0b9c)
- **query:** Remove validation of relationship for parent comment (b6ff3a25)
- **post:** Remove relationship to parent comment (a6dd4db9)
- **comment:** Remove relationship to parent comment (b4d8f95f)
- **route:** Fix permission for available actions (8867a09a)
- **migration:** Fix missing post table (9b1107ac)
- **middleware:** Make generation of extra as dynamic (6cbe1948)
- **consultation:** Make page middleware to preload summed time (19f9ccf1)
- **consultation:** Ensure load the consultation this week (0c977ef3)
- **consultation:** Error in case chat message activity does not exist (1003e16e)
- **consultation:** Rename the variables for chat message activities (6b24bd19)
- **server:** Ensure user ID is a number (0836dee3)
- **component:** Unstore in variable (218fd832)
- **chat:** Add remove function (9e574a6e)
- **role:** Catch errors when archiving/restoring (868be307)
- **user:** ⚠️  Use a permission-based policy to manage access to list (eda9ee30)
- **role:** ⚠️  Use permission-based policy to manage access the list page (d9b18537)
- **role:** ⚠️  Use permission-based policy to guard read page (915d1c29)
- **department:** ⚠️  Use permission-based policy to guard list page (5a59db02)
- **department:** ⚠️  Use permission-based policy to guard read page (07ec2748)
- **chat:** Use `minor_dropdown` (8520a11c)
- **resource management:** Utilize the constant page paths (5b146c91)
- **user:** Redirect the user to user list (83e17288)
- **role:** Redirect the user to role list (28ae3208)
- **department:** Redirect the user to department list (caf57878)
- **role:** Read role by permission (04d79fe1)
- **component:** Make success messages handler (8bc45eee)
- **user:** May archive user (a1d8e541)
- **department:** May archive department (58bdfefe)
- **chat:** FriendlyName for action taken (0cea9112)
- **chat:** Show error (96609614)
- **page:** Clear opposite messages (9777190e)
- **user:** Add permission on user list page (7f51f230)
- **department:** Add permission on department list page (1a013641)
- **role:** Add permission on role list page (578c271f)
- **policy:** Use structure to accept redirect URL (b4ba7bee)
- **policy:** Pass the optional redirect URL (4453c608)
- **user:** Redirect unauthorized users (10ce68b9)
- **role:** Redirect unauthorized users (2a61362a)
- **department:** Redirect unauthorized users (379a9888)
- **user:** May archive and restore user in read page (77223581)
- **user:** May create and may edit user in read page (75514819)
- **role:** May archive and restore role in read page (14f691a8)
- **role:** May create and may edit role in read page (715356ae)
- **department:** May archive and restore department in read page (4681d35b)
- **department:** Utilize URL maker for base path (2334312a)
- **department:** May create and edit department in list page (d1862d52)
- **component:** Add may edit (21f06d37)
- **role:** Utilize URL maker for base path (bddd5d7b)
- **user:** Utilize URL maker for base path (8069678a)
- **department:** Testing this amazing department (e0ebaff8)
- Show success message (f7a23576)
- **department:** Redirect user to home page (13044d1d)
- **user:** Redirect user to home page (ca454132)
- **role:** Redirect user to home page (e30ca7ba)
- **chat:** Provide files as props (e5a2341f)
- **server:** Make home route (b1529910)
- **server:** Ensure third-party middlewares are installed first (fc1bda90)
- Show success message (8a5c94ed)
- **role:** Put the condition closer to the anchor (e27eba3b)
- **department:** Put the condition closer to the anchor (a94187f6)
- **user:** Put the condition closer to the anchor (8b0b756a)
- **role:** Prepare variables to disable fields if not enabled (85f0cdfc)
- **role:** Allow flag selector to be disabled (e9fe1c64)
- **role:** Disable selection of flag selectors for unauthorized user (29006a98)
- **department:** Disable input fields if not permitted (7c9f1c07)
- **field:** Allow multi-selectable options field (5f7638fc)
- **user:** Prepare variables to control modification of user (82ed0628)
- **user:** Ensure fields are editable when unauthorized (a3934778)

### 🌐 Shareables
- **permission:** ⚠️  Require post instance to create the comment (ad30c4c7)
- **permission:** Make combination for voting (801a1e0f)
- **namespace maker:** Make the namespace for consultation list (6916930f)
- Relocate constants and helpers (9ae9b2f3)
- **constant:** Make variable for default list limit (9c3daeb1)
- **constant:** Add page path to department list (51fd3ed3)
- **constant:** Add page path to other lists (7b0ed583)
- **constant:** Add path to home page (575744e1)

### 🔦 Developer Experience
- **page:** Use default password (840d6a67)
- **server:** Make route to create post (feecf73d)
- **server:** Insert the test post (97eecba7)
- **server:** Wait for test post to be inserted (c6d86812)
- **template:** Make checkboxes for instructions (1796a375)
- Add extension (806e503d)
- **template:** Fix some spacing (08ce5006)
- **template:** Improve the template (903a9f92)
- **command:** Watch environment file (23b96382)
- **template:** Add new option (9e08ee6d)
- **command:** Add performance icon (0a898129)

### 🦠 Unit Tests
- **route:** Ensure archive delete for consultation works (4962e55c)
- **route:** Ensure restore patch for consultation works (4e627582)
- **comment:** Prepare test to make sure comment menu works (df37b9bd)
- **manager:** Ensure consulters are used (edbe0ecc)
- **manager:** Ensure consulters are used (1cf38078)
- **manager:** Ensure inclusion of consultations (6a3b3640)
- **post:** Ensure other post may be archived (b29b4eee)
- **comment:** Prepare test to create a comment independently (db071658)
- **comment:** Prepare test to create a comment dependently (c3459353)
- **comment:** Expect updates to create comment (fcdf8ddd)
- **post:** Correct the expected event (1ba7166b)
- **comment:** Skip the test due to missing comment field (a00549b3)
- **server:** Choose the initial error (2f7bb74c)
- **component:** Ensure proper link attributes (f52c9d8b)
- **comment:** Prepare unit test for comment field (ca391bda)
- **field:** Expect field to emit enable and disable events (6a28158a)
- **field:** Expect field to have fewer props (2e2579e6)
- **field:** Attempt to redo save event emissions (2b0c62a3)
- **comment:** Expect comment will require user (c87f5cf4)
- **field:** Separate the classes of buttons (ed698be9)
- **field:** Expect some processed inputs (2c208b6a)
- **comment:** Prepare field to create a comment (1ed86304)
- **component:** Make test for minor dropdown (af78962e)
- **comment:** Prepare test to hide the menu if non is permitted (fed8596a)
- **field:** Expect unlabeled text to be the same as non-sensitive text (c084ee6f)
- **component:** Remove the inner stub of minor dropdown (c8df1996)
- **field:** Find the target component (96091afc)
- **user:** Expect different buttons for editing and saving (2b0ff32b)
- **user:** Expect different buttons for editing and saving email (7f7de28b)
- **query:** Prepare query to sift comments by post (69f60202)
- **comment:** Prepare unit test list comments (aa0dc975)
- **comment:** Create the post to considered valid (a4d7fa71)
- **consulktation:** Add file overlay spec (8cb78ff1)
- **component:** Ensure selectable radio works (33048fca)
- **resource management:** Make function to load remaining departments (ffb9a659)
- **resource management:** Prepare test to load remaining roles (1ce4ede4)
- **namespace maker:** Prepare test to make a namespace (fd121e28)
- **manager:** Prepare test sum time for consolidation (0c5ebe4f)
- **listener:** Stub `userProfile.id` (72194b8b)
- **listener:** Ensure updating of receive status (6e07158d)
- **listener:** Ensure incoming consultations (8a11be87)
- **validator:** Allow `one-of` validator to use submitted inputs (4438cc8e)
- **report:** Fix meta property name (9c77e644)
- **middleware:** Ensure extra has a data (ec2efb2b)
- **consultation:** Prevent showing start consultation button (91ea2d2e)
- **user:** Update the expected body classes (3a97678e)
- **user:** Update the expected stub operations (8a7f3b07)
- **manager:** Ensure default schedules are correct (e8b20166)
- **chat:** Ensure file size limit (adcec9fa)
- **chat message:** Ensure multiple consultation IDs work (6303b6e5)
- **chat:** Ensure event emissions (d2817d48)
- **chat:** Fix test (a29e50b8)
- **chat:** Fix test (1f226835)
- **chat:** Customize current date (708d0166)
- **chat:** Emission custom event (20520ad6)
- **chat:** Ensure image previewing in file repo (66d31c44)
- **chat:** Ensure emission (5f99c606)
- **chat:** Ensure merging of chat messages (d4604b6c)

### 🕷 Integration Tests
- **department:** Ensure fields population (55cccad7)
- **department:** Ensure `mayAdmit` (d337982a)
- **department:** Ensure successful update (196eaf5f)
- **user:** Ensure population of pre-loaded data (a2ef07a9)
- **user:** Ensure successful patching of data (03df80f3)
- **comment:** Ensure comment to be created (4b7bdb56)
- **user:** Ensure previous calls (a98e56da)
- **comment:** Add missing attribute (c5244d12)
- **comment:** Ensure post ID is a string (179715f8)
- **user:** Ensure listing of users (8f464c2b)
- **user:** Use fake timers to set timeout (e053eeff)
- **user:** Ensure attached roles can be updated (6ee8ba86)
- **user:** Trigger proper buttons (a9b5b621)
- **role:** Rename file (eb379dcb)
- **page:** Trigger proper buttons (aff89d9e)
- **role:** Ensure archiving and restoring (68443e73)
- **consultation:** Ensure displaying of data (45caf864)
- **user:** Correct the expected count (d048f7dd)
- **user:** Prepare test to load departments and roles continuously (3acd5e2d)
- **consultation:** Expect server to output a consultation (74d778c9)
- **consultation:** Ensure consultant is one of the participants (892b9cac)
- **consultation:** Ensure missing consultant will be stopped (94eb34ec)
- **chat message:** Prepare to ensure consultation ID validation works (7e4349a0)
- **page:** Remove redundant test (2cfbff6c)
- **front-end:** Remove expectation of reload (725bde03)
- **role:** Ensure user enough permission to archive (834eeb73)
- **role:** Ensure user has enough permission to update (f78dd797)
- **department:** Prepare variables for controlled editing (ad3d9694)
- **department:** Ensure user has a role (5e1cbec3)
- **department:** Update the selectors to simulate editing (205cd509)
- **user:** Ensure current user has a role (82ef03e4)
- **user:** Ensure user profile has department (9fc45325)

#### ⚠️  Breaking Changes
- **server:** ⚠️  Remove routes to read consultation as PDF (b0d479b0)
- **consultation:** ⚠️  Nest the report pages (a6b59da8)
- **server:** ⚠️  Remove router classes (c5243e24)
- **share:** ⚠️  Correct the relationships of comment (9cea55ed)
- **share:** ⚠️  Change name of special user list (69f8ca05)
- **server:** ⚠️  Remove chat router due to deprecation (f49cdd6b)
- **server:** ⚠️  Remove chat router due to deprecation (928a4dfc)
- **post:** ⚠️  Remove the requirement of post ID (9dee36be)
- **post:** ⚠️  Add new required relationship to view post (8fb22ce8)
- **field:** ⚠️  Compress the statuses into one prop (80115e18)
- **comment:** ⚠️  Remove extra send buttons (f58133a5)
- **consultation:** ⚠️  Align the name of the variables (f845a143)
- **user:** ⚠️  Use a permission-based policy to manage access to list (eda9ee30)
- **role:** ⚠️  Use permission-based policy to manage access the list page (d9b18537)
- **role:** ⚠️  Use permission-based policy to guard read page (915d1c29)
- **department:** ⚠️  Use permission-based policy to guard list page (5a59db02)
- **department:** ⚠️  Use permission-based policy to guard read page (07ec2748)
- **permission:** ⚠️  Require post instance to create the comment (ad30c4c7)

### ❤️  Contributors
- Angelo Magtoto
- Ardrin
- Ardrin Gregorio
- Jarlem Red De Peralta
- Kenneth Trecy Tobias