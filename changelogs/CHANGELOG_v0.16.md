# Changelog

## v0.16.0

### 🚀 Enhancements
- **chat message:** Validate the chat message kind of list filter (993dcbf0)
- **chat message:** Update the rule to validate the chat message kinds (c2933bce)
- **role:** Ensure user has other roles before archiving other roles (ec26faa2)
- **component:** Disable scrolling when shown (961507d7)

### 🩹 Fixes
- **chat message:** Use triple bound JSON controller to validate owners (2094354a)
- **signature:** Ensure signature to update belongs to current user only (3a156c82)
- **chat message:** Ensure message to update belongs to current user only (a4035b4c)
- **validator:** Allow same values if employee schedule ID is the same (f4b0d0dd)
- **employee schedule:** Ensure uniqueness of employee schedules (5bd826e6)
- **employee schedule:** Ensure user has valid kind to update schedule (c65df715)
- **employee schedule:** Allow creation of schedules for others (6b93541d)
- **consultation:** Correct the validation for updated consultation (23e93dd0)
- **consultation:** Correct the policy to update consultation (bafe6e5a)
- **manager:** Fix the logical operations to delete consultations (04bf1189)
- **database:** Use the raw transaction to avoid infinite recursion (8f8c11bf)
- **chat message:** Use different policy to list chat messages (fc048a76)
- **consultation:** Register consultation routes to root API router (bd8db74d)
- **back-end:** Cast instead of asserting (7e1f0ba1)
- **back-end:** Ensure student detail is defined (2240a3cc)
- **front-end:** Reuse specific page context (f5bed10f)
- **server:** Specify the relationships to include (b706afa7)
- **route:** Specify the relationships to include (b24032c6)
- **page:** Specify the relationships to include (0772c029)
- **type guard:** Change type guard into number (3c546705)
- **manager:** Build the condition (efec313a)
- **consultation:** Use the new started at to update consultation (5899aa37)
- **consultation:** Correct the logic if consultation will soon start (9070ecf5)

### 💅 Refactors
- **chat message:** Reduce the redundant checking of ownership (e0f356b0)
- **database:** Ensure transaction is initialized (3e7f57fb)
- **front-end:** Use the general page props (d9e831f0)
- **type guards:** Import loadash dependecy (0ac3ad2c)
- **consultation:** Retain the reactivity of props in controller (688f234a)
- **consultation:** Retain the reactivity of chat messages in window (c331204e)

### 🏡 Chore
- **consultation:** Log the targets temporarily (b39f807c)
- **validator:** ⚠️  Rename the validator for checking user ownership (66bf37e6)
- **consultation:** Rename the file of chat message item component (a057c08a)
- **component:** Make a general component for profile picture (90041263)
- **lint:** Apply lint rules to some server code (8b16e704)
- **devs:** Install loadash on ~package.jo (1c0b0e19)
- **manager:** Clean unnecessary code (1c0def08)
- **back-end:** Move constants as one of the shared back-end (512d83bd)

### ✅ Tests
- **factory:** Use the latest method to ensure unique values (4d282f80)
- **factory:** Ensure the character are all valid (585b8156)
- **set-up:** Clear the stub in case of failure (33afc652)

### 🌊 Types
- **server:** Make the constraints for target validator to be optional (5b3450a5)
- **server:** Allow supplying employee schedule ID pointer (5f9e80be)
- **server:** Add rule constraints for `or` (f42059f6)
- **server:** Put the rules inside another property for safety (9c25037d)
- **back-end:** Separate transaction object types (c9fa45df)
- **back-end:** Make types for shared manager state (ff2dc167)
- **back-end:** Correct the name for cache client (2eb48f69)
- **back-end:** Allow transaction manager to be changed (e6d91cbb)
- **server:** ⚠️  Move base manager class type to dependent (8d2134c9)
- **share:** Make identifier document types for signature (d9cfc183)
- **share:** Make identifier document types for student detail (2269f7f8)
- **share:** Make identifier document types for profile picture (688f49e7)
- **share:** Make identifier document types for employee schedule (c8b0955e)
- **share:** Make identifier relationship types for employee schedule (f871ab2a)
- **share:** Declare the relationships of user to other documents (9e4e741e)
- **share:** Integrate user relationships to deserialized types (9abbdfef)
- **share:** ⚠️  Remove some relationships in attributes (26b41dbe)
- **share:** Require profile picture in user document of chat message (3d8be456)
- **share:** Correct the placement of relationships in deserialize type (44488d4f)
- **share:** Correct the relationship name of roles to user (6726cd5f)
- Include roles and department relationships in user profile (5067a12a)
- **front-end:** Specify the relationships that must be included (198e704c)
- **share:** Make filter type to get messages by kind (6daadc7f)
- **share:** Allow multiple kinds of messages to filter (53be96dd)
- **share:** Correct the name of the filter (a9021e2c)

