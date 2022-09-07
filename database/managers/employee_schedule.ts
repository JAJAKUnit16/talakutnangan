import { Pipe } from "$/types/database"
import type { EmployeeScheduleQueryParameters } from "$/types/query"
import type { EmployeeScheduleAttributes } from "$/types/documents/employee_schedule"
import type { ModelCtor, FindAndCountOptions, DestroyOptions } from "%/types/dependent"

import Log from "$!/singletons/log"
import BaseManager from "%/managers/base"
import Consultation from "%/models/consultation"
import Condition from "%/managers/helpers/condition"
import EmployeeSchedule from "%/models/employee_schedule"
import siftByDay from "%/queries/employee_schedule/sift_by_day"
import siftByUser from "%/queries/employee_schedule/sift_by_user"
import siftByRange from "%/queries/employee_schedule/sift_by_range"
import EmployeeScheduleTransformer from "%/transformers/employee_schedule"

interface RawEmployeeScheduleAttributes extends EmployeeScheduleAttributes<"serialized"> {
	userID: number
}

export default class extends BaseManager<
	EmployeeSchedule,
	RawEmployeeScheduleAttributes,
	EmployeeScheduleQueryParameters<number>
> {
	get model(): ModelCtor<EmployeeSchedule> { return EmployeeSchedule }

	get transformer(): EmployeeScheduleTransformer { return new EmployeeScheduleTransformer() }

	get exposableColumns(): string[] {
		const excludedColumns = [ "userID" ]
		return super.exposableColumns.filter(columnName => {
			const isIncluded = !excludedColumns.includes(columnName)
			return isIncluded
		})
	}

	get listPipeline(): Pipe<
		FindAndCountOptions<EmployeeSchedule>,
		EmployeeScheduleQueryParameters<number>
	>[] {
		return [
			siftByDay,
			siftByUser,
			siftByRange,
			...super.listPipeline
		]
	}

	async archiveBatch(IDs: number[]): Promise<number> {
		try {
			const foundModels = await this.model.findAll({
				"where": new Condition().includedIn("userID", IDs),
				...this.transaction.transactionObject
			})
			const destroyCount = await this.model.destroy(<DestroyOptions<T>>{
				"where": { "id": IDs },
				...this.transaction.transactionObject
			})
			await Consultation.destroy(<DestroyOptions<T>>{
				"where": new Condition().or(
					...foundModels.map(model => {
						const individualCondition = new Condition()

						const currentTime = new Date()
						const targetStartTime = makeDateFromMinutesAfterMidnight(
							currentTime,
							model.scheduleStart
						)
						const targetEndTime = makeDateFromMinutesAfterMidnight(
							currentTime,
							model.scheduleEnd
						)

						individualCondition.and(
							new Condition().greaterThanOrEqual("scheduledStartAt", currentTime),
							new Condition().isOnDay("scheduledStartAt", model.dayName),
							new Condition().greaterThanOrEqual("scheduledStartAt", targetStartTime),
							new Condition().lessThanOrEqual("scheduledStartAt", targetEndTime)
						)

						return individualCondition
					})
				).build(),
				...this.transaction.transactionObject
			})

			Log.success("manager", "done archiving models")

			return destroyCount
		} catch (error) {
			throw this.makeBaseError(error)
		}
	}
}
