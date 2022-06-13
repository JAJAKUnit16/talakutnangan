import { Op } from "sequelize"

import Role from "%/models/role"
import User from "%/models/user"
import hash from "!/helpers/auth/hash"
import compare from "!/helpers/auth/compare"
import Department from "%/models/department"
import type { Criteria, RawUser } from "%/types"

export default class UserManager {
	async findWithCredentials(email: string, password: string): Promise<User|null> {
		const foundUser = await User.findOne({
			where: {
				email
			},
			include: [ Role, Department ]
		})

		if (foundUser !== null && await compare(password, foundUser.password)) {
			return foundUser
		} else {
			return null
		}
	}

	async findWithID(id: number): Promise<User|null> {
		return await User.findOne({ where: { id } })
	}

	async create(details: RawUser): Promise<User> {
		details.password = await hash(details.password!)
		return await User.create({ ...details })
	}

	async list(criteria: Criteria|null): Promise<Array<User>> {
		const options: { [key: string]: object } = {}

		switch(criteria) {
			case "admitted": { // Complete profile and admitted
				// TODO
				break
			}
			case "unadmitted": { // Complete profile but not admitted
				options.emailVerifiedAt =  { [Op.not]: null }
				options.signature = { [Op.not]: null }
				options.admittedAt = { [Op.is]: null }
				break
			}
			case "incomplete": { // Incomplete profile
				// TODO
				break
			}
			default: // All users
		}

		const users = await User.findAll({ where: options })
		return users
	}

	async admit(id: number, confirm: boolean): Promise<number> {
		if (confirm) {
			const [ affectedCount ] = await User.update({
				admittedAt: new Date()
			}, {
				where: {
					id,
					admittedAt: { [Op.is]: null }
				}
			})

			return affectedCount
		} else {
			// TODO: Delete account and send e-mail
			return 1
		}
	}

	async verify(email: string): Promise<number> {
		const [ affectedCount ] = await User.update({
			emailVerifiedAt: new Date()
		}, {
			where: {
				email,
				emailVerifiedAt: { [Op.is]: null }
			}
		})

		return affectedCount
	}

	/**
	 * Resets password and returns true if it has been successfully changed.
	 * @param id ID of the user to reset the password.
	 * @param rawPassword New password to put in the database.
	 */
	async resetPassword(id: number, rawPassword: string): Promise<boolean> {
		// TODO: use the student number or random password
		const hashedPassword = await hash(rawPassword)

		const [ affectedCount ] = await User.update({
			password: hashedPassword
		}, {
			where: {
				id
			}
		})

		return affectedCount > 0
	}
}