### 🎨 Styles
- **button:** Add another variant (6f2b16bf)
- **consultation:** Add sample chips (1ac73b3f)

### 🤖 CI
- Change the key to use for cache in back-end unit tests (86510efd)

### 🗒️ Configurations
- Remove the `v` prefix in the package configuration (2b4699c5)
- Include stub set -up for front-end integration tests (2302c6bc)

### 👓 Reformed Templates
- **consultation:** Seperate overlay footer (f83349ab)

### 🔩 Internals
- **validator:** Deny completely if there are no permissions passed (77523b9a)
- **chat message:** Ensure message to create belongs to current user (32fe5a73)
- **rule set:** Make resource document allow adding post ID rules (dd265dc9)
- **validation:** Allow adding extra rules when validating ID parameters (b6ab25ee)
- **controller:** Allow adding extra ID parameter validation for bound (a7c6ff88)
- **controller:** Make triple bound JSON controller (b7ff22c6)
- **policy:** Use model chain to check for ownership (a25e10c4)
- **manager:** Customize the model chain to user for user (ed06d624)
- **manager:** Customize the model chain to user for chat message (5e7cccbb)
- **manager:** Customize the model chain to user for consultation (c8984df6)
- **manager:** Customize the model chain to user for role (0a140cc7)
- **manager:** Customize the model chain to user for department (1ff773bb)
- **policy:** Allow setting permission combinations that can bypass (667b350b)
- **employee schedule:** Ensure same schedule can be accepted to update (351d53c0)
- **employee schedule:** Ensure ownership is checked to update (0cbe18b5)
- **employee schedule:** Ensure user has valid kind to create schedule (c3442590)
- **employee schedule:** Enhance the policy to create schedule (be8dcbc0)
- **validator:** Make `or` validator (1c38bc83)
- **consultation:** Ensure schedule start time is initially a string (a01d683d)
- **database:** Implement transaction manager interface (e136b5e0)
- **database:** ⚠️  Apply organizational changes in the database (0bbef124)
- **server:** ⚠️  Apply organizational changes in the server (74fa2212)
- **route:** ⚠️  Apply organizational changes in the routes (fc0af83c)
- **rule set:** ⚠️  Make extra queries optional in object (4c061768)
- **rule set:** Allow sort value have different default value (15f9b774)
- **rule set:** Allow multiple ID key name be different (fa81b68f)
- **rule set:** Allow multiple ID initial pipe be different (bbef5ac0)
- **rule set:** Allow multiple ID initial pipes be different (1ae74293)
- **chat message:** Make route to list the chat messages (cadddc2a)
- **rule set:** Allow extending the ID rule validation (7e2059e3)
- **chat message:** Validate the IDs that belongs to current user (01804308)
- **consultation:** Make chat message component (1f54c54d)
- **consultation:** Change the class to indicate the alignment of boxes (bf07ba74)
- **component:** Use the chat message item to render the chat message (89e7ebd5)
- **component:** Simplify the profile picture item (b847ccc7)
- **consultation:** Include profile picture in chat message (b793de03)
- **server:** Remove outdated code (c44c9d30)
- Replace component property (1345a783)
- **query:** Make query pipe to filter messages by kind(s) (accdd75f)
- **manager:** Include sift by kind to list pipeline of chat messages (78df76b7)
- **server:** Trim destroy routes (b30eac6a)
- **manager:** Add note to the mechanism of archive batch (36578645)
- **attached chat file:** Make route to delete attached file (64a448c2)
- **attached chat file:** Register route to delete attached chat file (9c9ea2ae)
- **manager:** Customize the model chain to user and exposable columns (aa748205)
- **attached chat message:** Move the validation of ownership (1048f176)
- **manager:** Make method to check if a role is the only related one (41962964)
- **validator:** Make validator to check if role is only one related (e618389c)
- **consultation:** Get status and status messages for the mean time (2966c933)
- **consultation:** Auto-terminate the consultation after some minutes (b45fff8e)
- **consultation:** Update the consultation accordingly (1ab45dea)

### 🌐 Shareables
- **helper:** Pass the relationships that must be provided (4c6183d7)

### 🔦 Developer Experience
- **command:** Remove the `v` prefix in the package configuration (09381162)

