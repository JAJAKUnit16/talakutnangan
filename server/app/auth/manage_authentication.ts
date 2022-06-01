import passport from "passport"
import LocalStrategy from "passport-local"
import User from "%/models/user"
import UserManager from "%/managers/user_manager"

export default async function() {
	passport.use(new LocalStrategy(
		{
			usernameField: "email",
			passwordField: "password"
		},
		(email: string, password: string, done: Function) => {
			const manager = new UserManager()

			manager.findWithCredentials(email, password).then(foundUser => {
				if (foundUser === null) {
					done(null, false, "User not found")
				} else {
					done(null, foundUser)
				}
			})
		}
	))

	passport.serializeUser((user: User, done: Function) => {
		return done(null, user.id)
	})

	passport.deserializeUser(async (id, done: Function) => {
		const manager = new UserManager()

		const user = await manager.findWithID(id)
		// TODO: encrypt user password
		return done(null, user)
	})
}
