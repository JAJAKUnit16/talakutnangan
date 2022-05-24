import { MigrationInterface, QueryRunner, Table } from "typeorm";
import getDateType from "!/data_source/get_date_type"

export class user1653363604581 implements MigrationInterface {
	name = 'user1653363604581'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "user",
				columns: [
					{
						name: "id",
						type: "int",
						isPrimary: true,
						isGenerated: true,
						generationStrategy: "increment"
					},
					{
						name: "email",
						type: "varchar",
						isNullable: false,
						isUnique: true
					},
					{
						name: "password",
						type: "varchar",
						isNullable: false
					},
					{
						name: "admittedAt",
						type: getDateType(queryRunner.connection),
						isNullable: true,
						default: null
					},
					{
						name: "emailVerifiedAt",
						type: getDateType(queryRunner.connection),
						isNullable: true,
						default: null
					}
				]
			}),
			true
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("user");
	}
}