### 🦠 Unit Tests
- **chat message:** Prepare tests to validate ownership of message (e46a8d4b)
- **validator:** Prepare test to ensure complete denial (fb93e588)
- **chat message:** Prepare tests route to upload chat message with file (baf60600)
- **chat message:** Prepare tests to ensure ownership is being validated (0f24f833)
- **policy:** Prepare test to ensure route is exclusive to one user (c1d36198)
- **manager:** Prepare tests to check if model belongs to resource (f05f1dc7)
- **policy:** Allow setting permission combinations that can bypass (bbc20dca)
- **validator:** Prepare test to exempt same values (68958d0f)
- **validator:** Ensure IDs are string (e0929fbc)
- **employee schedule:** Prepare tests to update employee schedule (003377ac)
- **employee schedule:** Add test to ensure to accept same info (ee759afd)
- **employee schedule:** Prepare tests to check uniqueness before create (ccfc13dd)
- **employee schedule:** Prepare tests to ensure user is the right kind (bb1b527d)
- **employee schedule:** Prepare test to create schedules for others (71d52f1f)
- **chat message:** Use policy to check for ownership (cba85351)
- **validator:** Prepare validator for logical or validator (3dc19247)
- **validator:** Check using try and catch (bdbd1dde)
- **consultation:** Assert two errors due to `or` validator (1e1829c3)
- **consultation:** Ensure to receive a schedule using string (63632ac8)
- **consultation:** Ensure scheduled start time is string (bdc655fc)
- **consultation:** Fix the consultation scheduled start time (5da6ab54)
- **chat message:** Prepare tests to make route to list chat messages (f12b87ac)
- **chat message:** Ensure that there are two validation error to show (ebf6e4de)
- **chat message:** Make consultations joined into a string (adc82d79)
- **consultation:** Prepare tests for rendering chat messages (86de9f3c)
- **consultation:** Provide user detail to prevent prop drilling (e067c62e)
- **consultation:** Ensure placement is a separate element (5e0d6712)
- **consultation:** Prepare test to render chat message with picture (10c99700)
- **manager:** Skip some time tests for employee schedule manager (15fd9e97)
- **helper:** Pass with the correct type (554f110d)
- **query:** Prepare the tests for filtering message by kind (82724e4c)
- **query:** Rename the test to sift by kinds (76b47bed)
- **query:** Pretend the inputs are correct (245f6e4f)
- **query:** Correct the expected options (b849af81)
- **component:** Fix component look up (67682940)
- **attached chat file:** Prepare test to destroy attached chat file (1507fb22)
- **server:** Prepare test to trim destroy routes (3412e5e6)
- **attached chat file:** Update tests to delete attached chat files (b1e6e785)
- **manager:** Prepare test for attached chat file manager (f364d9f3)
- **manager:** Prepare test to check if a role is the only one related (35f938a7)
- **manager:** Ensure unattached users cannot be checked (63504437)
- **validator:** Make validator to check if role is the only role (f3e5e4b5)
- **validator:** Remove dependency to manager based constraints (c698af46)
- **role:** Update the tests to delete roles (f2b951de)
- **role:** Ensure user has other roles before deletion (cc38463d)
- **consultation:** Prepare tests to start the consultation properly (50eb8484)
- **consultation:** Prepare test to auto-terminate the consultation (6c576be1)
- **consultation:** Remove client request to create the status message (91d20618)
- **consultation:** Correct the test data (f9200d6b)

### 🕷 Integration Tests
- **chat message:** Ensure message to create comes from same user (c7ec603e)
- **employee schedule:** Modify the test to create for others (8b47ed8f)
- **chat message:** Make integration test to ensure listing of messages (65d8bc44)
- **consultation:** Prepare test to check if starting consultation works (d82d1956)
- **consultation:** Skip the test to starting consultation temporarily (56429cc9)
- **page:** Fix the integration tests due to updates (c48a0fd8)
- **attached chat file:** Prepare test to delete attached chat message (870e37c1)
- **role:** Ensure user has other roles before archiving target roles (232aa3f2)
- **consultation:** Prepare test for auto-termination (7225ae77)
- **consultation:** Ensure the timers are correct (d160f543)

#### ⚠️  Breaking Changes
- **validator:** ⚠️  Rename the validator for checking user ownership (66bf37e6)
- **server:** ⚠️  Move base manager class type to dependent (8d2134c9)
- **share:** ⚠️  Remove some relationships in attributes (26b41dbe)
- **database:** ⚠️  Apply organizational changes in the database (0bbef124)
- **server:** ⚠️  Apply organizational changes in the server (74fa2212)
- **route:** ⚠️  Apply organizational changes in the routes (fc0af83c)
- **rule set:** ⚠️  Make extra queries optional in object (4c061768)

### ❤️  Contributors
- Ardrin Gregorio
- Kenneth Trecy Tobias
